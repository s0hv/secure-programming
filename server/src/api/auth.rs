use actix_session::Session;
use actix_web::{HttpResponse, post, Result, web};
use actix_web::http::{header, StatusCode};
use header::LOCATION;
use serde::Deserialize;

use crate::db;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
}

#[derive(Deserialize)]
struct LoginForm {
    email: String,
    password: String
}

#[post("/login")]
async fn login(session: Session, data: web::Data<AppState>, form: web::Json<LoginForm>) -> Result<HttpResponse> {
    let user = db::user::authenticate(&data.get_client().await?, &form.email, &form.password).await?;

    let user = match user {
        Some(user) => user,
        None => return Ok(HttpResponse::build(StatusCode::UNAUTHORIZED).body("Forbidden"))
    };

    session.renew();
    session.insert("user_id", user.user_id.clone())?;

    Ok(HttpResponse::Ok()
        .json(user))
}

#[post("/logout")]
async fn logout(session: Session) -> HttpResponse {
    session.purge();

    HttpResponse::SeeOther()
        .insert_header((LOCATION, "/"))
        .finish()
}
