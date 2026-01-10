# Illustrated Primer TUI - Architecture Documentation

## Overview

The Rust TUI implementation of Illustrated Primer is a terminal-based application designed for testing core business logic and AI integration without the overhead of a web server. This architecture prioritizes simplicity, performance, and embedded system compatibility.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         TUI Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  EventHandler│  │  UI Renderer │  │  App State   │       │
│  │  (Crossterm) │  │  (Ratatui)   │  │  Machine     │       │
│  └──────┬───────┘  └──────▲───────┘  └──────┬───────┘       │
│         │                  │                  │               │
└─────────┼──────────────────┼──────────────────┼───────────────┘
          │                  │                  │
          ▼                  │                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App Modes: UserSelection → StoryList → StoryView    │  │
│  │             → Chat → (loop back to Chat)              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────┬────────────────────┘
                   │                      │
          ┌────────▼────────┐    ┌───────▼────────┐
          │   DB Layer      │    │   AI Layer     │
          │   (sqlx)        │    │   (OpenAI)     │
          └────────┬────────┘    └───────┬────────┘
                   │                      │
          ┌────────▼────────┐    ┌───────▼────────┐
          │   SQLite DB     │    │  OpenAI API    │
          │   (Embedded)    │    │  (gpt-4-turbo) │
          └─────────────────┘    └────────────────┘
```

## Module Structure

### 1. Models (`src/models/`)

Defines the core data structures that map directly to database tables.

**Files:**
- `user.rs` - User model with authentication info
- `story.rs` - Story model with metadata
- `page.rs` - Page model representing conversation turns

**Key Design Decisions:**
- Integer timestamps (Unix epoch) for embedded system compatibility
- Optional fields for incomplete features (image_path, audio_path)
- Helper methods for datetime conversion
- Serde serialization for future API compatibility

**Reference:**
- [Rust Serde Documentation](https://serde.rs/)
- [SQLx FromRow Derive](https://docs.rs/sqlx/latest/sqlx/trait.FromRow.html)

### 2. Database Layer (`src/db/`)

Provides async database operations using sqlx with SQLite.

**Files:**
- `connection.rs` - Database connection pooling and migration
- `user.rs` - CRUD operations for users
- `story.rs` - CRUD operations for stories
- `page.rs` - CRUD operations for pages

**Optimization Features:**
- WAL (Write-Ahead Logging) mode for better concurrency
- Foreign key constraints enforced at DB level
- Compound indexes for common query patterns
- STRICT tables for type safety (SQLite 3.37+)
- Integer timestamps to avoid datetime parsing overhead

**Reference:**
- [SQLx Documentation](https://docs.rs/sqlx/latest/sqlx/)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [SQLite STRICT Tables](https://www.sqlite.org/stricttables.html)

### 3. AI Layer (`src/ai/`)

Handles communication with OpenAI API for story generation.

**Files:**
- `openai.rs` - OpenAI client wrapper with streaming support
- `prompt.rs` - Educational prompt templates

**Key Features:**
- Async streaming responses via tokio channels
- Conversation history management
- System prompt engineering for age-appropriate content
- Error handling and retry logic (future enhancement)

**Educational Prompt Engineering:**
The system prompt is optimized for:
- Ages 2-8 educational content
- Warm, friendly teacher persona
- Balancing story flow with learning tangents
- Age-appropriate vocabulary and concepts

**Reference:**
- [async-openai Crate](https://docs.rs/async-openai/latest/async_openai/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/chat)
- [Tokio Channels](https://docs.rs/tokio/latest/tokio/sync/mpsc/index.html)

### 4. TUI Layer (`src/tui/`)

Terminal user interface built with Ratatui and Crossterm.

**Files:**
- `app.rs` - Application state machine and business logic
- `ui.rs` - UI rendering functions
- `events.rs` - Keyboard/mouse event handling

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
- `↑/↓` - Navigate lists
- `Enter` - Select/Submit
- `Esc` - Go back
- `Ctrl+Q` - Quit application
- `n` - Create new story (in StoryList mode)

**E-ink Optimization:**
- Pure black/white color scheme
- Minimal UI updates (only on events)
- Text-focused design with clear hierarchy

**Reference:**
- [Ratatui Documentation](https://ratatui.rs/)
- [Crossterm Documentation](https://docs.rs/crossterm/latest/crossterm/)
- [Terminal UI Patterns](https://github.com/ratatui-org/ratatui/tree/main/examples)

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
TUI: Add to input_buffer
    ↓
Business Logic:
  - Extract conversation_history
  - Call AI layer
    ↓
AI Layer:
  - Build messages array (system + history + user)
  - Stream response from OpenAI
    ↓
Business Logic:
  - Collect full response
  - Create Page model
  - Save to DB
  - Update conversation_history
    ↓
TUI: Re-render with new page
```

