# Models Module

## Purpose
This module defines the core domain models (data structures) for the Illustrated Primer application. These models represent the business entities and are shared across the database, AI, and TUI layers. All models support JSON serialization for seed data loading and API responses.

## Architecture
The module uses a clean domain model pattern:
- **Serializable**: All models have JSON struct tags for serialization
- **Self-Contained**: Each model includes factory methods and helper functions
- **UUID-based IDs**: All entities use UUID strings for unique identification
- **Unix Timestamps**: created_at and updated_at as int64 Unix timestamps

## Key Features
- Automatic UUID generation via google/uuid
- Unix timestamp tracking (created_at, updated_at)
- Optional fields use pointers (*string, *int64)
- Helper methods for display formatting

## Files

### user.go
Defines the User model representing application users:
```go
type User struct {
    ID            string
    Name          *string
    Email         *string
    EmailVerified *int64
    Image         *string
    CreatedAt     int64
    UpdatedAt     int64
}
```

Methods:
- `NewUser(name, email)` - Factory constructor
- `DisplayName()` - Returns name, email, or ID for display
- `DisplayEmail()` - Returns email or empty string

### story.go
Defines the Story model representing interactive educational stories:
```go
type Story struct {
    ID          string
    UserID      string
    Title       string
    Summary     string
    CurrentPage int64
    CreatedAt   int64
    UpdatedAt   int64
}
```

Methods:
- `NewStory(userID, title, summary)` - Factory constructor (starts at page 1)
- `PageCountDisplay()` - Returns "N page(s)" for UI display

### page.go
Defines the Page model representing individual story pages:
```go
type Page struct {
    ID         string
    StoryID    string
    PageNum    int64
    Prompt     string      // User's message
    Completion string      // AI's response
    Summary    string
    ImagePath  *string     // Future: generated images
    AudioPath  *string     // Future: text-to-speech
    CreatedAt  int64
    UpdatedAt  int64
}
```

Methods:
- `NewPage(storyID, pageNum, prompt, completion)` - Factory constructor
- `NewPageWithSummary(...)` - Factory with summary included

## Testing
Unit tests cover factory methods and helper functions. No external dependencies required.
