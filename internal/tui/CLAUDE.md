# TUI Module

## Purpose
This module implements the terminal user interface for the Illustrated Primer application using BubbleTea. It provides an interactive, mode-based interface for navigating users, stories, and engaging in AI-powered story conversations. The TUI supports keyboard navigation and real-time chat with streaming AI responses.

## Architecture
The module follows the Elm Architecture pattern (Model-Update-View):
- **Model (app.go)**: Application state and business logic
- **Update**: Message handling and state transitions
- **View (views.go)**: Rendering functions using Lipgloss styling
- **Keys (keys.go)**: Key binding definitions

The app uses a state machine with four modes: UserSelection, StoryList, StoryView, and Chat.

## Key Features
- Mode-based navigation (User → Story → View → Chat)
- Real-time chat with streaming AI responses
- Keyboard shortcuts (Ctrl+C/q to quit, Esc to go back, ↑/↓ for navigation)
- Async AI integration with spinner animation
- Database-backed state persistence

## Files

### keys.go
Defines the `KeyMap` struct with key bindings:
- Up/Down (↑/↓ or k/j)
- Select (Enter)
- Back (Esc)
- Quit (q or Ctrl+C)
- NewStory (n)

Implements `ShortHelp()` and `FullHelp()` for the help component.

### app.go
Implements the main BubbleTea Model:

**State:**
- `mode` - Current AppMode (UserSelection, StoryList, StoryView, Chat)
- `users`, `stories`, `pages` - Loaded data
- `currentUser`, `currentStory` - Selected items
- `selectedIndex` - List navigation position
- `inputBuffer`, `conversationHistory` - Chat state
- `isLoading`, `streamingResponse` - Async state

**Messages:**
- `usersLoadedMsg`, `storiesLoadedMsg`, `pagesLoadedMsg` - Data loading
- `aiChunkMsg`, `aiDoneMsg`, `aiErrorMsg` - AI responses
- `storyCreatedMsg`, `pageSavedMsg` - Database operations

**Methods:**
- `New(db, aiClient, logger)` - Constructor
- `Init()` - Initial command (load users)
- `Update(msg)` - Handle messages and key presses
- `View()` - Render current state

### views.go
Rendering functions using Lipgloss for styling:
- `RenderView(m)` - Main dispatch to mode-specific renderers
- `renderUserSelection(m)` - User list with selection highlight
- `renderStoryList(m)` - Stories with page counts
- `renderStoryView(m)` - All pages with prompts/completions
- `renderChat(m)` - Conversation history + input + spinner
- `wrapText(text, width)` - Text wrapping utility

**Styles:**
- `titleStyle`, `headerStyle` - Headers
- `selectedStyle`, `normalStyle` - List items
- `userMessageStyle`, `aiMessageStyle` - Chat messages
- `inputStyle`, `spinnerStyle` - Input area

## Mode Flow

```
UserSelection (startup)
    ↓ Enter (select user)
StoryList (user's stories)
    ↓ Enter (select story) | n (new story)
StoryView (story pages preview)
    ↓ Enter (start chatting)
Chat (interactive conversation)
    ↑ Esc (back to StoryView)
```

## Usage

```go
model := tui.New(database, aiClient, logger)
program := tea.NewProgram(model, tea.WithAltScreen())
program.Run()
```

## Testing
Tests cover state transitions and key handling with mock dependencies.
