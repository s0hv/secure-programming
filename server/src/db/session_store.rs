use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use actix_session::{storage::SessionStore};
use actix_session::storage::{LoadError, SaveError, SessionKey, UpdateError};
use actix_web::cookie::time::Duration;
use deadpool_postgres::{Pool};
use rand::{distributions::Alphanumeric, rngs::OsRng, Rng as _};


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
}

#[async_trait::async_trait(?Send)]
impl SessionStore for PostgresSessionStore {
    async fn load(&self, session_key: &SessionKey) -> Result<Option<SessionState>, LoadError> {
        let client = self.pool.get()
            .await
            .map_err(anyhow::Error::new)
            .map_err(LoadError::Other)?;

        let session_id = session_key.as_ref();

        // language=sql
        let row = client.query_opt("SELECT data FROM sessions WHERE expires_at > CURRENT_TIMESTAMP AND session_id=$1", &[&session_id.to_string()])
            .await
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
            .map_err(Into::into)
            .map_err(LoadError::Deserialization)
    }

    async fn save(&self, session_state: SessionState, ttl: &Duration) -> Result<SessionKey, SaveError> {
        let session_key = generate_session_key();
        let client = self.pool.get().await
            .map_err(anyhow::Error::new)
            .map_err(SaveError::Other)?;


        let data = serde_json::to_string(&session_state)
            .map_err(Into::into)
            .map_err(SaveError::Serialization)?;

        match client.execute(
            // language=sql
            "INSERT INTO sessions (session_id, expires_at, data) VALUES ($1, CURRENT_TIMESTAMP + $2::BIGINT * INTERVAL '1 second', $3)"
        , &[&session_key.as_ref().to_string(), &ttl.whole_seconds(), &data])
            .await
            .map_err(anyhow::Error::new)
            .map_err(SaveError::Other)

        {
            Ok(_) => Ok(session_key),
            Err(err) => Err(err)
        }
    }

    async fn update(&self, session_key: SessionKey, session_state: SessionState, ttl: &Duration) -> Result<SessionKey, UpdateError> {
        let client = self.pool.get().await
            .map_err(anyhow::Error::new)
            .map_err(UpdateError::Other)?;

        let data = serde_json::to_string(&session_state)
            .map_err(Into::into)
            .map_err(UpdateError::Serialization)?;

        let updated = client.execute(
            // language=sql
            "UPDATE sessions SET data=$1, expires_at=CURRENT_TIMESTAMP + $2::BIGINT * INTERVAL '1 second' WHERE session_id=$3",
            &[&data, &ttl.whole_seconds(), &session_key.as_ref().to_string()]
        )
            .await
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
        let client = self.pool.get().await
            .map_err(anyhow::Error::new)?;

        match client.execute(
            // language=sql
            "UPDATE sessions SET expires_at=CURRENT_TIMESTAMP + $1::BIGINT * INTERVAL '1 second' WHERE session_id=$2",
            &[&ttl.whole_seconds(), &session_key.as_ref().to_string()]
        )
            .await
            .map_err(anyhow::Error::new)
        {
            Ok(_) => Ok(()),
            Err(err) => Err(err)
        }
    }

    async fn delete(&self, session_key: &SessionKey) -> Result<(), anyhow::Error> {
        let client = self.pool.get().await
            .map_err(anyhow::Error::new)?;

        match client.execute(
            // language=sql
            "DELETE FROM sessions WHERE session_id=$1",
            &[&session_key.as_ref().to_string()]
        )
            .await
            .map_err(anyhow::Error::new)
        {
            Ok(_) => Ok(()),
            Err(err) => Err(err)
        }
    }
}
