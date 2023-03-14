CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    user_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    pwhash      TEXT NOT NULL,
    admin       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE sessions (
    session_id  TEXT PRIMARY KEY,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    data        TEXT
);
