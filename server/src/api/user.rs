use actix_web::{post, Responder, Result, web};


use db::models::User;
use crate::db;

#[post("/authenticate")]
pub async fn authenticate() -> Result<impl Responder> {
    let user = User {
        user_id: "82737e6a-b6fe-459c-af56-9fc4f293c515".to_string(),
        username: "Test user".to_string(),
        email: "test@email.com".to_string(),
        admin: false,
    };

    println!("test");
    Ok(web::Json(user))
}
