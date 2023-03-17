use actix_web::{error, HttpResponse};
use actix_web::body::BoxBody;
use actix_web::http::StatusCode;
use derive_more::{Display, Error};
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String
}

#[derive(Debug, Display, Error)]
pub enum ApiError {
    #[display(fmt = "Unauthorized")]
    Unauthorized,

    #[display(fmt = "Forbidden")]
    Forbidden,

    #[display(fmt = "Internal server error")]
    InternalServerError,
}

impl error::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match *self {
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::Forbidden => StatusCode::FORBIDDEN,
            ApiError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR
        }
    }

    fn error_response(&self) -> HttpResponse<BoxBody> {
        HttpResponse::build(self.status_code())
            .json(ErrorResponse { error: self.to_string() })
    }
}
