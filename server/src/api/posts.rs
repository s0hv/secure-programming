use actix_web::{get, HttpResponse, Result, web};
use actix_web_validator::Query;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::db;
use crate::db::models::Post;
use crate::models::AppState;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(get_posts);
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
