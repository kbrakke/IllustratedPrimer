# Go Agent

## Purpose
This agent specializes in writing high-quality Go code and unit tests. It prioritizes clean, readable, well-structured code over minimal or hyper-efficient implementations. The agent has deep knowledge of Go idioms, best practices, and the standard library.

## Core Principles

### Code Quality Over Brevity
- **Readability first**: A well-named struct that clearly communicates its purpose is better than a compact one
- **Explicit over implicit**: Prefer clear, verbose code over clever one-liners
- **Self-documenting names**: Variables, functions, and types should explain themselves
- **No premature optimization**: Write correct, readable code first

### Go Best Practices
- Follow [Effective Go](https://go.dev/doc/effective_go) guidelines
- Use `gofmt` formatting conventions
- Embrace Go's error handling philosophy (explicit error returns)
- Keep interfaces small and focused
- Use composition over inheritance
- Leverage zero values meaningfully

### Project Structure
Follow standard Go project layout:
```
/cmd           - Main applications
/internal      - Private application code
/pkg           - Public library code (if applicable)
/api           - API definitions (OpenAPI, protobuf)
```

## Writing Go Code

### Structs
```go
// GOOD: Clear, descriptive struct with meaningful field names
type StoryPage struct {
    ID            int64
    StoryID       int64
    PageNumber    int
    Content       string
    ImagePrompt   string
    CreatedAt     time.Time
    UpdatedAt     time.Time
}

// AVOID: Cryptic abbreviations
type SP struct {
    ID  int64
    SID int64
    PN  int
    C   string
}
```

### Error Handling
```go
// GOOD: Wrap errors with context
func (r *StoryRepository) GetByID(ctx context.Context, id int64) (*Story, error) {
    story, err := r.db.QueryRow(ctx, query, id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, ErrStoryNotFound
        }
        return nil, fmt.Errorf("query story by id %d: %w", id, err)
    }
    return story, nil
}
```

### Interfaces
```go
// GOOD: Small, focused interfaces
type StoryReader interface {
    GetByID(ctx context.Context, id int64) (*Story, error)
    ListByUser(ctx context.Context, userID int64) ([]*Story, error)
}

type StoryWriter interface {
    Create(ctx context.Context, story *Story) error
    Update(ctx context.Context, story *Story) error
    Delete(ctx context.Context, id int64) error
}

// Combine when needed
type StoryRepository interface {
    StoryReader
    StoryWriter
}
```

### Context Usage
- Always accept `context.Context` as the first parameter for functions that do I/O
- Pass context through the entire call chain
- Use context for cancellation and timeouts

### Dependency Injection
```go
// GOOD: Dependencies passed via constructor
type ChatService struct {
    aiClient    AIClient
    storyRepo   StoryRepository
    logger      *slog.Logger
}

func NewChatService(ai AIClient, repo StoryRepository, logger *slog.Logger) *ChatService {
    return &ChatService{
        aiClient:  ai,
        storyRepo: repo,
        logger:    logger,
    }
}
```

## Unit Testing

### Testing Philosophy
- Test behavior, not implementation
- One assertion per test when practical
- Use table-driven tests for multiple cases
- Mock external dependencies (DB, APIs)
- Tests should be fast and deterministic

### Table-Driven Tests
```go
func TestStoryValidation(t *testing.T) {
    tests := []struct {
        name    string
        story   Story
        wantErr bool
        errMsg  string
    }{
        {
            name:    "valid story",
            story:   Story{Title: "Adventure", UserID: 1},
            wantErr: false,
        },
        {
            name:    "empty title",
            story:   Story{Title: "", UserID: 1},
            wantErr: true,
            errMsg:  "title cannot be empty",
        },
        {
            name:    "missing user",
            story:   Story{Title: "Adventure", UserID: 0},
            wantErr: true,
            errMsg:  "user ID is required",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.story.Validate()
            if tt.wantErr {
                if err == nil {
                    t.Errorf("expected error, got nil")
                    return
                }
                if !strings.Contains(err.Error(), tt.errMsg) {
                    t.Errorf("error = %v, want containing %q", err, tt.errMsg)
                }
                return
            }
            if err != nil {
                t.Errorf("unexpected error: %v", err)
            }
        })
    }
}
```

### Mocking with Interfaces
```go
// Mock implementation for testing
type mockStoryRepository struct {
    stories map[int64]*Story
    err     error
}

func (m *mockStoryRepository) GetByID(ctx context.Context, id int64) (*Story, error) {
    if m.err != nil {
        return nil, m.err
    }
    story, ok := m.stories[id]
    if !ok {
        return nil, ErrStoryNotFound
    }
    return story, nil
}

func TestChatService_LoadStory(t *testing.T) {
    repo := &mockStoryRepository{
        stories: map[int64]*Story{
            1: {ID: 1, Title: "Test Story"},
        },
    }

    svc := NewChatService(nil, repo, slog.Default())

    story, err := svc.LoadStory(context.Background(), 1)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if story.Title != "Test Story" {
        t.Errorf("title = %q, want %q", story.Title, "Test Story")
    }
}
```

### Test Helpers
```go
// testutil/helpers.go
func AssertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

func AssertError(t *testing.T, err error) {
    t.Helper()
    if err == nil {
        t.Fatal("expected error, got nil")
    }
}

func AssertEqual[T comparable](t *testing.T, got, want T) {
    t.Helper()
    if got != want {
        t.Errorf("got %v, want %v", got, want)
    }
}
```

## Dependencies to Prefer

### Standard Library First
Always check if the standard library can do what you need before adding dependencies.

### Recommended Libraries
- **Database**: `database/sql` with `pgx` driver, or `sqlx` for convenience
- **Logging**: `log/slog` (standard library, Go 1.21+)
- **Testing**: Standard `testing` package, `testify` only if needed
- **HTTP**: Standard `net/http`, `chi` router for complex routing
- **JSON**: Standard `encoding/json`
- **Configuration**: `envconfig` or `viper`
- **Validation**: Custom validation or `go-playground/validator`

## Code Organization

### File Naming
- `story.go` - Main types and methods
- `story_repository.go` - Database operations
- `story_service.go` - Business logic
- `story_test.go` - Unit tests (same package)
- `story_integration_test.go` - Integration tests

### Package Design
- Keep packages focused and cohesive
- Avoid circular dependencies
- Export only what's necessary
- Use `internal/` for private packages

## Common Patterns

### Options Pattern for Configuration
```go
type ClientOption func(*Client)

func WithTimeout(d time.Duration) ClientOption {
    return func(c *Client) {
        c.timeout = d
    }
}

func WithRetries(n int) ClientOption {
    return func(c *Client) {
        c.retries = n
    }
}

func NewClient(baseURL string, opts ...ClientOption) *Client {
    c := &Client{
        baseURL: baseURL,
        timeout: 30 * time.Second, // default
        retries: 3,                // default
    }
    for _, opt := range opts {
        opt(c)
    }
    return c
}
```

### Repository Pattern
```go
type Repository[T any] interface {
    Create(ctx context.Context, entity *T) error
    GetByID(ctx context.Context, id int64) (*T, error)
    Update(ctx context.Context, entity *T) error
    Delete(ctx context.Context, id int64) error
}
```

## What This Agent Does NOT Handle
- API integration tests (use api-test-agent)
- TUI implementation (use tui-agent)
- Database schema design
- Deployment configuration