## Database Schema

### Optimizations from Original

1. **Integer Timestamps**: Unix epoch instead of TEXT ISO8601
   - Faster comparisons
   - Native SQLite INTEGER type
   - 8 bytes vs variable TEXT

2. **STRICT Mode**: Type safety at DB level
   - Prevents type affinity issues
   - Better performance (no conversion checks)
   - Catches bugs early

3. **Indexed Lookups**:
   - `idx_stories_user_id` - Fast story listing per user
   - `idx_pages_story_page` - Compound index for unique constraint + range queries
   - `idx_sessions_token` - Fast session validation

4. **File Paths Instead of Base64**:
   - `image_path` and `audio_path` fields
   - Reduces DB bloat (previous: 458KB embedded image)
   - Enables efficient streaming for large media

5. **WAL Mode Benefits**:
   - Readers don't block writers
   - Better concurrency for embedded systems
   - Crash recovery without corruption

**Reference:**
- [SQLite Performance Tuning](https://www.sqlite.org/optoverview.html)
- [Integer vs Text Performance](https://www.sqlite.org/datatype3.html)

## Performance Characteristics

### Binary Size (Release Build)

Expected metrics with `opt-level = "z"` and LTO:
- Binary size: ~12-15 MB (stripped)
- Memory usage: ~20-30 MB (runtime)
- Startup time: <500ms

Compare to Next.js:
- node_modules: 547 MB
- Memory: 200+ MB
- Startup: 5-10 seconds

**Reference:**
- [Rust Optimization Levels](https://doc.rust-lang.org/cargo/reference/profiles.html)
- [Link-Time Optimization](https://doc.rust-lang.org/rustc/linker-plugin-lto.html)

### Database Performance

- SQLite CRUD operations: <1ms (local SSD)
- Full story with 100 pages load: ~10-20ms
- WAL checkpoint: Async, non-blocking

### AI Response Times

- Network latency to OpenAI: 100-500ms (variable)
- Token streaming: Real-time display
- Full response (500 tokens): 5-10 seconds typical

## Error Handling Strategy

### Layered Error Propagation

```
UI Layer     → Display user-friendly message
   ↓
Business     → Log error, update status
   ↓
DB/AI        → Return Result<T, Error>
```

Using `anyhow::Result` for flexibility:
- Context-rich error messages
- Easy propagation with `?` operator
- Conversion from any error type

**Reference:**
- [Anyhow Error Handling](https://docs.rs/anyhow/latest/anyhow/)
- [Rust Error Handling Book](https://doc.rust-lang.org/book/ch09-00-error-handling.html)

## Async Runtime

### Tokio Configuration

Using Tokio for:
- Async database operations (sqlx)
- OpenAI API calls with streaming
- Future: WebSocket support for web UI

**Multi-threaded runtime** (`tokio::main`):
- Work-stealing scheduler
- Efficient for I/O-bound tasks
- Minimal overhead for small workloads

**Reference:**
- [Tokio Runtime](https://docs.rs/tokio/latest/tokio/runtime/index.html)
- [Async Rust Book](https://rust-lang.github.io/async-book/)

## Security Considerations

### Current Implementation

1. **API Key Management**:
   - Environment variable (not hardcoded)
   - .env file excluded from git
   - Future: Secure key storage for embedded

2. **SQL Injection Protection**:
   - SQLx compile-time query verification
   - Parameterized queries only
   - No string concatenation

3. **User Input Sanitization**:
   - Currently minimal (TUI context)
   - Future API: Input validation required

### Future Enhancements

- Local authentication (PIN/password)
- Encrypted database (SQLCipher)
- Rate limiting for AI calls
- Content filtering for child safety

**Reference:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)

## Testing Strategy

### Unit Tests
- Model serialization/deserialization
- Database CRUD operations (with test DB)
- Prompt template generation

### Integration Tests
- Full story creation flow
- Chat conversation persistence
- User session management

### Manual Testing
- TUI navigation flows
- OpenAI API integration
- Database migration

**Reference:**
- [Rust Testing Guide](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [SQLx Testing](https://docs.rs/sqlx/latest/sqlx/attr.test.html)

## Future Architecture Evolution

### Phase 1: Current (TUI)
- Terminal-only interface
- Direct DB access
- Synchronous AI calls

### Phase 2: Add API Server (Planned)
```
    TUI Client              Web Client
         │                      │
         └──────────┬───────────┘
                    │
              REST/WebSocket API
                    │
            ┌───────┴────────┐
            │   Axum Server  │
            └───────┬────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    DB Layer               AI Layer
```

### Phase 3: Embedded Deployment
- Cross-compile for ARM
- Systemd service
- E-ink display driver integration
- Battery optimization

**Reference:**
- [Axum Web Framework](https://docs.rs/axum/latest/axum/)
- [Cross-Compilation](https://rust-lang.github.io/rustup/cross-compilation.html)
- [Embedded Rust](https://docs.rust-embedded.org/)

## Development Guidelines

### Code Style
- Clean, minimal comments (prefer self-documenting code)
- Comprehensive documentation in separate markdown files
- Use clippy for linting: `cargo clippy`
- Format with rustfmt: `cargo fmt`

### Commit Strategy
- Atomic commits per feature
- Conventional commit messages
- Reference architecture docs in PRs

### Dependency Management
- Minimize dependencies (current: 17 direct deps)
- Prefer well-maintained crates
- Regular `cargo audit` for security

**Reference:**
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Clippy Lints](https://rust-lang.github.io/rust-clippy/)
- [Cargo Audit](https://crates.io/crates/cargo-audit)

## Deployment Targets

### Development (macOS/Linux/Windows)
- Native compilation
- SQLite file-based DB
- Terminal emulator required

### Raspberry Pi (ARM)
```bash
rustup target add aarch64-unknown-linux-gnu
cargo build --release --target aarch64-unknown-linux-gnu
```

### E-ink Device (Future)
- Requires custom display driver
- Potential targets: reMarkable, Kindle, custom hardware
- May need framebuffer integration

**Reference:**
- [Rust Cross Compilation](https://github.com/cross-rs/cross)
- [Raspberry Pi Deployment](https://opensource.com/article/19/3/physical-computing-rust-raspberry-pi)

## Monitoring and Logging

### Tracing Setup
- `tracing` crate for structured logging
- Log levels: ERROR, WARN, INFO, DEBUG, TRACE
- Environment variable: `RUST_LOG=info`

### Key Events Logged
- Database initialization and migration
- OpenAI API calls and errors
- User navigation flow
- Performance metrics (future)

**Reference:**
- [Tracing Documentation](https://docs.rs/tracing/latest/tracing/)
- [Logging Best Practices](https://rust-lang-nursery.github.io/rust-cookbook/development_tools/debugging/config_log.html)

## Resources and Learning

### Essential Rust References
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Async Programming in Rust](https://rust-lang.github.io/async-book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

### Key Crate Documentation
- [Tokio](https://tokio.rs/)
- [SQLx](https://docs.rs/sqlx/)
- [Ratatui](https://ratatui.rs/)
- [Serde](https://serde.rs/)

### Terminal UI Resources
- [Ratatui Book](https://ratatui.rs/tutorials/)
- [TUI Design Patterns](https://github.com/ratatui-org/ratatui/tree/main/examples)

### OpenAI Integration
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
