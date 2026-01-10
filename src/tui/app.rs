use crate::ai::OpenAIClient;
use crate::db::Database;
use crate::models::{Page, Story, User};
use anyhow::Result;
use crossterm::event::{KeyCode, KeyEvent, KeyModifiers};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AppMode {
    UserSelection,
    StoryList,
    StoryView,
    Chat,
}

pub struct App {
    pub running: bool,
    pub mode: AppMode,
    pub current_user: Option<User>,
    pub users: Vec<User>,
    pub stories: Vec<Story>,
    pub current_story: Option<Story>,
    pub current_pages: Vec<Page>,
    pub input_buffer: String,
    pub conversation_history: Vec<String>,
    pub selected_index: usize,
    pub db: Database,
    pub ai_client: OpenAIClient,
    pub status_message: String,
    pub is_loading: bool,
}

impl App {
    pub fn new(db: Database, ai_client: OpenAIClient) -> Self {
        Self {
            running: true,
            mode: AppMode::UserSelection,
            current_user: None,
            users: Vec::new(),
            stories: Vec::new(),
            current_story: None,
            current_pages: Vec::new(),
            input_buffer: String::new(),
            conversation_history: Vec::new(),
            selected_index: 0,
            db,
            ai_client,
            status_message: String::from("Welcome to Illustrated Primer"),
            is_loading: false,
        }
    }

    pub async fn load_users(&mut self) -> Result<()> {
        self.users = crate::db::user::list_users(self.db.pool()).await?;
        if self.users.is_empty() {
            let user = User::new(Some("Demo User".to_string()), Some("demo@example.com".to_string()));
            crate::db::user::create_user(self.db.pool(), &user).await?;
            self.users.push(user);
        }
        Ok(())
    }

    pub async fn load_stories(&mut self, user_id: &str) -> Result<()> {
        self.stories = crate::db::story::list_stories_by_user(self.db.pool(), user_id).await?;
        Ok(())
    }

    pub async fn load_pages(&mut self, story_id: &str) -> Result<()> {
        self.current_pages = crate::db::page::list_pages_by_story(self.db.pool(), story_id).await?;

        self.conversation_history.clear();
        for page in &self.current_pages {
            self.conversation_history.push(page.prompt.clone());
            self.conversation_history.push(page.completion.clone());
        }

        Ok(())
    }

    pub async fn create_new_story(&mut self, title: String) -> Result<()> {
        if let Some(user) = &self.current_user {
            let story = Story::new(user.id.clone(), title);
            crate::db::story::create_story(self.db.pool(), &story).await?;
            self.current_story = Some(story);
            self.current_pages.clear();
            self.conversation_history.clear();
            self.mode = AppMode::Chat;
            self.status_message = "New story created. Start chatting!".to_string();
        }
        Ok(())
    }

    pub async fn send_message(&mut self) -> Result<()> {
        if self.input_buffer.is_empty() {
            return Ok(());
        }

        let user_message = self.input_buffer.clone();
        self.input_buffer.clear();
        self.is_loading = true;
        self.status_message = "AI is thinking...".to_string();

        let response = self.ai_client
            .generate_story_response(user_message.clone(), self.conversation_history.clone())
            .await?;

        if let Some(story) = &self.current_story {
            let page_num = crate::db::page::get_next_page_num(self.db.pool(), &story.id).await?;
            let page = Page::new(story.id.clone(), page_num, user_message.clone(), response.clone());
            crate::db::page::create_page(self.db.pool(), &page).await?;

            crate::db::story::increment_current_page(self.db.pool(), &story.id).await?;

            self.current_pages.push(page);
            self.conversation_history.push(user_message);
            self.conversation_history.push(response);
        }

        self.is_loading = false;
        self.status_message = "Message sent!".to_string();

        Ok(())
    }

    pub fn handle_key(&mut self, key: KeyEvent) {
        match key.code {
            KeyCode::Char('q') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                self.running = false;
            }
            KeyCode::Esc => {
                self.go_back();
            }
            KeyCode::Enter => {
                self.handle_enter();
            }
            KeyCode::Up => {
                if self.selected_index > 0 {
                    self.selected_index -= 1;
                }
            }
            KeyCode::Down => {
                self.selected_index += 1;
            }
            KeyCode::Char(c) => {
                if self.mode == AppMode::Chat {
                    self.input_buffer.push(c);
                }
            }
            KeyCode::Backspace => {
                if self.mode == AppMode::Chat {
                    self.input_buffer.pop();
                }
            }
            _ => {}
        }
    }

    fn handle_enter(&mut self) {
        match self.mode {
            AppMode::UserSelection => {
                if let Some(user) = self.users.get(self.selected_index).cloned() {
                    self.current_user = Some(user);
                    self.mode = AppMode::StoryList;
                    self.selected_index = 0;
                    self.status_message = "Loading stories...".to_string();
                }
            }
            AppMode::StoryList => {
                if let Some(story) = self.stories.get(self.selected_index).cloned() {
                    self.current_story = Some(story);
                    self.mode = AppMode::StoryView;
                    self.selected_index = 0;
                    self.status_message = "Loading story pages...".to_string();
                }
            }
            AppMode::StoryView => {
                self.mode = AppMode::Chat;
                self.status_message = "Chat mode - type your message".to_string();
            }
            AppMode::Chat => {}
        }
    }

    fn go_back(&mut self) {
        match self.mode {
            AppMode::UserSelection => {
                self.running = false;
            }
            AppMode::StoryList => {
                self.mode = AppMode::UserSelection;
                self.current_user = None;
                self.stories.clear();
                self.selected_index = 0;
            }
            AppMode::StoryView => {
                self.mode = AppMode::StoryList;
                self.current_story = None;
                self.current_pages.clear();
                self.selected_index = 0;
            }
            AppMode::Chat => {
                if self.input_buffer.is_empty() {
                    self.mode = AppMode::StoryView;
                } else {
                    self.input_buffer.clear();
                }
            }
        }
    }
}
