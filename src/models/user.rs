use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    #[sqlx(rename = "email_verified")]
    pub email_verified: Option<i64>,
    pub image: Option<String>,
    #[sqlx(rename = "created_at")]
    pub created_at: i64,
    #[sqlx(rename = "updated_at")]
    pub updated_at: i64,
}

impl User {
    pub fn new(name: Option<String>, email: Option<String>) -> Self {
        let now = Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            email,
            email_verified: None,
            image: None,
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
