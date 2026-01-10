#![allow(dead_code)]

use crate::models::Story;
use anyhow::Result;
use chrono::Utc;
use sqlx::SqlitePool;

pub async fn create_story(pool: &SqlitePool, story: &Story) -> Result<()> {
    sqlx::query(
        "INSERT INTO stories (id, user_id, title, summary, current_page, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&story.id)
    .bind(&story.user_id)
    .bind(&story.title)
    .bind(&story.summary)
    .bind(story.current_page)
    .bind(story.created_at)
    .bind(story.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_story_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Story>> {
    let story = sqlx::query_as::<_, Story>(
        "SELECT id, user_id, title, summary, current_page, created_at, updated_at
         FROM stories WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(story)
}

pub async fn list_stories_by_user(pool: &SqlitePool, user_id: &str) -> Result<Vec<Story>> {
    let stories = sqlx::query_as::<_, Story>(
        "SELECT id, user_id, title, summary, current_page, created_at, updated_at
         FROM stories WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(stories)
}

pub async fn update_story(pool: &SqlitePool, story: &Story) -> Result<()> {
    let now = Utc::now().timestamp();

    sqlx::query(
        "UPDATE stories SET title = ?, summary = ?, current_page = ?, updated_at = ?
         WHERE id = ?"
    )
    .bind(&story.title)
    .bind(&story.summary)
    .bind(story.current_page)
    .bind(now)
    .bind(&story.id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_story(pool: &SqlitePool, id: &str) -> Result<()> {
    sqlx::query("DELETE FROM stories WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn increment_current_page(pool: &SqlitePool, story_id: &str) -> Result<()> {
    let now = Utc::now().timestamp();

    sqlx::query(
        "UPDATE stories SET current_page = current_page + 1, updated_at = ?
         WHERE id = ?"
    )
    .bind(now)
    .bind(story_id)
    .execute(pool)
    .await?;

    Ok(())
}
