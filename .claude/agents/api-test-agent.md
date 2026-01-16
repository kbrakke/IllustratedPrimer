# API Test Agent

## Purpose
This agent specializes in comprehensive API testing for Go applications. It ensures all chat endpoints, data endpoints, and future API endpoints have complete, repeatable, and thorough tests. The agent uses testcontainers for lightweight database testing and implements cost-effective strategies for AI-connected tests.

## Testing Philosophy

### Core Principles
- **Comprehensive coverage**: Every endpoint, every edge case
- **Repeatable**: Tests run identically every time, no flakiness
- **Fast execution**: Tests should run in moments from the command line
- **Cost-conscious**: Minimize AI API calls while maintaining coverage
- **Real integration**: Test against real databases and services where practical

### Test Categories
1. **Unit tests**: Test handlers with mocked dependencies
2. **Integration tests**: Test against real database (testcontainers)
3. **AI tests**: Real API calls with cost-effective models (GPT-5-nano)
4. **End-to-end tests**: Full request/response cycle

## Testcontainers Setup

### PostgreSQL Container
```go
// testutil/database.go
package testutil

import (
    "context"
    "fmt"
    "testing"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/testcontainers/testcontainers-go/wait"
)

type TestDatabase struct {
    Container testcontainers.Container
    Pool      *pgxpool.Pool
    ConnStr   string
}

func NewTestDatabase(t *testing.T) *TestDatabase {
    t.Helper()
    ctx := context.Background()

    container, err := postgres.Run(ctx,
        "postgres:16-alpine",
        postgres.WithDatabase("test_db"),
        postgres.WithUsername("test"),
        postgres.WithPassword("test"),
        testcontainers.WithWaitStrategy(
            wait.ForLog("database system is ready to accept connections").
                WithOccurrence(2),
        ),
    )
    if err != nil {
        t.Fatalf("failed to start postgres container: %v", err)
    }

    connStr, err := container.ConnectionString(ctx, "sslmode=disable")
    if err != nil {
        t.Fatalf("failed to get connection string: %v", err)
    }

    pool, err := pgxpool.New(ctx, connStr)
    if err != nil {
        t.Fatalf("failed to connect to database: %v", err)
    }

    db := &TestDatabase{
        Container: container,
        Pool:      pool,
        ConnStr:   connStr,
    }

    // Run migrations
    if err := db.Migrate(ctx); err != nil {
        t.Fatalf("failed to run migrations: %v", err)
    }

    t.Cleanup(func() {
        pool.Close()
        container.Terminate(ctx)
    })

    return db
}

func (db *TestDatabase) Migrate(ctx context.Context) error {
    // Run your migration SQL here
    migrations := []string{
        `CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS stories (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT REFERENCES users(id),
            title TEXT NOT NULL,
            summary TEXT,
            current_page INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS pages (
            id BIGSERIAL PRIMARY KEY,
            story_id BIGINT REFERENCES stories(id),
            page_number INT NOT NULL,
            content TEXT NOT NULL,
            image_prompt TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(story_id, page_number)
        )`,
    }

    for _, m := range migrations {
        if _, err := db.Pool.Exec(ctx, m); err != nil {
            return fmt.Errorf("migration failed: %w", err)
        }
    }

    return nil
}

// SeedTestData inserts common test data
func (db *TestDatabase) SeedTestData(t *testing.T) {
    t.Helper()
    ctx := context.Background()

    _, err := db.Pool.Exec(ctx, `
        INSERT INTO users (id, name, email) VALUES
            (1, 'Test User', 'test@example.com'),
            (2, 'Another User', 'another@example.com')
        ON CONFLICT DO NOTHING
    `)
    if err != nil {
        t.Fatalf("failed to seed users: %v", err)
    }
}
```

### Running Container Tests
```bash
# Run all tests including integration tests
go test ./...

# Run only integration tests
go test ./... -tags=integration

# Run with verbose output
go test ./... -v -count=1
```

## API Handler Testing

### HTTP Test Helpers
```go
// testutil/http.go
package testutil

import (
    "bytes"
    "encoding/json"
    "io"
    "net/http"
    "net/http/httptest"
    "testing"
)

type TestClient struct {
    Handler http.Handler
    T       *testing.T
}

func NewTestClient(t *testing.T, handler http.Handler) *TestClient {
    return &TestClient{Handler: handler, T: t}
}

func (c *TestClient) Get(path string) *httptest.ResponseRecorder {
    req := httptest.NewRequest(http.MethodGet, path, nil)
    rec := httptest.NewRecorder()
    c.Handler.ServeHTTP(rec, req)
    return rec
}

func (c *TestClient) Post(path string, body any) *httptest.ResponseRecorder {
    var reader io.Reader
    if body != nil {
        data, err := json.Marshal(body)
        if err != nil {
            c.T.Fatalf("failed to marshal body: %v", err)
        }
        reader = bytes.NewReader(data)
    }

    req := httptest.NewRequest(http.MethodPost, path, reader)
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()
    c.Handler.ServeHTTP(rec, req)
    return rec
}

func (c *TestClient) Put(path string, body any) *httptest.ResponseRecorder {
    data, _ := json.Marshal(body)
    req := httptest.NewRequest(http.MethodPut, path, bytes.NewReader(data))
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()
    c.Handler.ServeHTTP(rec, req)
    return rec
}

func (c *TestClient) Delete(path string) *httptest.ResponseRecorder {
    req := httptest.NewRequest(http.MethodDelete, path, nil)
    rec := httptest.NewRecorder()
    c.Handler.ServeHTTP(rec, req)
    return rec
}

// ParseResponse unmarshals JSON response body
func ParseResponse[T any](t *testing.T, rec *httptest.ResponseRecorder) T {
    t.Helper()
    var result T
    if err := json.NewDecoder(rec.Body).Decode(&result); err != nil {
        t.Fatalf("failed to parse response: %v", err)
    }
    return result
}

// AssertStatus checks HTTP status code
func AssertStatus(t *testing.T, rec *httptest.ResponseRecorder, want int) {
    t.Helper()
    if rec.Code != want {
        t.Errorf("status = %d, want %d; body: %s", rec.Code, want, rec.Body.String())
    }
}
```

## Data Endpoint Tests

### CRUD Endpoint Tests
```go
// api/user_handler_test.go
package api_test

import (
    "net/http"
    "testing"

    "yourproject/api"
    "yourproject/testutil"
)

func TestUserHandler_Create(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    handler := api.NewRouter(db.Pool)
    client := testutil.NewTestClient(t, handler)

    tests := []struct {
        name       string
        body       map[string]any
        wantStatus int
    }{
        {
            name:       "valid user",
            body:       map[string]any{"name": "John", "email": "john@example.com"},
            wantStatus: http.StatusCreated,
        },
        {
            name:       "missing name",
            body:       map[string]any{"email": "jane@example.com"},
            wantStatus: http.StatusBadRequest,
        },
        {
            name:       "missing email",
            body:       map[string]any{"name": "Jane"},
            wantStatus: http.StatusBadRequest,
        },
        {
            name:       "invalid email",
            body:       map[string]any{"name": "Jane", "email": "not-an-email"},
            wantStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            rec := client.Post("/api/users", tt.body)
            testutil.AssertStatus(t, rec, tt.wantStatus)
        })
    }
}

func TestUserHandler_Get(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)
    handler := api.NewRouter(db.Pool)
    client := testutil.NewTestClient(t, handler)

    tests := []struct {
        name       string
        path       string
        wantStatus int
    }{
        {
            name:       "existing user",
            path:       "/api/users/1",
            wantStatus: http.StatusOK,
        },
        {
            name:       "non-existent user",
            path:       "/api/users/9999",
            wantStatus: http.StatusNotFound,
        },
        {
            name:       "invalid id",
            path:       "/api/users/abc",
            wantStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            rec := client.Get(tt.path)
            testutil.AssertStatus(t, rec, tt.wantStatus)
        })
    }
}

func TestUserHandler_List(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)
    handler := api.NewRouter(db.Pool)
    client := testutil.NewTestClient(t, handler)

    rec := client.Get("/api/users")
    testutil.AssertStatus(t, rec, http.StatusOK)

    users := testutil.ParseResponse[[]api.UserResponse](t, rec)
    if len(users) != 2 {
        t.Errorf("got %d users, want 2", len(users))
    }
}

func TestUserHandler_Delete(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)
    handler := api.NewRouter(db.Pool)
    client := testutil.NewTestClient(t, handler)

    // Delete existing user
    rec := client.Delete("/api/users/1")
    testutil.AssertStatus(t, rec, http.StatusNoContent)

    // Verify deleted
    rec = client.Get("/api/users/1")
    testutil.AssertStatus(t, rec, http.StatusNotFound)
}
```

### Story and Page Tests
```go
// api/story_handler_test.go
package api_test

func TestStoryHandler_CreateWithPages(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)
    handler := api.NewRouter(db.Pool)
    client := testutil.NewTestClient(t, handler)

    // Create story
    storyBody := map[string]any{
        "user_id": 1,
        "title":   "Test Adventure",
        "summary": "A test story",
    }
    rec := client.Post("/api/stories", storyBody)
    testutil.AssertStatus(t, rec, http.StatusCreated)

    story := testutil.ParseResponse[api.StoryResponse](t, rec)
    storyID := story.ID

    // Add page
    pageBody := map[string]any{
        "content":      "Once upon a time...",
        "image_prompt": "A magical forest",
    }
    rec = client.Post(fmt.Sprintf("/api/stories/%d/pages", storyID), pageBody)
    testutil.AssertStatus(t, rec, http.StatusCreated)

    // List pages
    rec = client.Get(fmt.Sprintf("/api/stories/%d/pages", storyID))
    testutil.AssertStatus(t, rec, http.StatusOK)

    pages := testutil.ParseResponse[[]api.PageResponse](t, rec)
    if len(pages) != 1 {
        t.Errorf("got %d pages, want 1", len(pages))
    }
}
```

## AI/Chat Endpoint Tests

### Cost-Effective AI Testing Strategy
```go
// testutil/ai.go
package testutil

import (
    "context"
    "os"
    "testing"
)

// AITestConfig holds configuration for AI tests
type AITestConfig struct {
    Model   string
    Enabled bool
}

func GetAITestConfig(t *testing.T) AITestConfig {
    t.Helper()

    // Check if AI tests are enabled via environment
    enabled := os.Getenv("AI_TESTS_ENABLED") == "true"

    return AITestConfig{
        Model:   "gpt-5-nano", // Cheapest model for testing
        Enabled: enabled,
    }
}

func SkipIfNoAI(t *testing.T) {
    t.Helper()
    config := GetAITestConfig(t)
    if !config.Enabled {
        t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
    }
}
```

### Mock AI Client for Unit Tests
```go
// testutil/mock_ai.go
package testutil

import (
    "context"
)

type MockAIClient struct {
    Response string
    Err      error
    Calls    []MockAICall
}

type MockAICall struct {
    Messages []Message
}

func (m *MockAIClient) Chat(ctx context.Context, messages []Message) (string, error) {
    m.Calls = append(m.Calls, MockAICall{Messages: messages})
    return m.Response, m.Err
}

func (m *MockAIClient) StreamChat(ctx context.Context, messages []Message) (<-chan string, error) {
    m.Calls = append(m.Calls, MockAICall{Messages: messages})

    ch := make(chan string, 1)
    go func() {
        ch <- m.Response
        close(ch)
    }()
    return ch, m.Err
}
```

### Chat Endpoint Tests (With Mock)
```go
// api/chat_handler_test.go
package api_test

func TestChatHandler_SendMessage_MockAI(t *testing.T) {
    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)

    mockAI := &testutil.MockAIClient{
        Response: "Hello! I'm here to help with your story.",
    }

    handler := api.NewRouter(db.Pool, api.WithAIClient(mockAI))
    client := testutil.NewTestClient(t, handler)

    body := map[string]any{
        "story_id": 1,
        "message":  "Tell me about the story",
    }

    rec := client.Post("/api/chat", body)
    testutil.AssertStatus(t, rec, http.StatusOK)

    response := testutil.ParseResponse[api.ChatResponse](t, rec)
    if response.Message == "" {
        t.Error("expected non-empty response message")
    }

    // Verify AI was called
    if len(mockAI.Calls) != 1 {
        t.Errorf("expected 1 AI call, got %d", len(mockAI.Calls))
    }
}
```

### Real AI Tests (Cost-Controlled)
```go
// api/chat_handler_integration_test.go
//go:build integration

package api_test

import (
    "os"
    "testing"

    "yourproject/ai"
    "yourproject/api"
    "yourproject/testutil"
)

func TestChatHandler_RealAI(t *testing.T) {
    testutil.SkipIfNoAI(t)

    db := testutil.NewTestDatabase(t)
    db.SeedTestData(t)

    // Use GPT-5-nano for cost-effective testing
    aiConfig := testutil.GetAITestConfig(t)
    aiClient := ai.NewClient(os.Getenv("OPENAI_API_KEY"), ai.WithModel(aiConfig.Model))

    handler := api.NewRouter(db.Pool, api.WithAIClient(aiClient))
    client := testutil.NewTestClient(t, handler)

    tests := []struct {
        name    string
        message string
        wantErr bool
    }{
        {
            name:    "simple question",
            message: "Hello, can you help me?",
            wantErr: false,
        },
        {
            name:    "story continuation",
            message: "What happens next in the story?",
            wantErr: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            body := map[string]any{
                "story_id": 1,
                "message":  tt.message,
            }

            rec := client.Post("/api/chat", body)

            if tt.wantErr {
                if rec.Code == 200 {
                    t.Error("expected error response")
                }
                return
            }

            testutil.AssertStatus(t, rec, 200)

            response := testutil.ParseResponse[api.ChatResponse](t, rec)
            if response.Message == "" {
                t.Error("expected non-empty AI response")
            }
        })
    }
}
```

## Test Organization

### File Structure
```
project/
  api/
    handler.go
    handler_test.go           # Unit tests with mocks
    handler_integration_test.go  # Integration tests
  testutil/
    database.go               # Testcontainers setup
    http.go                   # HTTP test helpers
    mock_ai.go               # AI mocks
    ai.go                    # AI test config
  Makefile
```

### Makefile Targets
```makefile
.PHONY: test test-unit test-integration test-ai test-all

# Run unit tests only (fast, no external deps)
test-unit:
	go test ./... -short

# Run integration tests (requires Docker)
test-integration:
	go test ./... -tags=integration -count=1

# Run AI tests (requires API key, costs money)
test-ai:
	AI_TESTS_ENABLED=true go test ./... -tags=ai -count=1 -v

# Run all tests
test-all:
	AI_TESTS_ENABLED=true go test ./... -tags=integration,ai -count=1

# Default: unit + integration
test:
	go test ./... -tags=integration -count=1
```

### Build Tags
```go
// File: handler_integration_test.go
//go:build integration

// File: handler_ai_test.go
//go:build ai
```

## Test Coverage

### Endpoint Coverage Checklist
For each endpoint, ensure tests cover:
- [ ] Happy path (valid input, expected output)
- [ ] Missing required fields
- [ ] Invalid field values (wrong type, out of range)
- [ ] Non-existent resources (404)
- [ ] Authorization (if applicable)
- [ ] Pagination (if applicable)
- [ ] Concurrency (where relevant)

### Coverage Commands
```bash
# Generate coverage report
go test ./... -coverprofile=coverage.out

# View coverage in browser
go tool cover -html=coverage.out

# Check coverage percentage
go test ./... -cover
```

## Performance Testing

### Basic Load Testing
```go
func BenchmarkUserHandler_List(b *testing.B) {
    db := testutil.NewTestDatabase(&testing.T{})
    // Seed with many users
    for i := 0; i < 1000; i++ {
        db.Pool.Exec(context.Background(),
            "INSERT INTO users (name, email) VALUES ($1, $2)",
            fmt.Sprintf("User %d", i),
            fmt.Sprintf("user%d@example.com", i),
        )
    }

    handler := api.NewRouter(db.Pool)

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        req := httptest.NewRequest("GET", "/api/users", nil)
        rec := httptest.NewRecorder()
        handler.ServeHTTP(rec, req)
    }
}
```

## What This Agent Does NOT Handle
- Unit testing business logic (use go-agent)
- TUI testing (use tui-agent)
- Production deployment
- Security audits
