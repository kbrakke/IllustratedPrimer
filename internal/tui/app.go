package tui

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/kbrakke/illustrated-primer/internal/ai"
	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/models"
)

// AppMode represents the current mode/screen of the application.
type AppMode int

const (
	ModeUserSelection AppMode = iota
	ModeStoryList
	ModeStoryView
	ModeChat
)

// Model is the main application state for BubbleTea.
type Model struct {
	// State
	mode    AppMode
	running bool

	// Data
	users        []models.User
	stories      []models.Story
	pages        []models.Page
	currentUser  *models.User
	currentStory *models.Story

	// UI State
	selectedIndex       int
	inputBuffer         string
	conversationHistory []string
	streamingResponse   string
	isLoading           bool
	statusMessage       string

	// BubbleTea components
	textInput textinput.Model
	spinner   spinner.Model

	// Dependencies
	db       *db.Database
	aiClient ai.Client
	logger   *slog.Logger

	// Dimensions
	width  int
	height int
}

// Messages for async operations
type usersLoadedMsg struct {
	users []models.User
	err   error
}

type storiesLoadedMsg struct {
	stories []models.Story
	err     error
}

type pagesLoadedMsg struct {
	pages []models.Page
	err   error
}

type aiChunkMsg struct {
	content string
}

type aiDoneMsg struct {
	fullResponse string
}

type aiErrorMsg struct {
	err error
}

type storyCreatedMsg struct {
	story *models.Story
	err   error
}

type pageSavedMsg struct {
	err error
}

// New creates a new TUI Model with the given dependencies.
func New(database *db.Database, aiClient ai.Client, logger *slog.Logger) Model {
	ti := textinput.New()
	ti.Placeholder = "Type your message..."
	ti.CharLimit = 1000
	ti.Width = 60

	s := spinner.New()
	s.Spinner = spinner.Dot

	return Model{
		mode:      ModeUserSelection,
		running:   true,
		textInput: ti,
		spinner:   s,
		db:        database,
		aiClient:  aiClient,
		logger:    logger,
	}
}

// Init initializes the model and returns the initial command.
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		m.spinner.Tick,
		m.loadUsers(),
	)
}

// loadUsers loads all users from the database.
func (m Model) loadUsers() tea.Cmd {
	return func() tea.Msg {
		users, err := m.db.ListUsers(context.Background())
		return usersLoadedMsg{users: users, err: err}
	}
}

// loadStories loads stories for a user.
func (m Model) loadStories(userID string) tea.Cmd {
	return func() tea.Msg {
		stories, err := m.db.ListStoriesByUser(context.Background(), userID)
		return storiesLoadedMsg{stories: stories, err: err}
	}
}

// loadPages loads pages for a story.
func (m Model) loadPages(storyID string) tea.Cmd {
	return func() tea.Msg {
		pages, err := m.db.ListPagesByStory(context.Background(), storyID)
		return pagesLoadedMsg{pages: pages, err: err}
	}
}

// sendMessage sends a message to the AI and streams the response.
func (m Model) sendMessage(message string) tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		ch, err := m.aiClient.GenerateResponseStream(ctx, message, m.conversationHistory)
		if err != nil {
			return aiErrorMsg{err: err}
		}

		// Collect the full response from the stream
		var fullResponse string
		for chunk := range ch {
			fullResponse += chunk
		}

		return aiDoneMsg{fullResponse: fullResponse}
	}
}

// createStory creates a new story.
func (m Model) createStory(title string) tea.Cmd {
	return func() tea.Msg {
		if m.currentUser == nil {
			return storyCreatedMsg{err: fmt.Errorf("no user selected")}
		}

		story := models.NewStory(m.currentUser.ID, title, "")
		err := m.db.CreateStory(context.Background(), story)
		if err != nil {
			return storyCreatedMsg{err: err}
		}
		return storyCreatedMsg{story: story}
	}
}

// savePage saves a new page to the database.
func (m Model) savePage(prompt, completion string) tea.Cmd {
	return func() tea.Msg {
		if m.currentStory == nil {
			return pageSavedMsg{err: fmt.Errorf("no story selected")}
		}

		ctx := context.Background()
		pageNum, err := m.db.GetNextPageNum(ctx, m.currentStory.ID)
		if err != nil {
			return pageSavedMsg{err: err}
		}

		page := models.NewPage(m.currentStory.ID, pageNum, prompt, completion)
		if err := m.db.CreatePage(ctx, page); err != nil {
			return pageSavedMsg{err: err}
		}

		if err := m.db.IncrementCurrentPage(ctx, m.currentStory.ID); err != nil {
			return pageSavedMsg{err: err}
		}

		return pageSavedMsg{}
	}
}

