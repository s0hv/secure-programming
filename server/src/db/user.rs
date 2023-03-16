use deadpool_postgres::Client;
use uuid::Uuid;

use crate::db::errors::DbError;
use crate::db::models::User;

pub async fn get_user(client: &Client, user_id: Uuid) -> Result<Option<User>, DbError> {
    // language=postgresql
    let row = client.query_opt("SELECT user_id, username, email, admin FROM users WHERE user_id=$1", &[&user_id])
        .await
        .map_err(|_| DbError::InternalError)?;

    match row {
        Some(row) => Ok(Some(User::from(&row))),
        None => Ok(None)
    }
}

pub async fn authenticate(client: &Client, email: &String, password: &String) -> Result<Option<User>, DbError> {
    // language=postgresql
    let row = client.query_opt("SELECT user_id, username, email, admin FROM users WHERE email=$1 AND pwhash=crypt($2, pwhash)", &[email, password])
        .await
        .map_err(|_| DbError::InternalError)?;

    match row {
        Some(row) => Ok(Some(User::from(&row))),
        None => Ok(None)
    }
}
