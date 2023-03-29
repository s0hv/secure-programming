use actix_session::Session;
use actix_web::{HttpResponse, post, Result, web};
use actix_web::http::{header, StatusCode};
use header::LOCATION;
use serde::{Deserialize, Serialize};

use crate::api::errors::ErrorResponse;
use crate::api::utilities::get_session_user;
use crate::db;
use crate::middleware::Csrf;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(login)
        .service(logout)
        .service(get_csrf);
}

#[derive(Deserialize)]
struct LoginForm {
    email: String,
    password: String
}

#[post("/login")]
async fn login(session: Session, data: web::Data<AppState>, form: web::Json<LoginForm>) -> Result<HttpResponse> {
    if get_session_user(&session)?.is_some() {
        return Ok(HttpResponse::Forbidden().json(ErrorResponse { error: "Already logged in" }));
    }

    let user = db::user::authenticate(&data.get_client().await?, &form.email, &form.password).await?;

    let user = match user {
        Some(user) => user,
        None => return Ok(HttpResponse::build(StatusCode::UNAUTHORIZED).body("Forbidden"))
    };

    session.renew();
    session.remove("csrf");
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

#[derive(Serialize)]
struct CsrfResponse {
    csrf: String,
}

#[post("/csrf")]
async fn get_csrf(session: Session, csrf: Csrf) -> Result<HttpResponse> {
    let token = csrf.get_token(session)?;

    Ok(HttpResponse::Ok().json(CsrfResponse { csrf: token }))
}
