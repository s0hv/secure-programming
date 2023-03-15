CREATE TABLE posts (
    post_id     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid REFERENCES users (user_id) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data        TEXT NOT NULL
);
