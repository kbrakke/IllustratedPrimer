# Getting Started with Illustrated Primer

## Quick Start Guide

### 1. Prerequisites

```bash
# Check Go installation
go version
# Expected: go1.22.0 or higher

# Check PostgreSQL
psql --version
# Expected: 14.0 or higher

# Check Docker (for integration tests)
docker --version
```

**Install if needed:**
- Go: https://go.dev/dl/
- PostgreSQL: https://www.postgresql.org/download/
- Docker: https://docs.docker.com/get-docker/

### 2. Environment Setup

```bash
# Clone the repository
git clone https://github.com/kbrakke/illustrated-primer.git
cd illustrated-primer

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Get your API key from: https://platform.openai.com/api-keys
```

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-...your-key-here...
DATABASE_URL=postgres://primer:primer@localhost:5432/primer?sslmode=disable

# Optional
OPENAI_MODEL=gpt-5
OPENAI_MAX_TOKENS=4096
```

### 3. Database Setup

```bash
# Create the database
createdb primer

# Or with user/password
psql -c "CREATE USER primer WITH PASSWORD 'primer';"
psql -c "CREATE DATABASE primer OWNER primer;"
```

### 4. Build and Run

```bash
# Install dependencies
go mod download

# Build the application
make build

# Run with seed data (first time)
./bin/primer --seed

# Or run normally
./bin/primer
```

## Understanding the Interface

### Navigation Flow

```
┌──────────────────┐
│  User Selection  │ ← Start here
└────────┬─────────┘
         │ Select user (Enter)
         ▼
┌──────────────────┐
│   Story List     │
└────────┬─────────┘
         │ Select story (Enter) OR Create new (n)
         ▼
┌──────────────────┐
│   Story View     │
└────────┬─────────┘
         │ Press Enter to chat
         ▼
┌──────────────────┐
│   Chat Mode      │ ← Interactive AI conversation
└──────────────────┘
```

### Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Navigate up | `↑` or `k` |
| Navigate down | `↓` or `j` |
| Select / Submit | `Enter` |
| Go back | `Esc` |
| Create new story | `n` (in Story List) |
| Quit application | `q` or `Ctrl+C` |

## First Conversation

1. **Start the app**: `./bin/primer --seed`
2. **Select a user**: Use arrow keys, press Enter (try "Princess Nellodee")
3. **Select or create a story**:
   - Select an existing story, OR
   - Press `n` to create a new one
   - Type a title like "Space Adventure"
   - Press Enter
4. **View the story**: See existing pages or start fresh
5. **Start chatting**:
   - Press Enter to enter chat mode
   - Type your first message: "Tell me about planets"
   - Press Enter
   - Watch the AI response stream in real-time
6. **Continue the story**: Keep chatting! Each exchange is saved as a page.

## Troubleshooting

### Problem: "OPENAI_API_KEY must be set"

**Solution:**
```bash
# Check if .env exists
ls -la .env

# If missing, create it
cp .env.example .env

# Edit and add your API key
nano .env  # or your preferred editor
```

### Problem: "Failed to connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep primer

# Create if missing
createdb primer

# Verify connection URL in .env
cat .env | grep DATABASE_URL
```

### Problem: "Empty response from OpenAI"

**Cause:** Reasoning models need sufficient tokens for both reasoning and output.

**Solution:**
```bash
# Increase token limit in .env
OPENAI_MAX_TOKENS=8192
```

### Problem: Build fails

**Solution:**
```bash
# Update Go modules
go mod tidy

# Clean and rebuild
make clean
make build
```

### Problem: Terminal display issues

**Solution:**
```bash
# Check terminal capabilities
echo $TERM
tput colors

# Try setting TERM explicitly
export TERM=xterm-256color
./bin/primer
```

## Development Workflow

### Running in Development Mode

```bash
# Run directly without building
go run ./cmd/primer

# With seed data
go run ./cmd/primer --seed

# With debug logging
go run ./cmd/primer --debug
```

