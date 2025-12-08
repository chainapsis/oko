use crate::types::{Error, KeyShareNodeUser, Result};
use tokio_postgres::Client;
use uuid::Uuid;

pub async fn create_user(client: &Client, email: &str) -> Result<KeyShareNodeUser> {
    let query = "INSERT INTO users (email) VALUES ($1) RETURNING *";

    let row = client.query_one(query, &[&email]).await?;

    Ok(KeyShareNodeUser {
        user_id: row.get("user_id"),
        email: row.get("email"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    })
}

pub async fn get_user_by_email(client: &Client, email: &str) -> Result<Option<KeyShareNodeUser>> {
    let query = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    let rows = client.query(query, &[&email]).await?;

    if let Some(row) = rows.first() {
        Ok(Some(KeyShareNodeUser {
            user_id: row.get("user_id"),
            email: row.get("email"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }))
    } else {
        Ok(None)
    }
}

pub async fn get_user_from_user_id(client: &Client, user_id: Uuid) -> Result<KeyShareNodeUser> {
    let query = "SELECT * FROM users WHERE user_id = $1 LIMIT 1";
    let row = client
        .query_one(query, &[&user_id])
        .await
        .map_err(|_| Error::Custom("User not found".to_string()))?;

    Ok(KeyShareNodeUser {
        user_id: row.get("user_id"),
        email: row.get("email"),
        status: row.get("status"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    })
}
