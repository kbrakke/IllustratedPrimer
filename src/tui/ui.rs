use super::app::{App, AppMode};
use ratatui::{
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, Paragraph, Wrap},
    Frame,
};

pub fn render(frame: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(3),
        ])
        .split(frame.area());

    render_header(frame, chunks[0], app);
    render_main_content(frame, chunks[1], app);
    render_status_bar(frame, chunks[2], app);
}

fn render_header(frame: &mut Frame, area: Rect, app: &App) {
    let title = match app.mode {
        AppMode::UserSelection => "Illustrated Primer - Select User",
        AppMode::StoryList => "Story Library",
        AppMode::StoryView => "Story Pages",
        AppMode::Chat => "Interactive Story Chat",
    };

    let header = Paragraph::new(title)
        .style(Style::default().fg(Color::White).bg(Color::Black))
        .alignment(Alignment::Center)
        .block(Block::default().borders(Borders::ALL));

    frame.render_widget(header, area);
}

fn render_main_content(frame: &mut Frame, area: Rect, app: &App) {
    match app.mode {
        AppMode::UserSelection => render_user_selection(frame, area, app),
        AppMode::StoryList => render_story_list(frame, area, app),
        AppMode::StoryView => render_story_view(frame, area, app),
        AppMode::Chat => render_chat(frame, area, app),
    }
}

fn render_user_selection(frame: &mut Frame, area: Rect, app: &App) {
    let items: Vec<ListItem> = app
        .users
        .iter()
        .enumerate()
        .map(|(i, user)| {
            let content = format!(
                "{} - {}",
                user.name.as_deref().unwrap_or("Unknown"),
                user.email.as_deref().unwrap_or("No email")
            );
            let style = if i == app.selected_index {
                Style::default().bg(Color::DarkGray).fg(Color::White)
            } else {
                Style::default()
            };
            ListItem::new(content).style(style)
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::ALL)
            .title("Select User (↑/↓ to navigate, Enter to select)"),
    );

    frame.render_widget(list, area);
}

fn render_story_list(frame: &mut Frame, area: Rect, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(3)])
        .split(area);

    let items: Vec<ListItem> = app
        .stories
        .iter()
        .enumerate()
        .map(|(i, story)| {
            let content = format!("{} - {} pages", story.title, story.current_page);
            let style = if i == app.selected_index {
                Style::default().bg(Color::DarkGray).fg(Color::White)
            } else {
                Style::default()
            };
            ListItem::new(content).style(style)
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::ALL)
            .title("Your Stories (↑/↓ to navigate, Enter to select, Esc to go back)"),
    );

    frame.render_widget(list, chunks[0]);

    let help = Paragraph::new("Press 'n' to create a new story")
        .style(Style::default().fg(Color::Yellow))
        .alignment(Alignment::Center)
        .block(Block::default().borders(Borders::ALL));

    frame.render_widget(help, chunks[1]);
}

fn render_story_view(frame: &mut Frame, area: Rect, app: &App) {
    if app.current_pages.is_empty() {
        let empty = Paragraph::new("No pages yet. Press Enter to start chatting!")
            .style(Style::default().fg(Color::Yellow))
            .alignment(Alignment::Center)
            .block(
                Block::default()
                    .borders(Borders::ALL)
                    .title("Story Pages"),
            );
        frame.render_widget(empty, area);
        return;
    }

    let mut text_lines = Vec::new();

    for page in &app.current_pages {
        text_lines.push(Line::from(vec![
            Span::styled(
                format!("Page {}: ", page.page_num),
                Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
            ),
            Span::raw(&page.prompt),
        ]));

        text_lines.push(Line::from(""));

        let wrapped_completion = textwrap::wrap(&page.completion, (area.width.saturating_sub(4)) as usize);
        for line in wrapped_completion {
            text_lines.push(Line::from(Span::styled(
                line.to_string(),
                Style::default().fg(Color::White),
            )));
        }

        text_lines.push(Line::from(""));
        text_lines.push(Line::from(Span::styled(
            "─".repeat(area.width.saturating_sub(4) as usize),
            Style::default().fg(Color::DarkGray),
        )));
        text_lines.push(Line::from(""));
    }

    let paragraph = Paragraph::new(text_lines)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title("Story Pages (Enter to continue chatting, Esc to go back)"),
        )
        .wrap(Wrap { trim: false });

    frame.render_widget(paragraph, area);
}

fn render_chat(frame: &mut Frame, area: Rect, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(3)])
        .split(area);

    let mut text_lines = Vec::new();

    for page in &app.current_pages {
        text_lines.push(Line::from(vec![
            Span::styled("You: ", Style::default().fg(Color::Green).add_modifier(Modifier::BOLD)),
            Span::raw(&page.prompt),
        ]));
        text_lines.push(Line::from(""));

        text_lines.push(Line::from(vec![
            Span::styled("AI: ", Style::default().fg(Color::Blue).add_modifier(Modifier::BOLD)),
            Span::raw(&page.completion),
        ]));
        text_lines.push(Line::from(""));
    }

    if app.is_loading {
        text_lines.push(Line::from(Span::styled(
            "AI is thinking...",
            Style::default().fg(Color::Yellow),
        )));
    }

    let chat_history = Paragraph::new(text_lines)
        .block(Block::default().borders(Borders::ALL).title("Conversation"))
        .wrap(Wrap { trim: false });

    frame.render_widget(chat_history, chunks[0]);

    let input = Paragraph::new(app.input_buffer.as_str())
        .style(Style::default().fg(Color::White))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title("Your Message (Enter to send, Esc to go back)"),
        );

    frame.render_widget(input, chunks[1]);
}

fn render_status_bar(frame: &mut Frame, area: Rect, app: &App) {
    let status = Paragraph::new(app.status_message.as_str())
        .style(Style::default().fg(Color::Yellow))
        .alignment(Alignment::Left)
        .block(Block::default().borders(Borders::ALL));

    frame.render_widget(status, area);
}
