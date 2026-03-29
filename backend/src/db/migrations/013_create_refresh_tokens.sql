CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         BIGSERIAL    PRIMARY KEY,
  usuario_id INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT         NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);
