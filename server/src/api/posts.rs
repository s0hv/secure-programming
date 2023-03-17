use actix_session::Session;
use actix_web::{Error, get, HttpResponse, post, Result, web};
use actix_web_validator::{Json, Query};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::api::utilities::require_user;
use crate::db;
use crate::db::models::Post;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(get_posts)
        .service(create_post);
}

#[derive(Deserialize, Validate)]
pub struct ListParams {
    #[validate(range(min = 0, max = 50))]
    limit: Option<i32>,
    #[validate(range(min = 0, max = 1000))]
    offset: Option<i32>,
}

#[derive(Serialize)]
struct PostsList {
    posts: Vec<Post>
}

#[get("")]
pub async fn get_posts(data: web::Data<AppState>, query: Query<ListParams>) -> Result<HttpResponse> {
    let posts = db::posts::get_posts(&data.get_client().await?, query.limit.unwrap_or(10), query.offset.unwrap_or(0)).await?;

    Ok(HttpResponse::Ok().json(PostsList { posts }))
}

#[derive(Deserialize, Validate)]
pub struct CreatePost {
    #[validate(length(min = 1, max = 2000))]
    text: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreatePostResponse {
    post_id: Uuid
}

#[post("/create")]
pub async fn create_post(session: Session, data: web::Data<AppState>, body: Json<CreatePost>) -> Result<HttpResponse, Error> {
    let user_id = require_user(session).await?;
    let post_id = db::posts::create_post(&data.get_client().await?, &user_id, &body.text).await?;

    Ok(HttpResponse::Ok().json(CreatePostResponse { post_id }))
}
