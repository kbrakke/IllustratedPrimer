package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Styles
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("205")).
			MarginBottom(1)

	headerStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("39")).
			Background(lipgloss.Color("236")).
			Padding(0, 2).
			MarginBottom(1)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("170")).
			Background(lipgloss.Color("236")).
			Bold(true).
			Padding(0, 1)

	normalStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("252")).
			Padding(0, 1)

	statusStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("241")).
			MarginTop(1)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("241")).
			MarginTop(1)

	userMessageStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("82")).
				Bold(true)

	aiMessageStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("39"))

	pageNumStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("39")).
			Bold(true)

	inputStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("62")).
			Padding(0, 1)

	spinnerStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("205"))
)

// RenderView renders the appropriate view based on the current mode.
func RenderView(m Model) string {
	var content string

	switch m.mode {
	case ModeUserSelection:
		content = renderUserSelection(m)
	case ModeStoryList:
		content = renderStoryList(m)
	case ModeStoryView:
		content = renderStoryView(m)
	case ModeChat:
		content = renderChat(m)
	}

	// Add status bar
	status := statusStyle.Render(m.statusMessage)

	return lipgloss.JoinVertical(lipgloss.Left, content, status)
}

func renderUserSelection(m Model) string {
	var b strings.Builder

	b.WriteString(headerStyle.Render("Illustrated Primer - Select User"))
	b.WriteString("\n\n")

	if len(m.users) == 0 {
		b.WriteString(normalStyle.Render("No users found. Run with --seed to load sample data."))
	} else {
		for i, user := range m.users {
			name := user.DisplayName()
			email := user.DisplayEmail()
			line := fmt.Sprintf("%s <%s>", name, email)

			if i == m.selectedIndex {
				b.WriteString(selectedStyle.Render("▸ " + line))
			} else {
				b.WriteString(normalStyle.Render("  " + line))
			}
			b.WriteString("\n")
		}
	}

	b.WriteString("\n")
	b.WriteString(helpStyle.Render("↑/↓: navigate • enter: select • q: quit"))

	return b.String()
}

func renderStoryList(m Model) string {
	var b strings.Builder

	userName := ""
	if m.currentUser != nil {
		userName = m.currentUser.DisplayName()
	}

	b.WriteString(headerStyle.Render(fmt.Sprintf("Stories - %s", userName)))
	b.WriteString("\n\n")

	if m.textInput.Focused() {
		b.WriteString(normalStyle.Render("New Story Title:"))
		b.WriteString("\n")
		b.WriteString(inputStyle.Render(m.textInput.View()))
		b.WriteString("\n\n")
	}

	if len(m.stories) == 0 {
		b.WriteString(normalStyle.Render("No stories yet. Press 'n' to create one."))
	} else {
		for i, story := range m.stories {
			line := fmt.Sprintf("%s - %s", story.Title, story.PageCountDisplay())

			if i == m.selectedIndex {
				b.WriteString(selectedStyle.Render("▸ " + line))
			} else {
				b.WriteString(normalStyle.Render("  " + line))
			}
			b.WriteString("\n")
		}
	}

	b.WriteString("\n")
	b.WriteString(helpStyle.Render("↑/↓: navigate • enter: select • n: new story • esc: back • q: quit"))

	return b.String()
}

func renderStoryView(m Model) string {
	var b strings.Builder

	title := ""
	if m.currentStory != nil {
		title = m.currentStory.Title
	}

	b.WriteString(headerStyle.Render(fmt.Sprintf("Story: %s", title)))
	b.WriteString("\n\n")

	if len(m.pages) == 0 {
		b.WriteString(normalStyle.Render("No pages yet. Press Enter to start the story."))
	} else {
		for _, page := range m.pages {
			// Page header
			b.WriteString(pageNumStyle.Render(fmt.Sprintf("--- Page %d ---", page.PageNum)))
			b.WriteString("\n\n")

			// User prompt
			b.WriteString(userMessageStyle.Render("You: "))
			b.WriteString(wrapText(page.Prompt, m.width-10))
			b.WriteString("\n\n")

			// AI completion
			b.WriteString(aiMessageStyle.Render("AI: "))
			b.WriteString(wrapText(page.Completion, m.width-10))
			b.WriteString("\n\n")
		}
	}

	b.WriteString("\n")
	b.WriteString(helpStyle.Render("enter: start chat • esc: back"))

	return b.String()
}

func renderChat(m Model) string {
	var b strings.Builder

	title := ""
	if m.currentStory != nil {
		title = m.currentStory.Title
	}

	b.WriteString(headerStyle.Render(fmt.Sprintf("Chat: %s", title)))
	b.WriteString("\n\n")

	// Render conversation history
	for i := 0; i < len(m.conversationHistory); i += 2 {
		// User message
		b.WriteString(userMessageStyle.Render("You: "))
		if i < len(m.conversationHistory) {
			b.WriteString(wrapText(m.conversationHistory[i], m.width-10))
		}
		b.WriteString("\n\n")

		// AI message
		b.WriteString(aiMessageStyle.Render("AI: "))
		if i+1 < len(m.conversationHistory) {
			b.WriteString(wrapText(m.conversationHistory[i+1], m.width-10))
		}
		b.WriteString("\n\n")
	}

	// Show pending message if loading
	if m.isLoading && m.inputBuffer != "" {
		b.WriteString(userMessageStyle.Render("You: "))
		b.WriteString(wrapText(m.inputBuffer, m.width-10))
		b.WriteString("\n\n")

		b.WriteString(aiMessageStyle.Render("AI: "))
		if m.streamingResponse != "" {
			b.WriteString(wrapText(m.streamingResponse, m.width-10))
		}
		b.WriteString(spinnerStyle.Render(m.spinner.View()))
		b.WriteString("\n\n")
	}

	// Input area
	b.WriteString("\n")
	if m.isLoading {
		b.WriteString(normalStyle.Render("Waiting for response..."))
	} else {
		b.WriteString(inputStyle.Render(m.textInput.View()))
	}

	b.WriteString("\n\n")
	b.WriteString(helpStyle.Render("enter: send • esc: back"))

	return b.String()
}

// wrapText wraps text to the specified width.
func wrapText(text string, width int) string {
	if width <= 0 {
		width = 80
	}

	var result strings.Builder
	lines := strings.Split(text, "\n")

	for i, line := range lines {
		if i > 0 {
			result.WriteString("\n")
		}

		words := strings.Fields(line)
		currentLineLen := 0

		for j, word := range words {
			wordLen := len(word)

			if currentLineLen+wordLen+1 > width && currentLineLen > 0 {
				result.WriteString("\n")
				currentLineLen = 0
			}

			if currentLineLen > 0 {
				result.WriteString(" ")
				currentLineLen++
			}

			result.WriteString(word)
			currentLineLen += wordLen

			_ = j // avoid unused variable warning
		}
	}

	return result.String()
}
