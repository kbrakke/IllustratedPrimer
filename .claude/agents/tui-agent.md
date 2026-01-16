# TUI Agent

## Purpose
This agent specializes in building terminal user interfaces using the BubbleTea framework in Go. It understands how to create intuitive, responsive TUIs that navigate database content, display information attractively, and interact with AI and data APIs.

## BubbleTea Fundamentals

### The Elm Architecture
BubbleTea follows the Elm Architecture pattern:
1. **Model**: Application state
2. **Update**: Handle messages and update state
3. **View**: Render state to string

```go
package main

import (
    tea "github.com/charmbracelet/bubbletea"
)

type model struct {
    // Application state
}

func (m model) Init() tea.Cmd {
    // Return initial command (or nil)
    return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    // Handle messages, return updated model and commands
    return m, nil
}

func (m model) View() string {
    // Render the UI as a string
    return "Hello, World!"
}
```

### Messages and Commands
```go
// Custom message types
type storyLoadedMsg struct {
    story *Story
}

type errorMsg struct {
    err error
}

type tickMsg time.Time

// Commands are functions that return messages
func loadStory(id int64) tea.Cmd {
    return func() tea.Msg {
        story, err := repository.GetByID(context.Background(), id)
        if err != nil {
            return errorMsg{err}
        }
        return storyLoadedMsg{story}
    }
}
```

## Charm Libraries Stack

### Core Libraries
- **BubbleTea**: The main TUI framework
- **Bubbles**: Pre-built components (text input, viewport, list, etc.)
- **Lipgloss**: Styling and layout

### Bubbles Components
```go
import (
    "github.com/charmbracelet/bubbles/list"
    "github.com/charmbracelet/bubbles/textinput"
    "github.com/charmbracelet/bubbles/viewport"
    "github.com/charmbracelet/bubbles/spinner"
)
```

### Lipgloss Styling
```go
import "github.com/charmbracelet/lipgloss"

var (
    titleStyle = lipgloss.NewStyle().
        Bold(true).
        Foreground(lipgloss.Color("205")).
        MarginLeft(2)

    selectedStyle = lipgloss.NewStyle().
        Foreground(lipgloss.Color("170")).
        Background(lipgloss.Color("236")).
        Padding(0, 1)

    normalStyle = lipgloss.NewStyle().
        Foreground(lipgloss.Color("252")).
        Padding(0, 1)

    borderStyle = lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(lipgloss.Color("62")).
        Padding(1, 2)
)
```

## Application Architecture

### State Machine Pattern
For navigation-heavy TUIs, use a state machine:

```go
type AppState int

const (
    StateUserSelect AppState = iota
    StateStoryList
    StateStoryView
    StateChat
    StateLoading
    StateError
)

type Model struct {
    state       AppState
    prevState   AppState  // For back navigation

    // Data
    users       []User
    stories     []Story
    pages       []Page
    currentUser *User
    currentStory *Story

    // UI Components
    list        list.Model
    viewport    viewport.Model
    textInput   textinput.Model
    spinner     spinner.Model

    // State
    loading     bool
    err         error
    width       int
    height      int
}
```

### Navigation Pattern
```go
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        switch msg.String() {
        case "ctrl+c", "q":
            return m, tea.Quit
        case "esc":
            return m.goBack(), nil
        case "enter":
            return m.handleSelect()
        }
    case tea.WindowSizeMsg:
        m.width = msg.Width
        m.height = msg.Height
        return m, nil
    }

    // Delegate to current state handler
    return m.updateCurrentState(msg)
}

func (m Model) goBack() Model {
    switch m.state {
    case StateStoryList:
        m.state = StateUserSelect
    case StateStoryView:
        m.state = StateStoryList
    case StateChat:
        m.state = StateStoryView
    }
    return m
}
```

## Database Navigation UI

