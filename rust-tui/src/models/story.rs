use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Story {
    pub id: String,
    #[sqlx(rename = "user_id")]
    pub user_id: String,
    pub title: String,
    pub summary: String,
    #[sqlx(rename = "current_page")]
    pub current_page: i64,
    #[sqlx(rename = "created_at")]
    pub created_at: i64,
    #[sqlx(rename = "updated_at")]
    pub updated_at: i64,
}

impl Story {
    pub fn new(user_id: String, title: String) -> Self {
        let now = Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            user_id,
            title,
            summary: String::new(),
            current_page: 1,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn created_at_datetime(&self) -> DateTime<Utc> {
        DateTime::from_timestamp(self.created_at, 0).unwrap_or_default()
    }

    pub fn updated_at_datetime(&self) -> DateTime<Utc> {
        DateTime::from_timestamp(self.updated_at, 0).unwrap_or_default()
    }
}
