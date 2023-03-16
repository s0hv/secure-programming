use chrono::{DateTime, Utc};
use serde::Serialize;
use tokio_postgres::Row;
use uuid::Uuid;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub admin: bool,
}

impl From<&Row> for User {
    fn from(row: &Row) -> Self {
        Self {
            user_id: row.get("user_id"),
            username: row.get("username"),
            email: row.get("email"),
            admin: row.get("admin"),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PostUser {
    pub user_id: Uuid,
    pub username: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    pub user: PostUser,
    pub post_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub text: String,
}

impl From<&Row> for Post {
    fn from(row: &Row) -> Self {
        Self {
            user: PostUser {
                user_id: row.get("user_id"),
                username: row.get("username")
            },
            post_id: row.get("post_id"),
            timestamp: row.get("timestamp"),
            text: row.get("text"),
        }
    }
}

