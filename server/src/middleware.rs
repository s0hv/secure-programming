use std::cell::RefCell;
use std::collections::HashSet;
use std::fmt::Debug;
use std::future::{ready, Ready};
use std::rc::Rc;

use actix_session::{Session, SessionExt};
use actix_web::{dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform}, Error, FromRequest, HttpMessage, HttpRequest, HttpResponse, ResponseError};
use actix_web::body::EitherBody;
use actix_web::dev::{Extensions, Payload};
use actix_web::http::{Method, StatusCode};
// AES not used as it might be vulnerable to timing based attacks and is more brittle overall.
// Might not perform as well but that is of no concern.
use csrf::{ChaCha20Poly1305CsrfProtection, CsrfProtection};
use data_encoding::BASE64;
use derive_more::Display;
use futures_util::future::LocalBoxFuture;
use futures_util::FutureExt;
use log::debug;
use serde::Serialize;

use crate::api::errors::ApiError;

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.
pub struct CsrfMiddleware(Rc<Config>);

#[derive(Debug, Clone)]
struct Config {
    secret: [u8; 32],
    exclude: HashSet<String>,
    methods: HashSet<Method>,
}

impl CsrfMiddleware {
    pub fn new(secret: &[u8; 32]) -> Self {
        Self(Rc::new(Config {
            secret: secret.clone(),
            exclude: HashSet::from(["/api/auth/csrf".to_string()]),
            methods: HashSet::from([Method::POST, Method::PUT, Method::DELETE])
        }))
    }
}

#[derive(Clone)]
pub struct Csrf(Rc<RefCell<CsrfInner>>);

impl Csrf {
    pub(crate) fn get_csrf(extensions: &mut Extensions) -> Csrf {
        if let Some(c_impl) = extensions.get::<Rc<RefCell<CsrfInner>>>() {
            return Csrf(Rc::clone(c_impl));
        }

        let inner = Rc::new(RefCell::new(CsrfInner::default()));
        extensions.insert(inner.clone());

        Csrf(inner)
    }

    pub(crate) fn set_csrf(req: &mut ServiceRequest, secret: &[u8; 32]) {
        let csrf = Csrf::get_csrf(&mut *req.extensions_mut());
        let mut inner = csrf.0.borrow_mut();
        inner.secret = secret.clone();
    }

    /// Generates a new session token. Tries to use the previous token as the base if it can be parsed.
    /// Otherwise a fresh new token pair is generated.
    pub fn get_token(&self, session: Session) -> Result<String, Error> {
        let protection = ChaCha20Poly1305CsrfProtection::from_key(self.0.borrow().secret);
        let prev_token: Option<[u8; 64]> = match session.get::<String>("csrf")?
            .map(|v| BASE64.decode(v.as_bytes()).ok())
        {
            Some(prev_token) => {
                let prev_token = match prev_token {
                    Some(token) => protection.parse_token(token.as_slice()).ok(),
                    None => None
                };

                match prev_token {
                    Some(token) => Some(token.value().try_into().unwrap()),
                    // If decoding fails csrf secret has most likely changed. Regenerate the token in that case
                    None => {
                        session.remove("csrf");
                        None
                    }
                }
            },
            None => None
        };

        let (token, cookie) = protection.generate_token_pair(prev_token.as_ref(), 8600)
            .map_err(|err| {
                debug!("Failed to generate token pair. {}", err);
                ApiError::Forbidden
            })?;

        session.insert("csrf", token.b64_string())
            .map_err(|err| {
                debug!("Failed to insert csrf token to session. {}", err);
                ApiError::Forbidden
            })?;

        Ok(cookie.b64_string())
    }
}

#[derive(Default)]
struct CsrfInner {
    secret: [u8; 32],
}

impl FromRequest for Csrf {
    type Error = Error;
    type Future = Ready<Result<Csrf, Error>>;

    #[inline]
    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        ready(Ok(Csrf::get_csrf(&mut *req.extensions_mut())))
    }
}

#[derive(Display, Debug, derive_more::Error)]
enum CsrfError {
    #[display(fmt = "CSRF token is missing")]
    CsrfMissing,

    #[display(fmt = "CSRF token is invalid")]
    CsrfInvalid,
}

#[derive(Serialize)]
struct CsrfErrorResponse {
    error: String,
}

impl ResponseError for CsrfError {
    fn status_code(&self) -> StatusCode {
        StatusCode::FORBIDDEN
    }

    fn error_response(&self) -> HttpResponse {
        debug!("{}", self.to_string());
        HttpResponse::Forbidden()
            .json(CsrfErrorResponse {error: self.to_string() })
    }
}


// Middleware factory is `Transform` trait
// `S` - type of the next service
// `B` - type of response's body
impl<S, B> Transform<S, ServiceRequest> for CsrfMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Transform = CsrfMiddlewareLogic<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(CsrfMiddlewareLogic {
            service: Rc::new(service),
            config: self.0.clone()
        }))
    }
}

pub struct CsrfMiddlewareLogic<S> {
    service: Rc<S>,
    config: Rc<Config>
}


impl<S, B> Service<ServiceRequest> for CsrfMiddlewareLogic<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
	    // Clone the Rc pointers so we can move them into the async block.
        let srv = self.service.clone();
        let config = Rc::clone(&self.config);

        async move {
            Csrf::set_csrf(&mut req, &config.secret);

            if !config.methods.contains(&req.method()) || config.exclude.contains(req.path()) {
                return Ok(srv.call(req).await.map(ServiceResponse::map_into_left_body)?);
            }


            // Get the session cookie value, if it exists.
            let sess = req.get_session();
            let csrf = match req.headers().get("X-CSRF-TOKEN") {
                Some(csrf) =>
                    match BASE64.decode(csrf.as_bytes()) {
                        Ok(v) => v,
                        Err(err) => {
                            debug!("Failed to decode csrf token from header. {}", err);
                            // Errors must be done like this since throwing them discards the body.
                            // With this method the body is included
                            return Ok(req.error_response(CsrfError::CsrfInvalid).map_into_right_body())
                        }
                    },
                None => return Ok(req.error_response(CsrfError::CsrfMissing).map_into_right_body())
            };

            let saved_csrf = match sess.get::<String>("csrf")? {
                Some(csrf) =>
                    match BASE64.decode(csrf.as_bytes()) {
                        Ok(v) => v,
                        Err(err) => {
                            debug!("Failed to decode csrf token from session. {}", err);
                            return Ok(req.error_response(CsrfError::CsrfInvalid).map_into_right_body())
                        }
                    },
                None => return Ok(req.error_response(CsrfError::CsrfMissing).map_into_right_body())
            };

            let protection = ChaCha20Poly1305CsrfProtection::from_key(config.secret);

            let parsed_csrf = match protection.parse_cookie(&csrf) {
                Ok(v) => v,
                Err(err) => {
                    debug!("Failed to parse csrf token from header. {}", err);
                    return Ok(req.error_response(CsrfError::CsrfInvalid).map_into_right_body());
                }
            };

            let parsed_token = match protection.parse_token(&saved_csrf){
                Ok(v) => v,
                Err(err) => {
                    debug!("Failed to parse csrf token from session. {}", err);
                    return Ok(req.error_response(CsrfError::CsrfInvalid).map_into_right_body());
                }
            };

            if !protection.verify_token_pair(&parsed_token, &parsed_csrf) {
                return Ok(req.error_response(CsrfError::CsrfInvalid).map_into_right_body());
            }

            Ok(srv.call(req).await.map(ServiceResponse::map_into_left_body)?)
        }
        .boxed_local()
    }
}