### List Component for Database Records
```go
// Implement list.Item interface for your types
type storyItem struct {
    story *Story
}

func (i storyItem) Title() string       { return i.story.Title }
func (i storyItem) Description() string { return i.story.Summary }
func (i storyItem) FilterValue() string { return i.story.Title }

func (m *Model) initStoryList(stories []Story) {
    items := make([]list.Item, len(stories))
    for i, s := range stories {
        items[i] = storyItem{story: &stories[i]}
    }

    m.list = list.New(items, list.NewDefaultDelegate(), m.width, m.height-4)
    m.list.Title = "Stories"
    m.list.SetShowStatusBar(true)
    m.list.SetFilteringEnabled(true)
}
```

### Viewport for Content Display
```go
func (m *Model) initPageViewport(page *Page) {
    m.viewport = viewport.New(m.width-4, m.height-8)
    m.viewport.SetContent(page.Content)
    m.viewport.Style = lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        Padding(1)
}

// In View()
func (m Model) renderPageView() string {
    header := titleStyle.Render(m.currentStory.Title)
    pageNum := fmt.Sprintf("Page %d", m.currentPage.PageNumber)

    return lipgloss.JoinVertical(
        lipgloss.Left,
        header,
        pageNum,
        m.viewport.View(),
        m.renderHelp(),
    )
}
```

## AI Chat Interface

### Chat Message Model
```go
type ChatMessage struct {
    Role    string // "user" or "assistant"
    Content string
    Time    time.Time
}

type ChatModel struct {
    messages    []ChatMessage
    input       textinput.Model
    viewport    viewport.Model
    spinner     spinner.Model
    waiting     bool
}
```

### Streaming AI Responses
```go
// Message for streaming chunks
type aiChunkMsg struct {
    content string
    done    bool
}

// Command to start streaming
func streamAIResponse(client AIClient, messages []ChatMessage) tea.Cmd {
    return func() tea.Msg {
        // This returns the first chunk; subsequent chunks come through subscription
        ctx := context.Background()
        chunk, done, err := client.StreamNext(ctx)
        if err != nil {
            return errorMsg{err}
        }
        return aiChunkMsg{content: chunk, done: done}
    }
}

// Handle streaming in Update
func (m ChatModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case aiChunkMsg:
        // Append to current assistant message
        if len(m.messages) > 0 {
            last := &m.messages[len(m.messages)-1]
            if last.Role == "assistant" {
                last.Content += msg.content
            }
        }

        if msg.done {
            m.waiting = false
            return m, nil
        }

        // Continue streaming
        return m, streamAIResponse(m.client, m.messages)

    case tea.KeyMsg:
        if msg.String() == "enter" && !m.waiting {
            userMsg := m.input.Value()
            m.messages = append(m.messages, ChatMessage{
                Role:    "user",
                Content: userMsg,
                Time:    time.Now(),
            })
            m.messages = append(m.messages, ChatMessage{
                Role: "assistant",
                Time: time.Now(),
            })
            m.input.Reset()
            m.waiting = true
            return m, tea.Batch(
                m.spinner.Tick,
                streamAIResponse(m.client, m.messages),
            )
        }
    }
    return m, nil
}
```

### Chat View Layout
```go
func (m ChatModel) View() string {
    var chatContent strings.Builder

    for _, msg := range m.messages {
        style := userMessageStyle
        if msg.Role == "assistant" {
            style = assistantMessageStyle
        }
        chatContent.WriteString(style.Render(msg.Content))
        chatContent.WriteString("\n\n")
    }

    m.viewport.SetContent(chatContent.String())
    m.viewport.GotoBottom()

    inputBox := m.input.View()
    if m.waiting {
        inputBox = m.spinner.View() + " Thinking..."
    }

    return lipgloss.JoinVertical(
        lipgloss.Left,
        m.viewport.View(),
        lipgloss.NewStyle().
            Border(lipgloss.NormalBorder()).
            Render(inputBox),
    )
}
```

## Responsive Layout

