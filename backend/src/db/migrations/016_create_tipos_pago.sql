-- ============================================================
-- Migración 016: Tabla tipos_pago
-- Agrupa los pagos por categoría (ej: servicios, tienda, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS tipos_pago (
    id           SERIAL       PRIMARY KEY,
    principal_id INTEGER      NOT NULL
                   REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tipo_pago_nombre_principal UNIQUE (principal_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_tipos_pago_principal ON tipos_pago(principal_id);

COMMENT ON TABLE  tipos_pago             IS 'Categorías de pago definidas por cada usuario principal';
COMMENT ON COLUMN tipos_pago.principal_id IS 'Usuario principal dueño de esta categoría';
