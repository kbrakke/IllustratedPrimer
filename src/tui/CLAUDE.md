# TUI Module

## Purpose
This module implements the terminal user interface for the Illustrated Primer application using Ratatui (formerly tui-rs). It provides an interactive, mode-based interface for navigating users, stories, and engaging in AI-powered story conversations. The TUI supports keyboard navigation and real-time chat with visual feedback.

## Architecture
The module follows a Model-View-Controller (MVC) pattern:
- **Model (App)**: Application state and business logic
- **View (UI)**: Rendering functions that transform state into terminal widgets
- **Controller (Events)**: Input event handling and polling

The app uses a state machine with four modes: UserSelection, StoryList, StoryView, and Chat, each with distinct UI and input behavior.

## Key Features
- Mode-based navigation (User → Story → Pages → Chat)
- Real-time chat with loading states
- Keyboard shortcuts (Ctrl+Q to quit, Esc to go back, Arrow keys for navigation)
- Async AI integration with visual feedback
- Database-backed state persistence

## Files

### mod.rs
Exports the public TUI API including the App struct and EventHandler for external usage.

### app.rs
Implements the App struct containing all application state (current user, stories, pages, input buffer) and business logic for mode transitions, data loading, message sending, and keyboard input handling.

### events.rs
Implements the EventHandler struct that polls for terminal events (keyboard, mouse, resize) with configurable tick rates and converts crossterm events into a unified Event enum.

### ui.rs
Implements all rendering logic using Ratatui widgets, with functions for each app mode (user selection, story list, story view, chat) and components (header, status bar) with styled, bordered layouts.
