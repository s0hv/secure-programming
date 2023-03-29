use actix_session::Session;
use actix_web::Result;
use log::debug;
use uuid::Uuid;

use crate::api::errors::ApiError;

pub fn get_session_user(session: &Session) -> Result<Option<Uuid>, ApiError> {
    let user_id = session.get::<Uuid>("user_id")
    .map_err(|err| {
        debug!("Failed to get user id from session. {}", err);
        ApiError::InternalServerError
    })?;

    Ok(user_id)
}

pub fn require_user(session: &Session) -> Result<Uuid, ApiError> {
    let user_id = get_session_user(&session)?;

    match user_id {
        Some(user_id) => Ok(user_id),
        None => Err(ApiError::Forbidden)
    }
}
