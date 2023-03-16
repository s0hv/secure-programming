use deadpool_postgres::{Client, Pool};
use log::debug;

use crate::db::errors::DbError;

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool,
}

impl AppState {
    pub async fn get_client(&self) -> Result<Client, DbError> {
        self.pool.get().await.map_err(|err| {
            debug!("Failed to get connection: {}", err);
            DbError::ConnectError
        })
    }
}

