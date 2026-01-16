# Illustrated Primer - Architecture Documentation

## Overview

The Go implementation of Illustrated Primer is a terminal-based educational storytelling application. It uses BubbleTea for the terminal UI, PostgreSQL for persistence, and OpenAI's GPT-5 Responses API for AI-powered story generation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         TUI Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  BubbleTea   │  │   Lipgloss   │  │   App State  │      │
│  │  (Events)    │  │  (Styling)   │  │   Machine    │      │
│  └──────┬───────┘  └──────▲───────┘  └──────┬───────┘      │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          ▼                 │                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  App Modes: UserSelection → StoryList → StoryView     │ │
│  │             → Chat → (loop back to Chat)              │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
          ┌────────▼────────┐    ┌───────▼────────┐
          │   DB Layer      │    │   AI Layer     │
          │   (pgx)         │    │   (OpenAI)     │
          └────────┬────────┘    └───────┬────────┘
                   │                      │
          ┌────────▼────────┐    ┌───────▼────────┐
          │   PostgreSQL    │    │  OpenAI API    │
          │   Database      │    │  (GPT-5)       │
          └─────────────────┘    └────────────────┘
```

## Module Structure

### 1. Models (`internal/models/`)

Defines core data structures shared across all layers.

**Files:**
- `user.go` - User model with profile info
- `story.go` - Story model with metadata
- `page.go` - Page model representing conversation turns

**Key Design Decisions:**
- UUID strings for all entity IDs
- Unix timestamps (int64) for created_at/updated_at
- Pointer types for optional fields (*string, *int64)
- JSON struct tags for serialization
- Factory methods (NewUser, NewStory, NewPage)

### 2. Database Layer (`internal/db/`)

Provides database operations using pgx with PostgreSQL.

**Files:**
- `database.go` - Connection pool, migrations, configuration
- `user.go` - User CRUD operations
- `story.go` - Story CRUD operations
- `page.go` - Page CRUD operations

**Features:**
- Connection pooling via pgxpool (max 5 connections)
- Embedded migration SQL
- Foreign key constraints with cascading deletes
- Context-based operations for cancellation
- Custom error types (ErrUserNotFound, etc.)

**Testing:**
- Integration tests use testcontainers-go for PostgreSQL
- Build tag: `integration`

### 3. AI Layer (`internal/ai/`)

Handles communication with OpenAI's GPT-5 Responses API.

**Files:**
- `client.go` - OpenAI client with streaming support
- `prompt.go` - Educational prompt templates

**Key Features:**
- Both blocking and streaming response methods
- Conversation history management
- Configurable model selection (gpt-5, gpt-5-mini, gpt-5-nano)
- Token budget management for reasoning models
- Functional options pattern for configuration

**Token Configuration:**
GPT-5 models are reasoning models that allocate output tokens to both internal reasoning and the response. Default is 4096 tokens to ensure sufficient budget for both.

**Testing:**
- Real API tests with gpt-5-nano
- Build tag: `ai`
- Requires: `AI_TESTS_ENABLED=true`

### 4. TUI Layer (`internal/tui/`)

Terminal interface built with BubbleTea and Lipgloss.

**Files:**
- `app.go` - Application state machine and BubbleTea Model
- `views.go` - Rendering functions with Lipgloss styling
- `keys.go` - Key binding definitions

**App State Machine:**
```
UserSelection → (select user) → StoryList
                                    ↓
                          (select story) → StoryView
                                              ↓
                                    (enter to chat) → Chat
                                                        ↓
                                              (send message) → (loop)
                                                        ↓
                                                (esc to go back)
```

**Keyboard Controls:**
- `↑/↓` or `k/j` - Navigate lists
- `Enter` - Select/Submit
- `Esc` - Go back
- `q` or `Ctrl+C` - Quit application
- `n` - Create new story (in StoryList mode)

### 5. Seed Data (`internal/seed/`)

Loads example data from JSON files.

**Files:**
- `loader.go` - JSON parsing and database insertion

**Usage:**
```bash
./bin/primer --seed
```

## Data Flow

### Story Creation Flow
```
User Input: "New Story"
    ↓
TUI: Capture title input
    ↓