// Update handles messages and updates the model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.textInput.Width = msg.Width - 10
		return m, nil

	case tea.KeyMsg:
		return m.handleKeyPress(msg)

	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		cmds = append(cmds, cmd)

	case usersLoadedMsg:
		if msg.err != nil {
			m.statusMessage = fmt.Sprintf("Error loading users: %v", msg.err)
			m.logger.Error("failed to load users", "error", msg.err)
		} else {
			m.users = msg.users
			m.statusMessage = fmt.Sprintf("Loaded %d users", len(msg.users))
		}

	case storiesLoadedMsg:
		if msg.err != nil {
			m.statusMessage = fmt.Sprintf("Error loading stories: %v", msg.err)
			m.logger.Error("failed to load stories", "error", msg.err)
		} else {
			m.stories = msg.stories
			m.selectedIndex = 0
			m.statusMessage = fmt.Sprintf("Loaded %d stories", len(msg.stories))
		}

	case pagesLoadedMsg:
		if msg.err != nil {
			m.statusMessage = fmt.Sprintf("Error loading pages: %v", msg.err)
			m.logger.Error("failed to load pages", "error", msg.err)
		} else {
			m.pages = msg.pages
			// Rebuild conversation history from pages
			m.conversationHistory = nil
			for _, page := range msg.pages {
				m.conversationHistory = append(m.conversationHistory, page.Prompt, page.Completion)
			}
			m.statusMessage = fmt.Sprintf("Loaded %d pages", len(msg.pages))
		}

	case aiDoneMsg:
		m.isLoading = false
		m.streamingResponse = msg.fullResponse
		// Save the page
		if m.inputBuffer != "" {
			cmds = append(cmds, m.savePage(m.inputBuffer, msg.fullResponse))
			m.conversationHistory = append(m.conversationHistory, m.inputBuffer, msg.fullResponse)
			m.inputBuffer = ""
		}
		m.statusMessage = "Response received"

	case aiErrorMsg:
		m.isLoading = false
		m.statusMessage = fmt.Sprintf("AI Error: %v", msg.err)
		m.logger.Error("AI error", "error", msg.err)

	case storyCreatedMsg:
		if msg.err != nil {
			m.statusMessage = fmt.Sprintf("Error creating story: %v", msg.err)
			m.logger.Error("failed to create story", "error", msg.err)
		} else {
			m.currentStory = msg.story
			m.stories = append([]models.Story{*msg.story}, m.stories...)
			m.statusMessage = fmt.Sprintf("Created story: %s", msg.story.Title)
		}

	case pageSavedMsg:
		if msg.err != nil {
			m.logger.Error("failed to save page", "error", msg.err)
		} else {
			m.logger.Info("page saved successfully")
		}
	}

	return m, tea.Batch(cmds...)
}

// handleKeyPress processes keyboard input.
func (m Model) handleKeyPress(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	// Global quit handling
	if msg.String() == "ctrl+c" {
		m.running = false
		return m, tea.Quit
	}

	// Handle quit in non-chat modes
	if m.mode != ModeChat && msg.String() == "q" {
		m.running = false
		return m, tea.Quit
	}

	switch m.mode {
	case ModeUserSelection:
		return m.handleUserSelectionKeys(msg)
	case ModeStoryList:
		return m.handleStoryListKeys(msg)
	case ModeStoryView:
		return m.handleStoryViewKeys(msg)
	case ModeChat:
		return m.handleChatKeys(msg)
	}

	return m, nil
}

func (m Model) handleUserSelectionKeys(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "up", "k":
		if m.selectedIndex > 0 {
			m.selectedIndex--
		}
	case "down", "j":
		if m.selectedIndex < len(m.users)-1 {
			m.selectedIndex++
		}
	case "enter":
		if len(m.users) > 0 && m.selectedIndex < len(m.users) {
			m.currentUser = &m.users[m.selectedIndex]
			m.mode = ModeStoryList
			m.selectedIndex = 0
			return m, m.loadStories(m.currentUser.ID)
		}
	}
	return m, nil
}

func (m Model) handleStoryListKeys(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "up", "k":
		if m.selectedIndex > 0 {
			m.selectedIndex--
		}
	case "down", "j":
		if m.selectedIndex < len(m.stories)-1 {
			m.selectedIndex++
		}
	case "enter":
		if len(m.stories) > 0 && m.selectedIndex < len(m.stories) {
			m.currentStory = &m.stories[m.selectedIndex]
			m.mode = ModeStoryView
			return m, m.loadPages(m.currentStory.ID)
		}
	case "n":
		// Enter new story creation mode
		m.textInput.Focus()
		m.statusMessage = "Enter story title:"
		m.inputBuffer = ""
	case "esc":
		if m.textInput.Focused() {
			m.textInput.Blur()
			m.statusMessage = ""
		} else {
			m.mode = ModeUserSelection
			m.selectedIndex = 0
			m.currentUser = nil
		}
	default:
		// Handle text input for new story
		if m.textInput.Focused() {
			var cmd tea.Cmd
			m.textInput, cmd = m.textInput.Update(msg)
			if msg.String() == "enter" && m.textInput.Value() != "" {
				title := m.textInput.Value()
				m.textInput.SetValue("")
				m.textInput.Blur()
				return m, m.createStory(title)
			}
			return m, cmd
		}
	}
	return m, nil
}

func (m Model) handleStoryViewKeys(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		m.mode = ModeChat
		m.textInput.Focus()
		m.streamingResponse = ""
	case "esc":
		m.mode = ModeStoryList
		m.selectedIndex = 0
		m.currentStory = nil
		m.pages = nil
		m.conversationHistory = nil
	}
	return m, nil
}

func (m Model) handleChatKeys(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	// Don't process input while loading
	if m.isLoading {
		return m, nil
	}

	switch msg.String() {
	case "esc":
		if m.textInput.Value() != "" {
			m.textInput.SetValue("")
		} else {
			m.mode = ModeStoryView
			m.textInput.Blur()
		}
	case "enter":
		if m.textInput.Value() != "" {
			message := m.textInput.Value()
			m.inputBuffer = message
			m.textInput.SetValue("")
			m.isLoading = true
			m.statusMessage = "Thinking..."
			return m, tea.Batch(
				m.spinner.Tick,
				m.sendMessage(message),
			)
		}
	default:
		var cmd tea.Cmd
		m.textInput, cmd = m.textInput.Update(msg)
		return m, cmd
	}
	return m, nil
}

// View renders the current state of the model.
func (m Model) View() string {
	return RenderView(m)
}
