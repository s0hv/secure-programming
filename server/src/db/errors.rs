use actix_web::{error, HttpResponse};
use actix_web::body::BoxBody;
use actix_web::http::StatusCode;
use derive_more::{Display, Error};
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorResponse {
    error: &'static str
}

#[derive(Debug, Display, Error)]
pub enum DbError {
    #[display(fmt = "Internal server error")]
    InternalError,

    #[display(fmt = "Entry already exists")]
    DuplicateError,

    #[display(fmt = "Failed to connect to db")]
    ConnectError,
}

impl error::ResponseError for DbError {
    fn error_response(&self) -> HttpResponse<BoxBody> {
        HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .json(ErrorResponse { error: "Internal server error" })
    }
}
