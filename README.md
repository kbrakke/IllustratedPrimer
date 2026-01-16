# Illustrated Primer

> An AI-powered interactive learning platform for children, inspired by "The Diamond Age" by Neal Stephenson.

A lightweight, educational storytelling application that adapts to children's learning pace. Built in Go with BubbleTea for a beautiful terminal interface.

## Overview

The Illustrated Primer provides an interactive learning experience where children engage with AI-powered stories that teach relevant, age-appropriate subjects including science, math, history, and critical thinking skills. The AI follows the child's lead, weaving educational content naturally into the narrative.

**Target Audience**: Children ages 2-8
**AI Model**: GPT-5 (with gpt-5-nano for testing)
**Database**: PostgreSQL
**Current Status**: Production-ready terminal UI

## Features

- **Interactive AI Storytelling**: GPT-5-powered narratives that adapt to each child
- **Educational Focus**: Seamlessly incorporates learning into engaging stories
- **Multi-User Support**: Individual story libraries for each child
- **Persistent History**: All conversations saved and browsable
- **Beautiful TUI**: Built with BubbleTea and Lipgloss for a polished terminal experience
- **Streaming Responses**: Real-time AI response streaming with visual feedback
- **Comprehensive Testing**: Unit, integration, and API tests included

## Quick Start

### Prerequisites

- Go 1.22+ ([install](https://go.dev/dl/))
- PostgreSQL 14+ ([install](https://www.postgresql.org/download/))
- Docker (for running integration tests)
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/kbrakke/illustrated-primer.git
cd illustrated-primer

# Install dependencies
go mod download

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and DATABASE_URL

# Create PostgreSQL database
createdb primer

# Build the application
make build

# Run with seed data (first time)
./bin/primer --seed

# Or run normally
./bin/primer
```

### First Story

1. **Select a user** (seed data includes "Princess Nellodee")
2. **Select a story** or press `n` to create a new one
3. **View existing pages** or press Enter to start chatting
4. **Start chatting**: "Tell me about planets"
5. **Continue the conversation**: The AI will guide educational discussions

### Controls

| Key | Action |
|-----|--------|
| `↑` / `↓` or `k` / `j` | Navigate lists |
| `Enter` | Select / Submit |
| `Esc` | Go back |
| `Ctrl+C` or `q` | Quit |
| `n` | New story (in Story List) |

## Architecture

```
illustrated-primer/
├── cmd/
│   └── primer/
│       └── main.go           # Application entry point
├── internal/
│   ├── ai/                   # OpenAI GPT-5 client
│   │   ├── client.go         # API client with streaming
│   │   └── prompt.go         # System prompt template
│   ├── db/                   # PostgreSQL database layer
│   │   ├── database.go       # Connection and migrations
│   │   ├── user.go           # User CRUD operations
│   │   ├── story.go          # Story CRUD operations
│   │   └── page.go           # Page CRUD operations
│   ├── models/               # Data models
│   │   ├── user.go
│   │   ├── story.go
│   │   └── page.go
│   ├── tui/                  # Terminal UI (BubbleTea)
│   │   ├── app.go            # Main application model
│   │   ├── views.go          # View rendering (Lipgloss)
│   │   └── keys.go           # Key bindings
│   └── seed/                 # Seed data loader
├── testutil/                 # Test utilities
│   ├── database.go           # Testcontainers PostgreSQL
│   └── mock_ai.go            # Mock AI client
├── migrations/               # Database migrations
├── seed/                     # Seed data (JSON)
├── go.mod
├── Makefile
└── README.md
```

**Tech Stack**:
- **Language**: Go 1.22
- **UI**: BubbleTea + Bubbles + Lipgloss
- **Database**: PostgreSQL with pgx driver
- **AI**: OpenAI GPT-5 Responses API
- **Testing**: Go testing + testcontainers

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Required
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgres://user:pass@localhost:5432/primer?sslmode=disable

# Optional
OPENAI_ORG_ID=org-your-org-id
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_TOKENS=4096
```

### AI Model Options

| Model | Use Case |
|-------|----------|
| `gpt-5` | Production (default) |
| `gpt-5-mini` | Faster, cheaper |
| `gpt-5-nano` | Testing (very cheap) |

## Testing

```bash
# Run unit tests only (fast, no external dependencies)
make test-unit

# Run integration tests (requires Docker for testcontainers)
make test-integration

# Run AI tests (requires OPENAI_API_KEY, uses gpt-5-nano)
make test-ai

# Run all tests
make test-all

# Generate coverage report
make coverage
```

## Development

### Building

```bash
make build          # Build binary to bin/primer
make run            # Run without building
make run-seed       # Run with seed data
make run-debug      # Run with debug logging
```

### Code Quality

```bash
make fmt            # Format code
make lint           # Run linter (requires golangci-lint)
```

### Makefile Targets

```bash
make help           # Show all available targets
```

## Documentation

Each package has a `CLAUDE.md` file documenting its purpose and architecture:

- `internal/ai/CLAUDE.md` - AI client documentation
- `internal/db/CLAUDE.md` - Database layer documentation
- `internal/models/CLAUDE.md` - Data models documentation
- `internal/tui/CLAUDE.md` - TUI documentation

## Project History

Originally prototyped in Next.js/React, then rewritten in Rust, and now migrated to Go in January 2026 to:
- Simplify deployment and dependencies
- Leverage Go's excellent tooling and testing ecosystem
- Use BubbleTea for a modern terminal UI
- Enable easy cross-compilation

---

**Built with Go • Powered by OpenAI GPT-5 • Inspired by Neal Stephenson**
