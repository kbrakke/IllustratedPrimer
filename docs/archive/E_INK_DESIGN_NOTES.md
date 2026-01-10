# E-Ink Display Design Guidelines

## Color Palette

The Illustrated Primer is optimized for e-ink displays with a minimal, high-contrast color scheme:

### Primary Colors

- **Background**: `#FFFFFF` (Pure White)
- **Text**: `#000000` (Pure Black)
- **Secondary Background**: `#F5F5F5` (Off-White)
- **Borders/Dividers**: `#E0E0E0` (Light Gray)

### Design Principles

1. **High Contrast**: Pure black on pure white ensures maximum readability
2. **Minimal Grays**: Only subtle grays for visual hierarchy
3. **No Colors**: E-ink displays typically support only grayscale
4. **Sharp Edges**: Avoid gradients and anti-aliasing artifacts
5. **Large Touch Targets**: E-ink refresh rates make precision difficult

## E-Ink Refresh Strategies

### Partial Refresh (Fast)

Use for:
- Text input display
- Cursor movement
- Status messages
- Navigation highlights

**Characteristics**:
- 100-300ms refresh time
- May cause ghosting after ~10 refreshes
- Lower power consumption

### Full Refresh (Slow)

Use for:
- Page transitions
- After 10+ partial refreshes
- Initial screen render
- Image display

**Characteristics**:
- 500-1000ms refresh time
- Complete ghosting removal
- Higher power consumption
- Full black flash

## Typography

### Font Recommendations

1. **Sans-serif**: Better for low-resolution e-ink
2. **Medium weight**: Too light causes artifacts, too bold bleeds
3. **Large sizes**: 14pt minimum for body text
4. **Line height**: 1.5-1.8 for comfortable reading

### Avoid

- ❌ Serif fonts (fine details get lost)
- ❌ Thin fonts (hard to read)
- ❌ Tight line spacing (causes blurring)
- ❌ Small text (<12pt)

## Layout Guidelines

### Spacing

- Minimum touch target: 44x44 pixels
- Padding between elements: 16-24 pixels
- Line length: 50-75 characters maximum
- Margins: 32-48 pixels on all sides

### Contrast Ratios

- Text to background: Minimum 21:1 (pure black/white)
- UI elements: Minimum 7:1
- Borders: Minimum 3:1

## Rust TUI Implementation

The current terminal UI follows these principles:

\`\`\`rust
// From src/tui/ui.rs
Style::default().fg(Color::White).bg(Color::Black)  // Headers
Style::default().fg(Color::Black)                    // Body text
Style::default().fg(Color::DarkGray)                 // Dividers
\`\`\`

### Future E-Ink Driver Integration

When moving from terminal to actual e-ink hardware:

1. **Framebuffer access**: Write directly to `/dev/fb0`
2. **Refresh control**: Use device-specific ioctl calls
3. **Partial refresh regions**: Calculate dirty rectangles
4. **Waveform selection**: Choose appropriate refresh mode per update

## Reference Devices

### Tested/Target Devices

- reMarkable 2: 1872x1404, 226 DPI
- Kindle Paperwhite: 1448x1072, 300 DPI
- Kobo devices: Various resolutions

### Common E-Ink Controllers

- E Ink Pearl (older): 16 gray levels
- E Ink Carta (current): 16 gray levels, faster refresh
- E Ink Kaleido (color): 4096 colors, slower

## Power Consumption

E-ink displays only consume power during refresh:

- **Static display**: 0 W
- **Partial refresh**: ~0.5 W for 200ms
- **Full refresh**: ~1.5 W for 800ms

**Optimization**:
- Batch updates to minimize refresh count
- Use partial refresh for text
- Schedule full refresh every 10th update
- Disable refresh during scrolling (update only on stop)

## Testing Without Hardware

Current Rust TUI can be tested in terminal, which closely mimics e-ink constraints:

\`\`\`bash
# Simulate e-ink refresh rate
export TERM=xterm-mono  # Monochrome terminal
cargo run --release
\`\`\`

Future: Use e-ink simulator like `fbdump` or reMarkable SDK.

## See Also

- [E Ink Technology](https://www.eink.com/)
- [reMarkable SDK](https://remarkablewiki.com/)
- [Linux Framebuffer HOWTO](https://www.kernel.org/doc/Documentation/fb/)
