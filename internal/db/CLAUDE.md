# Database Module

## Purpose
This module provides the data persistence layer for the Illustrated Primer application using PostgreSQL. It manages database connections, migrations, and CRUD operations for all domain entities (users, stories, and pages). The module uses pgx for type-safe, performant database operations with connection pooling.

## Architecture
The module follows a repository pattern with methods on the Database struct:
- **Connection Layer**: Database pool management and configuration via pgxpool
- **Migration Layer**: Schema versioning embedded in the code
- **CRUD Operations**: Entity-specific operations on the Database struct

PostgreSQL is configured with connection pooling (max 5 connections) and foreign keys enabled for referential integrity.

## Key Features
- Connection pooling (max 5, min 1 connections)
- Automatic migrations via `Migrate()` method
- Type-safe queries with pgx
- Foreign key constraints with cascading deletes
- Timestamp tracking (created_at, updated_at as Unix timestamps)

## Files

### database.go
Implements the `Database` struct managing PostgreSQL connection pools:
- `New(ctx, cfg)` - Create with full configuration
- `NewWithURL(ctx, url)` - Create with defaults
- `Migrate(ctx)` - Run schema migrations
- `Pool()` - Access underlying pgxpool.Pool
- `Close()` - Close connections
- `Ping(ctx)` - Health check

Contains the `MigrationSQL` constant with the full schema.

### user.go
Provides CRUD operations for User entities:
- `CreateUser(ctx, user)` - Insert new user
- `GetUserByID(ctx, id)` - Fetch by UUID
- `GetUserByEmail(ctx, email)` - Fetch by email
- `ListUsers(ctx)` - Get all users ordered by creation date
- `UpdateUser(ctx, user)` - Update existing user
- `DeleteUser(ctx, id)` - Delete by ID

### story.go
Provides CRUD operations for Story entities:
- `CreateStory(ctx, story)` - Insert new story
- `GetStoryByID(ctx, id)` - Fetch by UUID
- `ListStoriesByUser(ctx, userID)` - Get all stories for a user
- `UpdateStory(ctx, story)` - Update existing story
- `IncrementCurrentPage(ctx, storyID)` - Advance story progress
- `DeleteStory(ctx, id)` - Delete by ID
- `GetStoryPageCount(ctx, storyID)` - Count pages in story

### page.go
Provides CRUD operations for Page entities:
- `CreatePage(ctx, page)` - Insert new page
- `GetPageByID(ctx, id)` - Fetch by UUID
- `GetPageByStoryAndNum(ctx, storyID, pageNum)` - Fetch by story and page number
- `ListPagesByStory(ctx, storyID)` - Get all pages ordered by page_num
- `GetNextPageNum(ctx, storyID)` - Calculate next sequential page number
- `UpdatePage(ctx, page)` - Update existing page
- `DeletePage(ctx, id)` - Delete by ID

## Errors
- `ErrUserNotFound` - User does not exist
- `ErrStoryNotFound` - Story does not exist
- `ErrPageNotFound` - Page does not exist

## Testing
Integration tests use testcontainers to spin up a PostgreSQL container. Tests are gated behind the `integration` build tag.
