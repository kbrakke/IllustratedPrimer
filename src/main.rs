mod ai;
mod db;
mod models;
mod tui;

use anyhow::Result;
use crossterm::{
    event::KeyCode,
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::backend::CrosstermBackend;
use ratatui::Terminal;
use std::io;
use std::path::PathBuf;
use std::time::Duration;
use tracing::{error, info};

use ai::OpenAIClient;
use db::Database;
use tui::{App, EventHandler};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    dotenvy::dotenv().ok();

    let openai_api_key = std::env::var("OPENAI_API_KEY")
        .expect("OPENAI_API_KEY must be set in environment");

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./data.db".to_string());

    info!("Initializing database connection");
    let db = Database::new(&database_url).await?;

    let migrations_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("migrations");
    info!("Running database migrations");
    db.migrate(&migrations_dir).await?;

    info!("Initializing OpenAI client");
    let ai_client = OpenAIClient::new(openai_api_key);

    info!("Setting up terminal");
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut app = App::new(db.clone(), ai_client);

    info!("Loading initial data");
    if let Err(e) = app.load_users().await {
        error!("Failed to load users: {}", e);
    }

    let event_handler = EventHandler::new(Duration::from_millis(100));

    info!("Starting main event loop");
    let result = run_app(&mut terminal, &mut app, &event_handler).await;

    info!("Cleaning up terminal");
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;

    if let Err(e) = result {
        error!("Application error: {}", e);
        return Err(e);
    }

    db.close().await;
    info!("Application exited successfully");

    Ok(())
}

async fn run_app<B: ratatui::backend::Backend>(
    terminal: &mut Terminal<B>,
    app: &mut App,
    event_handler: &EventHandler,
) -> Result<()> {
    while app.running {
        terminal.draw(|f| tui::ui::render(f, app))?;

        match event_handler.next()? {
            tui::events::Event::Key(key) => {
                if key.code == KeyCode::Enter && app.mode == tui::app::AppMode::Chat {
                    if let Err(e) = app.send_message().await {
                        app.status_message = format!("Error: {}", e);
                    }
                } else if key.code == KeyCode::Char('n') && app.mode == tui::app::AppMode::StoryList {
                    app.input_buffer.clear();
                    app.status_message = "Enter story title:".to_string();
                } else if key.code == KeyCode::Enter && app.mode == tui::app::AppMode::StoryList && !app.input_buffer.is_empty() {
                    let title = app.input_buffer.clone();
                    app.input_buffer.clear();
                    if let Err(e) = app.create_new_story(title).await {
                        app.status_message = format!("Error creating story: {}", e);
                    }
                } else if key.code == KeyCode::Enter && app.mode == tui::app::AppMode::UserSelection {
                    app.handle_key(key);
                    if let Some(user_id) = app.current_user.as_ref().map(|u| u.id.clone()) {
                        if let Err(e) = app.load_stories(&user_id).await {
                            app.status_message = format!("Error loading stories: {}", e);
                        }
                    }
                } else if key.code == KeyCode::Enter && app.mode == tui::app::AppMode::StoryList {
                    app.handle_key(key);
                    if let Some(story_id) = app.current_story.as_ref().map(|s| s.id.clone()) {
                        if let Err(e) = app.load_pages(&story_id).await {
                            app.status_message = format!("Error loading pages: {}", e);
                        }
                    }
                } else {
                    app.handle_key(key);
                }
            }
            tui::events::Event::Resize(_, _) => {}
            tui::events::Event::Mouse(_) => {}
            tui::events::Event::Tick => {}
        }
    }

    Ok(())
}
