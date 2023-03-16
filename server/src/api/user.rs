use actix_session::Session;
use actix_web::{error, HttpResponse, post, Result, web};
use serde::Serialize;
use uuid::Uuid;

use crate::api::errors::ApiError;
use crate::db::models::User;
use crate::db::user::get_user;
use crate::models::AppState;

#[derive(Serialize)]
struct UserResponse {
    user: Option<User>
}

#[post("/authenticate")]
pub async fn authenticate(session: Session, data: web::Data<AppState>) -> Result<HttpResponse, error::Error> {
    if let Some(user_id) = session.get::<Uuid>("user_id")? {
        let user = get_user(&data.get_client().await?, user_id).await?;
        if user.is_none() {
            return Err(error::Error::from(ApiError::Unauthorized))
        }

        Ok(HttpResponse::Ok().json(UserResponse { user }))
    } else {
        Ok(
            HttpResponse::Ok()
                .json(UserResponse { user: None })
        )
    }
}
