use deadpool_postgres::{Client, Pool};

use crate::db::errors::DbError;

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool,
}

impl AppState {
    pub async fn get_client(&self) -> Result<Client, DbError> {
        self.pool.get().await.map_err(|_| DbError::ConnectError)
    }
}

