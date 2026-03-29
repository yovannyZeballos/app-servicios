-- ============================================================
-- Migración 007: Tabla usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    password_hash TEXT            NOT NULL,
    rol           VARCHAR(10)     NOT NULL DEFAULT 'user'
                    CHECK (rol IN ('admin', 'user')),
    activo        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email  ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

COMMENT ON TABLE  usuarios           IS 'Usuarios del sistema con autenticación';
COMMENT ON COLUMN usuarios.rol       IS 'admin: acceso total | user: acceso propio';
