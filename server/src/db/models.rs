use serde::{Serialize};

#[derive(Serialize)]
pub struct User {
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub admin: bool,
}
