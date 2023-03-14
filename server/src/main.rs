use actix_session::{Session, SessionMiddleware};
use actix_session::config::PersistentSession;
use actix_cors::Cors;
use actix_web::{App, dev, get, HttpResponse, HttpServer, post, Responder, Result, web};
use actix_web::cookie::Key;
use actix_web::http::header;
use actix_web::middleware::{ErrorHandlerResponse, ErrorHandlers, Logger};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use tokio_postgres::NoTls;

use crate::db::session_store::PostgresSessionStore;
use crate::models::AppState;
use crate::api::user::authenticate;

mod db;
mod models;
mod api;

#[get("/")]
async fn hello(session: Session) -> Result<impl Responder> {
    if let Some(csrf) = session.get::<String>("csrf")? {
        println!("session found: {}", csrf);
    } else {
        session.insert("csrf", "test")?;
    }

    Ok(HttpResponse::Ok().body("Hello world!"))
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

fn add_error_header<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    res.response_mut().headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("Error"),
    );
    Ok(ErrorHandlerResponse::Response(res.map_into_left_body()))
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = std::env::var("POSTGRES_CONFIG");
    let config_string = match config {
        Ok(config_string) => config_string,
        Err(_) => {
            println!("POSTGRES_CONFIG environment variable must be defined");
            return Ok(())
        },
    };

    let config = config_string.as_str().parse::<tokio_postgres::Config>()
        .map_err( |_| std::io::Error::new(std::io::ErrorKind::NotConnected, "Failed to connect to postgres"))?;

    let mgr_config = ManagerConfig {
        recycling_method: RecyclingMethod::Fast
    };
    let mgr = Manager::from_config(config, NoTls, mgr_config);
    let pool = Pool::builder(mgr).max_size(16).build().unwrap();

    // Try connecting to db
    let _ = pool.get()
        .await
        .map_err(|_| std::io::Error::new(std::io::ErrorKind::NotConnected, "Failed to connect to postgres"))?;

    HttpServer::new(move || {
        let secret_key = Key::generate();
        let cors = Cors::default()
              .allowed_origin("http://localhost:3000")
              .max_age(3600);

        App::new()
            .app_data(AppState {
                pool: pool.clone()
            })
            .wrap(cors)
            .wrap(ErrorHandlers::new()
                .default_handler(add_error_header))
            .wrap(Logger::default())
            .wrap(SessionMiddleware::builder(
                PostgresSessionStore::new(pool.clone()),
                secret_key.clone()
            )
                .session_lifecycle(PersistentSession::default())
                .build()
            )
            .service(hello)
            .service(echo)
            .service(
                web::scope("/api/user")
                    .service(authenticate)
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
