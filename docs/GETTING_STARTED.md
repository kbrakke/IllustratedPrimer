# Getting Started with Illustrated Primer Rust TUI

## Quick Start Guide

### 1. Prerequisites Check

```bash
# Check Rust installation
cargo --version
# Expected: cargo 1.70.0 or higher

# Check SQLite version
sqlite3 --version
# Expected: 3.37.0 or higher
```

### 2. Environment Setup

```bash
# Navigate to rust-tui directory
cd rust-tui

# Copy environment template
cp .env.example .env

# Edit .env with your OpenAI API key
# Get your API key from: https://platform.openai.com/api-keys
```

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-...your-key-here...
DATABASE_URL=sqlite:./data.db
RUST_LOG=info
```

### 3. Build and Run

```bash
# First time: This will download dependencies (~300MB) and compile
cargo build --release

# Run the application
cargo run --release
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
| Navigate list up | `↑` |
| Navigate list down | `↓` |
| Select / Submit | `Enter` |
| Go back | `Esc` |
| Create new story | `n` (in Story List) |
| Quit application | `Ctrl+Q` |

## First Conversation

1. **Start the app**: `cargo run --release`
2. **Select default user**: Use arrow keys and press Enter
3. **Create a story**:
   - Press `n`
   - Type a title like "Space Adventure"
   - Press Enter
4. **Start chatting**:
   - Type your first message: "Tell me about planets"
   - Press Enter
   - Watch the AI response stream in real-time
5. **Continue the story**: Keep chatting! Each exchange is saved as a page.

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

### Problem: Compilation fails with "package not found"

**Solution:**
```bash
# Update Rust toolchain
rustup update stable

# Clean and rebuild
cargo clean
cargo build --release
```

### Problem: Database locked errors

**Solution:**
```bash
# Remove SQLite WAL files
rm data.db-shm data.db-wal

# Restart the application
cargo run --release
```

### Problem: Terminal display issues (garbled text)

**Solution:**
```bash
# Check terminal capabilities
echo $TERM
tput colors

# Try setting TERM explicitly
export TERM=xterm-256color
cargo run --release
```

### Problem: Slow compilation times

**Solution:**
```bash
# First build is always slow (5-10 minutes)
# Subsequent builds are much faster (<30 seconds)

# For development, use debug build (faster compilation):
cargo run

# For production, use release build (optimized binary):
cargo run --release
```

## Development Workflow

### Running in Development Mode

```bash
# Faster compilation, larger binary, more logging
RUST_LOG=debug cargo run
```

### Running Tests (when available)

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### Linting and Formatting

```bash
# Check code style
cargo clippy

# Auto-format code
cargo fmt

# Check formatting without changing
cargo fmt -- --check
```

## Understanding the Codebase

### File Structure

```
rust-tui/
├── src/
│   ├── main.rs              # Entry point, event loop
│   ├── models/              # Data structures
│   │   ├── user.rs          # User model
│   │   ├── story.rs         # Story model
│   │   └── page.rs          # Page model
│   ├── db/                  # Database operations
│   │   ├── connection.rs    # DB setup, migrations
│   │   ├── user.rs          # User CRUD
│   │   ├── story.rs         # Story CRUD
│   │   └── page.rs          # Page CRUD
│   ├── ai/                  # OpenAI integration
│   │   ├── openai.rs        # API client
│   │   └── prompt.rs        # Prompt templates
│   └── tui/                 # Terminal interface
│       ├── app.rs           # Application state
│       ├── ui.rs            # Rendering
│       └── events.rs        # Input handling
├── migrations/
│   └── 001_init.sql         # Database schema
└── docs/
    ├── ARCHITECTURE.md      # Technical details
    └── GETTING_STARTED.md   # This file
```

### Key Concepts

**App State Machine:**
```rust
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

Edit `src/ai/openai.rs`:

```rust
// Line 27
model: "gpt-4-turbo".to_string(),

// Change to:
model: "gpt-4".to_string(),  // More capable but slower
// or
model: "gpt-3.5-turbo".to_string(),  // Faster and cheaper
```

### Customizing the Educational Prompt

Edit `src/ai/prompt.rs`:

```rust
pub fn system_prompt() -> String {
    String::from(
        "Your custom educational prompt here..."
    )
}
```

### Changing Log Levels

```bash
# Show all logs including debug
RUST_LOG=debug cargo run

# Show only warnings and errors
RUST_LOG=warn cargo run

# Module-specific logging
RUST_LOG=illustrated_primer_tui::ai=debug cargo run
```

### Using a Different Database Location

Edit `.env`:
```env
DATABASE_URL=sqlite:/path/to/your/database.db
```

## Performance Tips

### Optimizing Binary Size

Already configured in `Cargo.toml`:
```toml
[profile.release]
opt-level = "z"        # Optimize for size
lto = true             # Link-time optimization
codegen-units = 1      # Better optimization
strip = true           # Remove debug symbols
```

Result: ~12-15 MB binary

### Reducing Compilation Time

```bash
# Install sccache for caching
cargo install sccache

# Configure as compiler wrapper
export RUSTC_WRAPPER=sccache

# Check cache statistics
sccache --show-stats
```

### Monitoring Performance

```bash
# Run with timing information
RUST_LOG=info cargo run --release

# Monitor memory usage
cargo run --release &
ps aux | grep illustrated_primer_tui
```

## Next Steps

1. **Explore the codebase**: Read through `docs/ARCHITECTURE.md`
2. **Try different prompts**: Experiment with story topics
3. **Check the database**: `sqlite3 data.db` and explore tables
4. **Plan enhancements**: See "Future Architecture Evolution" in ARCHITECTURE.md

## Getting Help

### Documentation
- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Deep technical dive
- [Rust Book](https://doc.rust-lang.org/book/) - Learn Rust
- [Ratatui Tutorial](https://ratatui.rs/tutorials/) - TUI framework

### Common Issues
- Check `.env` file exists and has valid API key
- Ensure SQLite 3.37+ installed
- Verify Rust 1.70+ with `cargo --version`
- Try `cargo clean && cargo build` for weird errors

### Debugging Tips

```bash
# Run with backtrace on panic
RUST_BACKTRACE=1 cargo run

# Full backtrace
RUST_BACKTRACE=full cargo run

# Debug-level logging
RUST_LOG=debug cargo run
```

## What's Different from Next.js Version?

### Advantages
- **45x smaller**: 12MB vs 547MB
- **10x faster startup**: <500ms vs 5-10s
- **8x less memory**: 25MB vs 200MB+
- **Simpler architecture**: No framework magic
- **Better for embedded**: Can cross-compile to ARM

### Trade-offs
- **No web interface** (yet - coming in Phase 2)
- **Terminal-only** (perfect for e-ink displays)
- **Requires Rust knowledge** for modifications
- **Longer initial compile** (but fast rebuilds)

## Success Metrics

You'll know it's working when:
- ✅ Application starts in under 1 second
- ✅ User selection screen appears
- ✅ Can create new story without errors
- ✅ AI responds within 5-10 seconds
- ✅ Conversation history persists across restarts
- ✅ Database file grows with each interaction

Happy story creation! 🦀📚