### Handling Window Resize
```go
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.WindowSizeMsg:
        m.width = msg.Width
        m.height = msg.Height

        // Update all components
        m.list.SetSize(msg.Width-2, msg.Height-6)
        m.viewport.Width = msg.Width - 4
        m.viewport.Height = msg.Height - 10
        m.textInput.Width = msg.Width - 4

        return m, nil
    }
    return m, nil
}
```

### Flexible Layouts
```go
func (m Model) View() string {
    // Header
    header := headerStyle.Width(m.width).Render("Illustrated Primer")

    // Main content area
    contentHeight := m.height - 4 // Account for header and footer
    content := m.renderContent()
    content = lipgloss.NewStyle().
        Height(contentHeight).
        Width(m.width - 2).
        Render(content)

    // Footer with help
    footer := helpStyle.Render(m.renderHelp())

    return lipgloss.JoinVertical(lipgloss.Left, header, content, footer)
}
```

## Loading States and Feedback

### Spinner for Async Operations
```go
func (m Model) Init() tea.Cmd {
    return tea.Batch(
        m.spinner.Tick,
        m.loadInitialData(),
    )
}

func (m Model) renderLoading() string {
    return lipgloss.Place(
        m.width, m.height,
        lipgloss.Center, lipgloss.Center,
        m.spinner.View() + " Loading...",
    )
}
```

### Error Display
```go
var errorStyle = lipgloss.NewStyle().
    Foreground(lipgloss.Color("196")).
    Border(lipgloss.RoundedBorder()).
    BorderForeground(lipgloss.Color("196")).
    Padding(1, 2)

func (m Model) renderError() string {
    errMsg := errorStyle.Render(
        "Error: " + m.err.Error() + "\n\nPress any key to continue",
    )
    return lipgloss.Place(m.width, m.height, lipgloss.Center, lipgloss.Center, errMsg)
}
```

## Key Bindings and Help

### Help Component
```go
import "github.com/charmbracelet/bubbles/help"
import "github.com/charmbracelet/bubbles/key"

type keyMap struct {
    Up     key.Binding
    Down   key.Binding
    Select key.Binding
    Back   key.Binding
    Quit   key.Binding
}

func (k keyMap) ShortHelp() []key.Binding {
    return []key.Binding{k.Select, k.Back, k.Quit}
}

func (k keyMap) FullHelp() [][]key.Binding {
    return [][]key.Binding{
        {k.Up, k.Down, k.Select},
        {k.Back, k.Quit},
    }
}

var keys = keyMap{
    Up:     key.NewBinding(key.WithKeys("up", "k"), key.WithHelp("up/k", "up")),
    Down:   key.NewBinding(key.WithKeys("down", "j"), key.WithHelp("down/j", "down")),
    Select: key.NewBinding(key.WithKeys("enter"), key.WithHelp("enter", "select")),
    Back:   key.NewBinding(key.WithKeys("esc"), key.WithHelp("esc", "back")),
    Quit:   key.NewBinding(key.WithKeys("q", "ctrl+c"), key.WithHelp("q", "quit")),
}
```

## Testing TUI Components

### Testing Update Logic
```go
func TestModel_NavigateBack(t *testing.T) {
    m := Model{state: StateStoryView}

    newModel, _ := m.Update(tea.KeyMsg{Type: tea.KeyEsc})

    result := newModel.(Model)
    if result.state != StateStoryList {
        t.Errorf("state = %v, want StateStoryList", result.state)
    }
}
```

### Testing View Output
```go
func TestModel_View_ShowsTitle(t *testing.T) {
    m := Model{
        state:        StateStoryView,
        currentStory: &Story{Title: "Test Adventure"},
        width:        80,
        height:       24,
    }

    view := m.View()

    if !strings.Contains(view, "Test Adventure") {
        t.Error("view should contain story title")
    }
}
```

## What This Agent Does NOT Handle
- Unit testing business logic (use go-agent)
- API integration testing (use api-test-agent)
- Database operations (delegate to repository layer)
- AI client implementation (delegate to service layer)
