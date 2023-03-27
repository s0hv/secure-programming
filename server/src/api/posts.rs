use actix_session::Session;
use actix_web::{delete, Error, get, HttpResponse, post, Result, web};
use actix_web_validator::{Json, Query};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::api::errors::ErrorResponse;
use crate::api::utilities::require_user;
use crate::db;
use crate::db::models::Post;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(get_posts)
        .service(create_post)
        .service(delete_post);
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

#[derive(Deserialize)]
pub struct DeletePostData {
    post_id: Uuid,
}

#[derive(Serialize)]
struct DeletePostResponse {
    message: &'static str
}

#[delete("/delete/{post_id}")]
pub async fn delete_post(session: Session, path: web::Path<DeletePostData>, data: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let user_id = require_user(session).await?;
    let client = data.get_client().await?;

    match db::posts::post_belongs_to_user(&client, &user_id, &path.post_id).await? {
        Some(is_users) => {
            if !is_users {
                return Ok(HttpResponse::Unauthorized().json(ErrorResponse { error: "You are not the owner of this post".into() }))
            }
        }
        None => return Ok(HttpResponse::NotFound().json(ErrorResponse { error: "Post not found".into() }))
    }

    db::posts::delete_post(&client, &user_id, &path.post_id).await?;

    Ok(HttpResponse::Ok().json(DeletePostResponse { message: "Post deleted" }))
}
