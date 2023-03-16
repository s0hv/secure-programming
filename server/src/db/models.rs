use serde::Serialize;
use tokio_postgres::Row;
use uuid::Uuid;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub admin: bool,
}

impl From<&Row> for User {
    fn from(row: &Row) -> Self {
        Self {
            user_id: row.get("user_id"),
            username: row.get("username"),
            email: row.get("email"),
            admin: row.get("admin"),
        }
    }
}
