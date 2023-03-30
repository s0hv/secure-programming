use deadpool_postgres::Client;
use log::debug;
use uuid::Uuid;

use crate::db::errors::DbError;
use crate::db::models::Post;

pub async fn get_posts(client: &Client, limit: i32, offset: i32) -> Result<Vec<Post>, DbError> {
    let rows = client.query(
        // language=postgresql
        "
        SELECT post_id, p.user_id, created_at as timestamp, data as text, u.username
        FROM posts p
        INNER JOIN users u on u.user_id = p.user_id
        ORDER BY created_at DESC
        LIMIT $1::INT OFFSET $2::INT", &[&limit, &offset]
    )
        .await
        .map_err(|err| {
            debug!("Error while getting posts. {}", err);
            DbError::InternalError
        })?;

    Ok(rows.into_iter().map(|row| Post::from(&row)).collect())
}

pub async fn create_post(client: &Client, user_id: &Uuid, text: &String) -> Result<Uuid, DbError> {
    let row = client.query_one(
        // language=postgresql
        "INSERT INTO posts (user_id, data) VALUES ($1, $2) RETURNING post_id",
        &[&user_id, &text]
    )
        .await
        .map_err(|err| {
            debug!("Error while creating post. {}", err);
            DbError::InternalError
        })?;

    Ok(row.get("post_id"))
}

pub async fn post_belongs_to_user(client: &Client, user_id: &Uuid, post_id: &Uuid) -> Result<Option<bool>, DbError> {
    let result = client.query_opt(
        // language=postgresql
        "SELECT user_id FROM posts WHERE post_id=$1", &[post_id])
        .await
        .map_err(|err| {
            debug!("Error querying post data. {}", err);
            DbError::InternalError
        })?;

    let row = match result {
        Some(row) => row,
        None => return Ok(None)
    };

    let found_user = match row.try_get::<&str, Uuid>("user_id") {
        Ok(id) => id,
        Err(err) => {
            debug!("Failed to deserialize data. {}", err);
            return Err(DbError::InternalError)
        }
    };

    Ok(Some(&found_user == user_id))
}

pub async fn delete_post(client: &Client, user_id: &Uuid, post_id: &Uuid) -> Result<u64, DbError> {
    let result = client.execute(
        // language=postgresql
        "DELETE FROM posts WHERE user_id=$1 AND post_id=$2", &[user_id, post_id])
        .await
        .map_err(|err| {
            debug!("Error while deleting post. {}", err);
            DbError::InternalError
        })?;

    Ok(result)
}

pub async fn delete_post_admin(client: &Client, post_id: &Uuid) -> Result<u64, DbError> {
    let result = client.execute(
        // language=postgresql
        "DELETE FROM posts WHERE post_id=$1", &[post_id])
        .await
        .map_err(|err| {
            debug!("Error while deleting post. {}", err);
            DbError::InternalError
        })?;

    Ok(result)
}
