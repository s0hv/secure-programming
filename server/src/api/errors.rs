use actix_web::{error, HttpResponse};
use actix_web::body::BoxBody;
use actix_web::http::StatusCode;
use actix_web_validator::JsonConfig;
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

    #[display(fmt = "Invalid credentials")]
    WithMessage {
        message: String,
        status_code: StatusCode,
    }
}

impl error::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match *self {
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::Forbidden => StatusCode::FORBIDDEN,
            ApiError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WithMessage { status_code, .. } => status_code.clone()
        }
    }

    fn error_response(&self) -> HttpResponse<BoxBody> {
        let msg = match *self {
            ApiError::WithMessage { ref message, .. } => message.clone(),
            _ => self.to_string()
        };

        HttpResponse::build(self.status_code())
            .json(ErrorResponse { error: msg })
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

pub fn generate_json_config() -> JsonConfig {
    JsonConfig::default()
        .error_handler(|err, _req| {
            match err {
                // Validation error
                actix_web_validator::Error::Validate(err) => error::InternalError::from_response(err.clone(),
                    HttpResponse::BadRequest().json(
                        ErrorResponse { error: ValidationErrorJsonPayload::from(&err) })
                ).into(),

                // Error with the json payload such as missing fields or invalid data types
                actix_web_validator::Error::JsonPayloadError(err) => {
                    let resp = match &err {
                        // This error message should not have any sensitive information that the user does not already know
                        error::JsonPayloadError::Deserialize(_) => ErrorResponse { error: err.to_string() },
                        _ => ErrorResponse { error: "Invalid JSON payload".to_string() }
                    };
                    error::InternalError::from_response(err, HttpResponse::BadRequest().json(resp)).into()
                },
                _ => error::InternalError::from_response(err, HttpResponse::BadRequest().finish()).into()
            }
        })
}
