CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS yjs_updates (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    update BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    expire_at BIGINT NOT NULL
);

-- INSERT INTO users VALUES 
--     ('test', 'test'),
--     ('user1', 'password1'),
--     ('user2', 'password2');