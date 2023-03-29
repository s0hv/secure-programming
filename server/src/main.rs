use actix_cors::Cors;
use actix_session::config::PersistentSession;
use actix_session::SessionMiddleware;
use actix_web::{App, error, HttpResponse, HttpServer, web};
use actix_web::cookie::Key;
use actix_web::middleware::Logger;
use actix_web_validator::{Error, JsonConfig};
use data_encoding::BASE64;
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use dotenv::dotenv;
use tokio_postgres::NoTls;

use crate::api::errors::{ErrorResponse, ValidationErrorJsonPayload};
use crate::db::session_store::{clear_old_sessions, PostgresSessionStore};
use crate::middleware::CsrfMiddleware;
use crate::models::AppState;

mod db;
mod models;
mod api;
mod middleware;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let config = std::env::var("POSTGRES_CONFIG");
    let config_string = match config {
        Ok(config_string) => config_string,
        Err(_) => {
            eprintln!("POSTGRES_CONFIG environment variable must be defined");
            return Ok(())
        },
    };

    let secret_key = match std::env::var("SESSION_SECRET") {
        Ok(val) => Key::from(val.as_bytes()),
        Err(_) => {
            eprintln!("SESSION_SECRET environment variable must be defined");
            return Ok(())
        }
    };

    let csrf_secret: [u8; 32] = match std::env::var("CSRF_SECRET") {
        Ok(val) => BASE64.decode(val.as_bytes())
            .expect("CSRF_SECRET should be valid a base64 encoded string")
            .try_into()
            .expect("CSRF_SECRET must be exactly 32 bytes long"),
        Err(_) => {
            eprintln!("CSRF_SECRET environment variable must be defined");
            return Ok(())
        }
    };


    let config = config_string.as_str().parse::<tokio_postgres::Config>()
        .map_err( |_| std::io::Error::new(std::io::ErrorKind::NotConnected, "Failed to connect to postgres"))?;

    let mgr_config = ManagerConfig {
        recycling_method: RecyclingMethod::Fast
    };
    let mgr = Manager::from_config(config.clone(), NoTls, mgr_config);
    let pool = Pool::builder(mgr).max_size(16).build().unwrap();

    // Try connecting to db
    let _ = pool.get()
        .await
        .map_err(|_| std::io::Error::new(std::io::ErrorKind::NotConnected, "Failed to connect to postgres"))?;

    let (handle, cance_token) = clear_old_sessions(config);

    // Json error handler for actix-web-validator
    let json_config = JsonConfig::default()
        .error_handler(|err, _req| {
            match err {
                Error::Validate(err) => error::InternalError::from_response(err.clone(),
                    HttpResponse::BadRequest().json(
                        ErrorResponse { error: ValidationErrorJsonPayload::from(&err) })
                ).into(),
                _ => error::InternalError::from_response(err, HttpResponse::BadRequest().finish()).into()
            }
        });

    HttpServer::new(move || {
        #[cfg(debug_assertions)]
        let cors = Cors::permissive();

        #[cfg(not(debug_assertions))]
        let cors = Cors::default();

        App::new()
            .app_data(web::Data::new(AppState {
                pool: pool.clone()
            }))
            .app_data(json_config.clone())
            // Middleware is executed in reverse order
            .wrap(CsrfMiddleware::new(&csrf_secret))
            .wrap(SessionMiddleware::builder(
                PostgresSessionStore::new(pool.clone()),
                secret_key.clone()
            )
                .session_lifecycle(PersistentSession::default())
                .build()
            )
            .wrap(cors)
            .wrap(Logger::default())
            .service(web::scope("/api/auth").configure(api::auth::config))
            .service(web::scope("/api/posts").configure(api::posts::config))
            .service(web::scope("/api/user").configure(api::user::config))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;

    cance_token.cancel();
    let _ = handle.await.unwrap();

    Ok(())
}