### Running Tests

```bash
# Unit tests only (fast, no dependencies)
make test-unit

# Integration tests (requires Docker)
make test-integration

# AI tests (requires OPENAI_API_KEY)
make test-ai

# All tests
make test-all

# With coverage
make coverage
```

### Code Quality

```bash
# Format code
make fmt

# Run linter
make lint
```

## Understanding the Codebase

### Directory Structure

```
illustrated-primer/
├── cmd/
│   └── primer/
│       └── main.go           # Application entry point
├── internal/
│   ├── ai/                   # OpenAI GPT-5 client
│   │   ├── client.go         # API client with streaming
│   │   ├── client_test.go    # AI tests (requires API key)
│   │   └── prompt.go         # System prompt template
│   ├── db/                   # PostgreSQL database layer
│   │   ├── database.go       # Connection and migrations
│   │   ├── user.go           # User CRUD
│   │   ├── story.go          # Story CRUD
│   │   └── page.go           # Page CRUD
│   ├── models/               # Data models
│   │   ├── user.go
│   │   ├── story.go
│   │   └── page.go
│   ├── tui/                  # Terminal UI (BubbleTea)
│   │   ├── app.go            # Main application model
│   │   ├── views.go          # View rendering
│   │   └── keys.go           # Key bindings
│   └── seed/                 # Seed data loader
├── migrations/               # Database migrations
├── seed/                     # Seed data (JSON)
├── testutil/                 # Test utilities
├── go.mod
├── Makefile
└── README.md
```

### Key Concepts

**App State Machine:**
```
UserSelection → StoryList → StoryView → Chat
```

**Database Flow:**
```
User creates story → Story saved to DB
User sends message → AI responds → Page saved to DB
```

**AI Integration:**
```
User input → Build conversation history → OpenAI API → Stream response
```

## Advanced Usage

### Customizing the AI Model

Set in `.env`:
```env
# Production (most capable)
OPENAI_MODEL=gpt-5

# Faster and cheaper
OPENAI_MODEL=gpt-5-mini

# Testing (very cheap)
OPENAI_MODEL=gpt-5-nano
```

### Adjusting Token Limits

```env
# Default (good for most stories)
OPENAI_MAX_TOKENS=4096

# For longer responses
OPENAI_MAX_TOKENS=8192
```

### Using a Different Database

Edit `DATABASE_URL` in `.env`:
```env
# Local with custom credentials
DATABASE_URL=postgres://myuser:mypass@localhost:5432/mydb?sslmode=disable

# Remote database
DATABASE_URL=postgres://user:pass@db.example.com:5432/primer?sslmode=require
```

### Debug Logging

```bash
# Enable debug mode
./bin/primer --debug

# Check log files
ls -la logs/
tail -f logs/tui_*.log
```

## Documentation

Each package has a `CLAUDE.md` file documenting its purpose:

- `internal/ai/CLAUDE.md` - AI client documentation
- `internal/db/CLAUDE.md` - Database layer documentation
- `internal/models/CLAUDE.md` - Data models documentation
- `internal/tui/CLAUDE.md` - TUI documentation

## Getting Help

### Documentation
- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [Go Documentation](https://go.dev/doc/)
- [BubbleTea Guide](https://github.com/charmbracelet/bubbletea)

### Common Issues Checklist
- [ ] `.env` file exists with valid API key
- [ ] PostgreSQL is running and database exists
- [ ] Go 1.22+ installed
- [ ] Docker running (for integration tests)
- [ ] `go mod download` completed successfully

### Debugging Tips

```bash
# Check environment
cat .env

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# View recent logs
tail -100 logs/tui_*.log

# Run with verbose output
./bin/primer --debug
```

## Success Metrics

You'll know it's working when:
- Application starts and shows User Selection screen
- Can navigate through users and stories
- Can create a new story
- AI responds within 5-15 seconds (depending on model)
- Conversation history persists across app restarts
- Pages are saved to the database

Happy storytelling!
