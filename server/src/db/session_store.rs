use std::collections::HashMap;

use actix_session::storage::{LoadError, SaveError, SessionKey, UpdateError};
use actix_session::storage::SessionStore;
use actix_web::cookie::time::Duration;
use deadpool_postgres::{Client, Manager, ManagerConfig, Pool, PoolError, RecyclingMethod};
use log::debug;
use rand::{distributions::Alphanumeric, Rng as _, rngs::OsRng};
use serde::{Deserialize, Serialize};
use tokio_postgres::{Config, NoTls};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

pub fn clear_old_sessions(config: Config) -> (tokio::task::JoinHandle<Result<(), PoolError>>, CancellationToken) {
    let cancel_token = CancellationToken::new();

    (
        tokio::spawn(session_clear_job(config, cancel_token.clone())),
        cancel_token
    )
}

async fn session_clear_job(config: Config, cancel_token: CancellationToken) -> Result<(), PoolError> {
    let mgr_config = ManagerConfig {
        recycling_method: RecyclingMethod::Fast
    };
    let mgr = Manager::from_config(config, NoTls, mgr_config);
    let pool = Pool::builder(mgr).max_size(1).build().unwrap();

    loop {
        let client = pool.get().await?;
        // language=sql
        client.execute("DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP", &[]).await?;

        tokio::select! {
            _ = tokio::time::sleep(std::time::Duration::from_secs(60 * 60 * 2)) => {
                continue;
            }

            _ = cancel_token.cancelled() => {
                break;
            }
        }
    }

    Ok(())
}


pub struct PostgresSessionStore {
    pool: Pool
}

type SessionState = HashMap<String, String>;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SessionData {
    csrf: String
}

/// https://docs.rs/actix-session/latest/src/actix_session/storage/utils.rs.html
fn generate_session_key() -> SessionKey {
    let value = std::iter::repeat(())
        .map(|()| OsRng.sample(Alphanumeric))
        .take(64)
        .collect::<Vec<_>>();

    // These unwraps will never panic because pre-conditions are always verified
    // (i.e. length and character set)
    String::from_utf8(value).unwrap().try_into().unwrap()
}

impl PostgresSessionStore {
    pub fn new(pool: Pool) -> PostgresSessionStore {
        PostgresSessionStore {
            pool
        }
    }

    pub async fn get_client(&self) -> Result<Client, anyhow::Error> {
        self.pool.get()
            .await
            .map_err(|err| {
                debug!("Failed to get connection. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
    }
}

#[async_trait::async_trait(?Send)]
impl SessionStore for PostgresSessionStore {
    async fn load(&self, session_key: &SessionKey) -> Result<Option<SessionState>, LoadError> {
        let client = self.get_client()
            .await
            .map_err(LoadError::Other)?;

        let session_id = session_key.as_ref();

        let row = client.query_opt(
            // language=postgresql
            "
            SELECT data
            FROM sessions
            WHERE expires_at > CURRENT_TIMESTAMP AND session_id=$1", &[&session_id.to_string()]
        )
            .await
            .map_err(|err| {
                debug!("Failed to load session. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
            .map_err(LoadError::Deserialization);

        let data: String = match row {
            Ok(row) => match row {
                Some(item) => item.get("data"),
                None => return Ok(None),
            },
            Err(err) => return Err(err)
        };

        serde_json::from_str(&data)
            .map_err(|err| {
                debug!("Failed to serialize session data after load. {}", err);
                err
            })
            .map_err(Into::into)
            .map_err(LoadError::Deserialization)
    }

    async fn save(&self, session_state: SessionState, ttl: &Duration) -> Result<SessionKey, SaveError> {
        let session_key = generate_session_key();
        let client = self.get_client()
            .await
            .map_err(SaveError::Other)?;

        let data = serde_json::to_string(&session_state)
            .map_err(|err| {
                debug!("Failed to serialize session. {}", err);
                err
            })
            .map_err(Into::into)
            .map_err(SaveError::Serialization)?;

        // The value is deserialized to json on insert
        let user_id: Option<Uuid> = match session_state.get("user_id")
            .map(|v| serde_json::from_str::<String>(v).unwrap())
            .map(|v|
                Uuid::parse_str(v.as_str())
                    .map_err(|err| {
                        debug!("Failed to parse session user id as uuid. {}", err);
                        err
                    })
                    .map_err(anyhow::Error::new)
                    .map_err(SaveError::Serialization))
        {
            Some(val) => Some(val?),
            None => None
        };

        match client.execute(
            // language=sql
            "
            INSERT INTO sessions (session_id, expires_at, data, user_id)
            VALUES ($1, CURRENT_TIMESTAMP + $2::BIGINT * INTERVAL '1 second', $3, $4)"
        , &[&session_key.as_ref().to_string(), &ttl.whole_seconds(), &data, &user_id])
            .await
            .map_err(|err| {
                debug!("Failed to save session. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
            .map_err(SaveError::Other)
        {
            Ok(_) => Ok(session_key),
            Err(err) => Err(err)
        }
    }

    async fn update(&self, session_key: SessionKey, session_state: SessionState, ttl: &Duration) -> Result<SessionKey, UpdateError> {
        let client = self.get_client()
            .await
            .map_err(UpdateError::Other)?;

        let data = serde_json::to_string(&session_state)
            .map_err(|err| {
                debug!("Failed to serialize data in update session. {}", err);
                err
            })
            .map_err(Into::into)
            .map_err(UpdateError::Serialization)?;

        let updated = client.execute(
            // language=sql
            "
            UPDATE sessions
            SET data=$1, expires_at=CURRENT_TIMESTAMP + $2::BIGINT * INTERVAL '1 second'
            WHERE session_id=$3",
            &[&data, &ttl.whole_seconds(), &session_key.as_ref().to_string()]
        )
            .await
            .map_err(|err| {
                debug!("Failed to update session to db. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
            .map_err(UpdateError::Other);

        let updated_rows = match updated {
            Ok(rows) => rows,
            Err(err) => return Err(err)
        };

        if updated_rows == 0 {
            return self.save(session_state, ttl)
                .await
                .map_err(anyhow::Error::new)
                .map_err(UpdateError::Other)
        }

        Ok(session_key)
    }

    async fn update_ttl(&self, session_key: &SessionKey, ttl: &Duration) -> Result<(), anyhow::Error> {
        let client = self.get_client().await?;

        match client.execute(
            // language=sql
            "
            UPDATE sessions
            SET expires_at=CURRENT_TIMESTAMP + $1::BIGINT * INTERVAL '1 second'
            WHERE session_id=$2",
            &[&ttl.whole_seconds(), &session_key.as_ref().to_string()]
        )
            .await
            .map_err(|err| {
                debug!("Failed to update session ttl. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
        {
            Ok(_) => Ok(()),
            Err(err) => Err(err)
        }
    }

    async fn delete(&self, session_key: &SessionKey) -> Result<(), anyhow::Error> {
        let client = self.get_client().await?;

        match client.execute(
            // language=sql
            "DELETE FROM sessions WHERE session_id=$1",
            &[&session_key.as_ref().to_string()]
        )
            .await
            .map_err(|err| {
                debug!("Failed to delete session. {}", err);
                err
            })
            .map_err(anyhow::Error::new)
        {
            Ok(_) => Ok(()),
            Err(err) => Err(err)
        }
    }
}
