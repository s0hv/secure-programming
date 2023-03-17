use actix_session::Session;
use actix_web::Result;
use log::debug;
use uuid::Uuid;

use crate::api::errors::ApiError;

pub async fn require_user(session: Session) -> Result<Uuid, ApiError> {
    let user_id = session.get::<Uuid>("user_id")
    .map_err(|err| {
        debug!("Failed to get user id from session. {}", err);
        ApiError::InternalServerError
    })?;

    match user_id {
        Some(user_id) => Ok(user_id),
        None => Err(ApiError::Forbidden)
    }
}
