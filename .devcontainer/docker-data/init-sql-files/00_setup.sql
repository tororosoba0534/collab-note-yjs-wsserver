CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    docname TEXT NOT NULL,
    update BYTEA NOT NULL
);

CREATE INDEX items_docname_index ON items (docname);