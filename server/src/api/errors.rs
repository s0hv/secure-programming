use actix_web::{error, HttpResponse};
use actix_web::body::BoxBody;
use actix_web::http::StatusCode;
use derive_more::{Display, Error};
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorResponse<T> where T: Serialize {
    pub error: T
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

#[derive(Serialize)]
struct FieldError {
    field: String,
    messages: Vec<String>,
}

#[derive(Serialize)]
pub struct ValidationErrorJsonPayload {
    message: String,
    fields: Vec<FieldError>,
}

// Map validation errors into json for easier machine readability
impl From<&validator::ValidationErrors> for ValidationErrorJsonPayload {
    fn from(error: &validator::ValidationErrors) -> Self {
        ValidationErrorJsonPayload {
            message: "Validation error".to_owned(),
            fields: error.field_errors().iter().map(|(field, errors)| FieldError {
                field: field.to_string(),
                messages: errors.iter().map(|e| e.code.to_string()).collect(),
            }).collect(),
        }
    }
}
