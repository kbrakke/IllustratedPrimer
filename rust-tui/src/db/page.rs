use crate::models::Page;
use anyhow::Result;
use chrono::Utc;
use sqlx::SqlitePool;

pub async fn create_page(pool: &SqlitePool, page: &Page) -> Result<()> {
    sqlx::query(
        "INSERT INTO pages (id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&page.id)
    .bind(&page.story_id)
    .bind(page.page_num)
    .bind(&page.prompt)
    .bind(&page.completion)
    .bind(&page.summary)
    .bind(&page.image_path)
    .bind(&page.audio_path)
    .bind(page.created_at)
    .bind(page.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_page_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Page>> {
    let page = sqlx::query_as::<_, Page>(
        "SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
         FROM pages WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(page)
}

pub async fn get_page_by_story_and_num(pool: &SqlitePool, story_id: &str, page_num: i64) -> Result<Option<Page>> {
    let page = sqlx::query_as::<_, Page>(
        "SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
         FROM pages WHERE story_id = ? AND page_num = ?"
    )
    .bind(story_id)
    .bind(page_num)
    .fetch_optional(pool)
    .await?;

    Ok(page)
}

pub async fn list_pages_by_story(pool: &SqlitePool, story_id: &str) -> Result<Vec<Page>> {
    let pages = sqlx::query_as::<_, Page>(
        "SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
         FROM pages WHERE story_id = ? ORDER BY page_num ASC"
    )
    .bind(story_id)
    .fetch_all(pool)
    .await?;

    Ok(pages)
}

pub async fn get_next_page_num(pool: &SqlitePool, story_id: &str) -> Result<i64> {
    let result: Option<(i64,)> = sqlx::query_as(
        "SELECT COALESCE(MAX(page_num), 0) + 1 FROM pages WHERE story_id = ?"
    )
    .bind(story_id)
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|(num,)| num).unwrap_or(1))
}

pub async fn update_page(pool: &SqlitePool, page: &Page) -> Result<()> {
    let now = Utc::now().timestamp();

    sqlx::query(
        "UPDATE pages SET prompt = ?, completion = ?, summary = ?, image_path = ?, audio_path = ?, updated_at = ?
         WHERE id = ?"
    )
    .bind(&page.prompt)
    .bind(&page.completion)
    .bind(&page.summary)
    .bind(&page.image_path)
    .bind(&page.audio_path)
    .bind(now)
    .bind(&page.id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_page(pool: &SqlitePool, id: &str) -> Result<()> {
    sqlx::query("DELETE FROM pages WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}
