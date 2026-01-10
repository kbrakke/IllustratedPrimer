use crate::models::User;
use anyhow::Result;
use chrono::Utc;
use sqlx::SqlitePool;

pub async fn create_user(pool: &SqlitePool, user: &User) -> Result<()> {
    sqlx::query(
        "INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&user.id)
    .bind(&user.name)
    .bind(&user.email)
    .bind(user.email_verified)
    .bind(&user.image)
    .bind(user.created_at)
    .bind(user.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_user_by_id(pool: &SqlitePool, id: &str) -> Result<Option<User>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, name, email, email_verified, image, created_at, updated_at
         FROM users WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn get_user_by_email(pool: &SqlitePool, email: &str) -> Result<Option<User>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, name, email, email_verified, image, created_at, updated_at
         FROM users WHERE email = ?"
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn list_users(pool: &SqlitePool) -> Result<Vec<User>> {
    let users = sqlx::query_as::<_, User>(
        "SELECT id, name, email, email_verified, image, created_at, updated_at
         FROM users ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await?;

    Ok(users)
}

pub async fn update_user(pool: &SqlitePool, user: &User) -> Result<()> {
    let now = Utc::now().timestamp();

    sqlx::query(
        "UPDATE users SET name = ?, email = ?, email_verified = ?, image = ?, updated_at = ?
         WHERE id = ?"
    )
    .bind(&user.name)
    .bind(&user.email)
    .bind(user.email_verified)
    .bind(&user.image)
    .bind(now)
    .bind(&user.id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_user(pool: &SqlitePool, id: &str) -> Result<()> {
    sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}
