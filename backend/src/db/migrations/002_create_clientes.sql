-- ============================================================
-- Migración 002: Tabla clientes
-- Personas o entidades que contratan servicios
-- ============================================================

CREATE TABLE IF NOT EXISTS clientes (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL,
    apellido      VARCHAR(100)    NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    telefono      VARCHAR(20),
    direccion     TEXT,
    activo        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_email  ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);

COMMENT ON TABLE clientes IS 'Clientes o beneficiarios que contratan servicios';
