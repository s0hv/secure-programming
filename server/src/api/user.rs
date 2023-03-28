use actix_session::Session;
use actix_web::{error, HttpResponse, post, Result, web};
use actix_web_validator::Json;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::api::errors::{ApiError, ErrorResponse};
use crate::api::utilities::require_user;
use crate::db;
use crate::db::models::User;
use crate::db::user::get_user;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(authenticate)
        .service(change_password);
}

#[derive(Serialize)]
struct UserResponse {
    user: Option<User>
}

#[post("/authenticate")]
pub async fn authenticate(session: Session, data: web::Data<AppState>) -> Result<HttpResponse, error::Error> {
    if let Some(user_id) = session.get::<Uuid>("user_id")? {
        let user = get_user(&data.get_client().await?, &user_id).await?;
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

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct ChangePasswordData {
    #[validate(length(min = 1, max = 72))]
    password: String,
    // Bcrypt max length is 72 bytes
    #[validate(length(min = 8, max = 72))]
    new_password: String
}

#[post("/changepassword")]
pub async fn change_password(session: Session, data: web::Data<AppState>, body: Json<ChangePasswordData>) -> Result<HttpResponse, error::Error> {
    let user_id = require_user(&session).await?;
    let client = data.get_client().await?;

    if db::user::change_password(&client, &user_id, &body.password, &body.new_password).await? {
        // TODO invalidate other sessions?
        session.renew();
        Ok(HttpResponse::Ok().finish())
    } else {
        Ok(HttpResponse::Forbidden().json(ErrorResponse { error: "Password invalid".into() }))
    }
}
