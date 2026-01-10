use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Page {
    pub id: String,
    #[sqlx(rename = "story_id")]
    pub story_id: String,
    #[sqlx(rename = "page_num")]
    pub page_num: i64,
    pub prompt: String,
    pub completion: String,
    pub summary: String,
    #[sqlx(rename = "image_path")]
    pub image_path: Option<String>,
    #[sqlx(rename = "audio_path")]
    pub audio_path: Option<String>,
    #[sqlx(rename = "created_at")]
    pub created_at: i64,
    #[sqlx(rename = "updated_at")]
    pub updated_at: i64,
}

impl Page {
    pub fn new(story_id: String, page_num: i64, prompt: String, completion: String) -> Self {
        let now = Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            story_id,
            page_num,
            prompt,
            completion,
            summary: String::new(),
            image_path: None,
            audio_path: None,
            created_at: now,
            updated_at: now,
        }
    }

    #[allow(dead_code)]
    pub fn created_at_datetime(&self) -> DateTime<Utc> {
        DateTime::from_timestamp(self.created_at, 0).unwrap_or_default()
    }

    #[allow(dead_code)]
    pub fn updated_at_datetime(&self) -> DateTime<Utc> {
        DateTime::from_timestamp(self.updated_at, 0).unwrap_or_default()
    }
}
