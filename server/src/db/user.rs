use deadpool_postgres::Client;
use log::debug;
use tokio_postgres::error::SqlState;
use uuid::Uuid;

use crate::db::errors::DbError;
use crate::db::models::User;

pub async fn get_user(client: &Client, user_id: &Uuid) -> Result<Option<User>, DbError> {
    let row = client.query_opt(
        // language=postgresql
        "SELECT user_id, username, email, admin FROM users WHERE user_id=$1", &[&user_id])
        .await
        .map_err(|err| {
            debug!("Error while gettimg user. {}", err);
            DbError::InternalError
        })?;

    match row {
        Some(row) => Ok(Some(User::from(&row))),
        None => Ok(None)
    }
}

pub async fn authenticate(client: &Client, email: &String, password: &String) -> Result<Option<User>, DbError> {
    let row = client.query_opt(
        // language=postgresql
        "SELECT user_id, username, email, admin FROM users WHERE email=$1 AND pwhash=crypt($2, pwhash)", &[email, password])
        .await
        .map_err(|err| {
            debug!("Error while authenticating user. {}", err);
            DbError::InternalError
        })?;

    match row {
        Some(row) => Ok(Some(User::from(&row))),
        None => Ok(None)
    }
}

pub async fn change_password(client: &Client, user_id: &Uuid, password: &String, new_password: &String) -> Result<bool, DbError> {
    let result = client.execute(
        // language=postgresql
        "UPDATE users SET pwhash=crypt($1, gen_salt('bf')) WHERE user_id=$2 AND pwhash=crypt($3, pwhash)",
        &[&new_password, &user_id, &password]
    )
        .await
        .map_err(|err| {
            debug!("Error while changing password. {}", err);
            DbError::InternalError
        })?;

    if result == 0 {
        Ok(false)
    } else {
        Ok(true)
    }
}

pub async fn create_account(client: &Client, username: &String, email: &String, password: &String) -> Result<Uuid, DbError> {
    let row = client.query_one(
        // language=postgresql
        "INSERT INTO users (username, email, pwhash) VALUES ($1, $2, crypt($3, gen_salt('bf'))) RETURNING user_id",
        &[&username, &email, &password]
    )
        .await
        .map_err(|err| {
            if err.code() == Some(&SqlState::UNIQUE_VIOLATION) {
                return DbError::DuplicateKey
            }

            debug!("Error while creating account. {}", err);
            DbError::InternalError
        })?;

    Ok(row.get("user_id"))
}

pub async fn delete_account(client: &Client, user_id: &Uuid, password: &String) -> Result<bool, DbError> {
    let result = client.execute(
        // language=postgresql
        "DELETE FROM users WHERE user_id=$1 AND pwhash=crypt($2, pwhash)", &[&user_id, &password])
        .await
        .map_err(|err| {
            debug!("Error while deleting account. {}", err);
            DbError::InternalError
        })?;

    if result == 0 {
        Ok(false)
    } else {
        Ok(true)
    }
}
