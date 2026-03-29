-- ============================================================
-- Migración 001: Tabla conceptos
-- Catálogo de tipos de servicios (agua, luz, gas, internet, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS conceptos (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL UNIQUE,
    descripcion   TEXT,
    monto_base    NUMERIC(10, 2)  NOT NULL DEFAULT 0.00
                    CHECK (monto_base >= 0),
    activo        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conceptos_activo ON conceptos(activo);

COMMENT ON TABLE  conceptos             IS 'Catálogo de conceptos/tipos de servicios';
COMMENT ON COLUMN conceptos.monto_base  IS 'Monto mensual base; puede sobreescribirse por servicio';
