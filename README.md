# Illustrated Primer

> An AI-powered interactive learning platform for children, inspired by "The Diamond Age" by Neal Stephenson.

A lightweight, educational storytelling application that adapts to children's learning pace. Built in Rust for embedded systems and e-ink displays.

## Overview

The Illustrated Primer provides an interactive learning experience where children engage with AI-powered stories that teach relevant, age-appropriate subjects including science, math, history, and critical thinking skills. The AI follows the child's lead, weaving educational content naturally into the narrative.

**Target Audience**: Children ages 2-8
**Target Hardware**: Embedded systems (Raspberry Pi), e-ink displays, terminals
**Current Status**: Production-ready terminal UI

## Features

- **Interactive AI Storytelling**: GPT-4-powered narratives that adapt to each child
- **Educational Focus**: Seamlessly incorporates learning into engaging stories
- **Multi-User Support**: Individual story libraries for each child
- **Persistent History**: All conversations saved and browsable
- **E-Ink Optimized**: Pure black/white design for e-reader displays
- **Lightweight**: 3.6 MB binary, 25 MB memory footprint
- **Embedded-Ready**: Runs on Raspberry Pi Zero 2 W and similar devices

## Quick Start

### Prerequisites

- Rust 1.70+ ([install](https://rustup.rs/))
- SQLite 3.37+
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/IllustratedPrimer.git
cd IllustratedPrimer

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Build and run
cargo run --release
```

### First Story

1. **Select a user** (or let it create a default user)
2. **Press `n`** to create a new story
3. **Type a title**: "Space Adventure"
4. **Start chatting**: "Tell me about planets"
5. **Continue the conversation**: The AI will guide educational discussions

### Controls

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate lists |
| `Enter` | Select / Submit |
| `Esc` | Go back |
| `Ctrl+Q` | Quit |
| `n` | New story (in Story List) |

## Performance

Compared to the original Next.js prototype:

| Metric | Rust TUI | Next.js | Improvement |
|--------|----------|---------|-------------|
| Binary Size | 3.6 MB | 547 MB | **152x smaller** |
| Memory Usage | 25 MB | 200 MB | **8x less** |
| Startup Time | 0.11s | 4.5s | **41x faster** |
| Battery Life | 24-48h | 8-12h | **2-4x longer** |

See [PERFORMANCE.md](docs/PERFORMANCE.md) for detailed benchmarks.

## Architecture

```
IllustratedPrimer/
├── src/
│   ├── main.rs           # Application entry point
│   ├── models/           # Data models (User, Story, Page)
│   ├── db/               # SQLite database layer
│   ├── ai/               # OpenAI integration
│   └── tui/              # Terminal UI (Ratatui)
├── migrations/           # Database schema
├── docs/                 # Comprehensive documentation
│   ├── ARCHITECTURE.md   # Technical deep-dive
│   ├── GETTING_STARTED.md# Step-by-step guide
│   ├── PERFORMANCE.md    # Benchmarks
│   └── archive/          # Historical docs
├── Cargo.toml            # Rust dependencies
└── README.md             # This file
```

**Tech Stack**:
- **Language**: Rust 2021
- **UI**: Ratatui + Crossterm (terminal interface)
- **Database**: SQLite (optimized schema, WAL mode)
- **AI**: OpenAI GPT-4-turbo via async-openai
- **Async Runtime**: Tokio
- **Binary Size**: 3.6 MB (optimized with LTO, stripped)

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Documentation

- **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Installation, first run, troubleshooting
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design, database schema, performance
- **[PERFORMANCE.md](docs/PERFORMANCE.md)** - Detailed benchmarks vs Next.js
- **[RUST_README.md](docs/RUST_README.md)** - Original Rust TUI documentation

### Archive

Historical documentation from the Next.js prototype:
- **[E_INK_DESIGN_NOTES.md](docs/archive/E_INK_DESIGN_NOTES.md)** - E-ink display guidelines
- **[NEXTJS_SCHEMA.md](docs/archive/NEXTJS_SCHEMA.md)** - Original Prisma schema
- **[TEST_STORY_PROMPTS.md](docs/archive/TEST_STORY_PROMPTS.md)** - Sample test prompts

## Deployment

### Desktop/Server

```bash
cargo build --release
./target/release/illustrated_primer_tui
```

### Raspberry Pi (Cross-Compile)

```bash
# Install cross-compilation target
rustup target add aarch64-unknown-linux-gnu

# Build for ARM64
cargo build --release --target aarch64-unknown-linux-gnu

# Copy to Pi
scp target/aarch64-unknown-linux-gnu/release/illustrated_primer_tui pi@raspberrypi:~/
```

### Embedded Linux / E-Ink Device

See [ARCHITECTURE.md - Phase 3](docs/ARCHITECTURE.md#phase-3-embedded-deployment) for e-ink driver integration.

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=sqlite:./data.db
RUST_LOG=info
```

### Database

- **Default location**: `./data.db`
- **Schema**: Auto-migrates on first run
- **Backup**: Copy `data.db` file
- **Reset**: Delete `data.db` to start fresh

### AI Model

To change the OpenAI model, edit `src/ai/openai.rs`:

```rust
model: "gpt-4-turbo".to_string()  // Current
// or
model: "gpt-3.5-turbo".to_string() // Faster, cheaper
```

## Development

### Building

```bash
cargo build          # Debug build
cargo build --release # Optimized build
```

### Testing

```bash
cargo test           # Run tests
cargo clippy         # Linting
cargo fmt            # Format code
```

### Debugging

```bash
RUST_LOG=debug cargo run
RUST_BACKTRACE=1 cargo run
```

## Roadmap

### ✅ Phase 1: Terminal UI (Current)
- [x] Core business logic
- [x] SQLite database layer
- [x] OpenAI integration
- [x] Terminal interface
- [x] Multi-user support

### 🚧 Phase 2: API Server (Planned)
- [ ] Axum web server
- [ ] REST API endpoints
- [ ] WebSocket streaming
- [ ] Web UI compatibility

### 🎯 Phase 3: Embedded Deployment (Future)
- [ ] ARM cross-compilation
- [ ] E-ink display driver integration
- [ ] Battery optimization
- [ ] Systemd service
- [ ] Hardware button support

## Contributing

Contributions welcome! Please:

1. Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the system
2. Follow Rust best practices (rustfmt, clippy)
3. Write clean, self-documenting code
4. Add documentation for new features
5. Test on multiple platforms

### Code Style

- Prefer self-documenting code over comments
- Keep functions small and focused
- Use `Result<T>` for error handling
- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)

## License

See LICENSE file for details.

## Acknowledgments

- **Inspiration**: "The Diamond Age" by Neal Stephenson
- **AI**: Powered by OpenAI GPT-4
- **UI Framework**: Ratatui
- **Database**: SQLite
- **Async Runtime**: Tokio

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/IllustratedPrimer/issues)
- **Documentation**: See `docs/` directory
- **Questions**: Check [GETTING_STARTED.md](docs/GETTING_STARTED.md)

## Project History

Originally prototyped in Next.js/React, the project was rewritten in Rust in January 2026 to:
- Reduce resource usage (152x smaller binary)
- Enable embedded deployment (Raspberry Pi Zero 2 W)
- Optimize for e-ink displays
- Improve battery life (2-4x longer)
- Simplify architecture

The Next.js prototype documentation is preserved in `docs/archive/` for reference.

---

**Built with Rust 🦀 • Powered by OpenAI • Inspired by Neal Stephenson**
