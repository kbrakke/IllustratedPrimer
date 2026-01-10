# Illustrated Primer - Rust TUI

A lightweight, terminal-based implementation of the Illustrated Primer interactive learning platform. Built for performance, embedded systems, and e-ink display compatibility.

## Overview

This Rust implementation provides a clean separation between business logic and presentation layer. The TUI (Terminal User Interface) serves as a testing ground for core functionality before deploying to production environments with web APIs or embedded displays.

## Features

- **Interactive AI-Powered Stories**: Educational storytelling for children ages 2-8
- **Terminal Interface**: Full-featured TUI using Ratatui
- **Embedded SQLite**: Lightweight, file-based database
- **Streaming Responses**: Real-time AI text generation
- **User Management**: Multi-user support with isolated story libraries
- **E-ink Optimized**: Pure black/white design for e-reader displays

## Prerequisites

- **Rust 1.70+** (2021 edition)
- **SQLite 3.37+** (for STRICT table support)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Terminal Emulator** (iTerm2, Alacritty, Windows Terminal, etc.)

## Quick Start

### 1. Clone and Navigate

```bash
cd rust-tui
```

### 2. Install Rust (if needed)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-...your-key-here
DATABASE_URL=sqlite:./data.db
RUST_LOG=info
```

### 4. Build and Run

```bash
cargo run --release
```

## Usage

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate lists |
| `Enter` | Select item / Submit message |
| `Esc` | Go back to previous screen |
| `Ctrl+Q` | Quit application |
| `n` | Create new story (in Story List) |

### Workflow

1. **Select User** - Choose from existing users or create new
2. **Story Library** - View all stories, select one, or create new
3. **Story View** - Read existing conversation pages
4. **Chat Mode** - Interactive conversation with AI

### Creating a New Story

1. Navigate to Story List (select a user first)
2. Press `n` to create new story
3. Type story title and press `Enter`
4. Begin chatting with AI

## Project Structure

```
rust-tui/
├── src/
│   ├── main.rs              # Application entry point
│   ├── models/              # Data models (User, Story, Page)
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   ├── story.rs
│   │   └── page.rs
│   ├── db/                  # Database layer (SQLx)
│   │   ├── mod.rs
│   │   ├── connection.rs
│   │   ├── user.rs
│   │   ├── story.rs
│   │   └── page.rs
│   ├── ai/                  # OpenAI integration
│   │   ├── mod.rs
│   │   ├── openai.rs
│   │   └── prompt.rs
│   └── tui/                 # Terminal UI (Ratatui)
│       ├── mod.rs
│       ├── app.rs           # State machine
│       ├── ui.rs            # Rendering
│       └── events.rs        # Event handling
├── migrations/
│   └── 001_init.sql         # Database schema
├── docs/
│   └── ARCHITECTURE.md      # Detailed architecture docs
├── Cargo.toml               # Rust dependencies
├── .env.example             # Environment template
└── README.md                # This file
```

## Development

### Build Debug Version

```bash
cargo build
```

### Run with Logging

```bash
RUST_LOG=debug cargo run
```

### Run Tests

```bash
cargo test
```

### Linting

```bash
cargo clippy
```

### Format Code

```bash
cargo fmt
```

## Database

### Schema

The database uses an optimized SQLite schema with:
- STRICT mode for type safety
- WAL journaling for concurrency
- Integer timestamps (Unix epoch)
- Indexed foreign keys

### Migrations

Migrations run automatically on startup. The schema is defined in:
```
migrations/001_init.sql
```

### Manual Database Access

```bash
sqlite3 data.db
.tables
SELECT * FROM stories;
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API authentication | (required) |
| `DATABASE_URL` | SQLite connection string | `sqlite:./data.db` |
| `RUST_LOG` | Logging level | `info` |

### OpenAI Model

Currently hardcoded to `gpt-4-turbo`. To change, edit:
```rust
// src/ai/openai.rs
model: "gpt-4-turbo".to_string()
```

## Performance

### Binary Size

Release build with optimizations:
- **Debug**: ~50 MB
- **Release**: ~12-15 MB (with LTO and strip)

### Memory Usage

- Runtime: ~20-30 MB
- Database overhead: <5 MB (small datasets)

### Startup Time

- Cold start: <500ms
- Database migration: <100ms (first run)

## Optimization Flags

The `Cargo.toml` includes aggressive optimization for release builds:

```toml
[profile.release]
opt-level = "z"        # Optimize for size
lto = true             # Link-time optimization
codegen-units = 1      # Better optimization (slower compile)
strip = true           # Remove debug symbols
```

## Troubleshooting

### "OPENAI_API_KEY must be set"

Ensure `.env` file exists and contains valid API key:
```bash
cat .env
```

### Database locked errors

SQLite WAL mode should prevent this. If it occurs:
```bash
rm data.db-shm data.db-wal
```

### Terminal display issues

Ensure your terminal supports:
- UTF-8 encoding
- 256 colors (or true color)
- Minimum 80x24 size

Test with:
```bash
echo $TERM
tput colors
```

### Compilation errors

Update Rust toolchain:
```bash
rustup update stable
cargo clean
cargo build
```

## Roadmap

### Phase 1: TUI Testing (Current)
- ✅ Core business logic
- ✅ Database layer
- ✅ OpenAI integration
- ✅ Terminal interface

### Phase 2: API Server (Planned)
- [ ] Axum web server
- [ ] REST endpoints
- [ ] WebSocket streaming
- [ ] Web UI compatibility

### Phase 3: Embedded Deployment
- [ ] ARM cross-compilation
- [ ] E-ink display driver
- [ ] Battery optimization
- [ ] Offline mode

## Contributing

### Code Style

- Prefer self-documenting code over comments
- Use rustfmt for formatting
- Run clippy before committing
- Document architecture decisions in `docs/`

### Commit Messages

Follow conventional commits:
```
feat: add story summary generation
fix: handle empty conversation history
docs: update architecture diagrams
```

## Resources

### Learning Rust
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Async Programming in Rust](https://rust-lang.github.io/async-book/)

### Key Dependencies
- [Tokio](https://tokio.rs/) - Async runtime
- [SQLx](https://docs.rs/sqlx/) - Database toolkit
- [Ratatui](https://ratatui.rs/) - Terminal UI framework
- [async-openai](https://docs.rs/async-openai/) - OpenAI client

### Project Documentation
- [Architecture Guide](docs/ARCHITECTURE.md) - Detailed system design
- [Original Analysis](../docs/CODEBASE_ANALYSIS.md) - Next.js comparison

## License

See main project LICENSE file.

## Support

For issues and questions:
- GitHub Issues: [Project Repository]
- Documentation: `docs/ARCHITECTURE.md`
- Code comments: Minimal by design (see architecture docs)

## Acknowledgments

- Built with Rust 🦀
- Powered by OpenAI GPT-4
- UI framework: Ratatui
- Database: SQLite
- Inspired by "The Diamond Age" by Neal Stephenson