Business Logic: Create Story model with UUID
    ↓
DB Layer: INSERT INTO stories
    ↓
TUI: Switch to Chat mode
```

### Chat Message Flow
```
User Input: "Tell me about dinosaurs"
    ↓
TUI: Capture in inputBuffer
    ↓
Business Logic:
  - Build conversation history
  - Call AI layer (streaming)
    ↓
AI Layer:
  - Build messages array (system + history + user)
  - Stream response from OpenAI
    ↓
Business Logic:
  - Collect streamed chunks
  - Create Page model
  - Save to database
    ↓
TUI: Re-render with new page
```

## Database Schema

### Tables

**users:**
- `id` (UUID, primary key)
- `name`, `email`, `image` (optional)
- `email_verified` (Unix timestamp)
- `created_at`, `updated_at` (Unix timestamps)

**stories:**
- `id` (UUID, primary key)
- `user_id` (foreign key → users)
- `title`, `summary`
- `current_page` (integer)
- `created_at`, `updated_at`

**pages:**
- `id` (UUID, primary key)
- `story_id` (foreign key → stories)
- `page_num` (unique per story)
- `prompt`, `completion`, `summary`
- `image_path`, `audio_path` (future use)
- `created_at`, `updated_at`

### Indexes
- `idx_stories_user_id` - Fast story listing per user
- `idx_pages_story_id` - Fast page listing per story

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `DATABASE_URL` | No | localhost | PostgreSQL connection URL |
| `OPENAI_MODEL` | No | gpt-5 | Model to use |
| `OPENAI_MAX_TOKENS` | No | 4096 | Max output tokens |
| `OPENAI_ORG_ID` | No | - | Organization ID |

### AI Model Options

| Model | Use Case |
|-------|----------|
| `gpt-5` | Production (default) |
| `gpt-5-mini` | Faster, cheaper |
| `gpt-5-nano` | Testing (very cheap) |

## Testing Strategy

### Unit Tests
```bash
make test-unit
```
- Model factory methods
- Helper functions
- No external dependencies

### Integration Tests
```bash
make test-integration
```
- Database CRUD operations
- Uses testcontainers for PostgreSQL
- Requires Docker

### AI Tests
```bash
make test-ai
```
- Real OpenAI API calls
- Uses gpt-5-nano for cost efficiency
- Requires `OPENAI_API_KEY`

## Error Handling

### Layered Approach
```
UI Layer     → Display user-friendly message
   ↓
Business     → Log error, update status
   ↓
DB/AI        → Return error with context
```

### Custom Errors
- `ErrUserNotFound` - User does not exist
- `ErrStoryNotFound` - Story does not exist
- `ErrPageNotFound` - Page does not exist

## Security Considerations

### Current Implementation
1. **API Key Management**: Environment variables, .env excluded from git
2. **SQL Injection Protection**: Parameterized queries via pgx
3. **Input Handling**: Minimal validation (TUI context)

### Future Enhancements
- User authentication
- Content filtering for child safety
- Rate limiting for AI calls

## Dependencies

### Core
- `github.com/charmbracelet/bubbletea` - Terminal UI framework
- `github.com/charmbracelet/lipgloss` - Styling
- `github.com/charmbracelet/bubbles` - UI components
- `github.com/jackc/pgx/v5` - PostgreSQL driver
- `github.com/google/uuid` - UUID generation

### Development
- `github.com/testcontainers/testcontainers-go` - Integration testing
- `github.com/joho/godotenv` - Environment loading

## Build and Deployment

### Development
```bash
go run ./cmd/primer
```

### Production
```bash
make build
./bin/primer
```

### Docker
```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o primer ./cmd/primer

FROM alpine:latest
COPY --from=builder /app/primer /primer
CMD ["/primer"]
```

## Project History

Originally prototyped in Next.js/React, then rewritten in Rust, and migrated to Go in January 2026 to:
- Simplify deployment and dependencies
- Leverage Go's excellent tooling and testing ecosystem
- Use BubbleTea for a modern terminal UI
- Enable easy cross-compilation

---

**Built with Go | Powered by OpenAI GPT-5 | Inspired by Neal Stephenson**
