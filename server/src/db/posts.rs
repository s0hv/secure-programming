use deadpool_postgres::Client;
use log::debug;

use crate::db::errors::DbError;
use crate::db::models::Post;

pub async fn get_posts(client: &Client, limit: i32, offset: i32) -> Result<Vec<Post>, DbError> {
    // language=postgresql
    let rows = client.query("
        SELECT post_id, p.user_id, created_at as timestamp, data as text, u.username
        FROM posts p
        INNER JOIN users u on u.user_id = p.user_id
        LIMIT $1::INT OFFSET $2::INT", &[&limit, &offset]
    )
        .await
        .map_err(|err| {
            debug!("Error while getting posts. {}", err);
            DbError::InternalError
        })?;

    Ok(rows.into_iter().map(|row| Post::from(&row)).collect())
}
