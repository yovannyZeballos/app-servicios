-- ============================================================
-- Migración 010: Plantilla de pagos mensuales (suscripciones)
-- + fecha_pago nullable para soportar pagos pendientes
-- ============================================================

-- Permitir fecha_pago NULL → pagos pendientes sin fecha aún
ALTER TABLE pagos ALTER COLUMN fecha_pago DROP NOT NULL;
ALTER TABLE pagos ALTER COLUMN fecha_pago DROP DEFAULT;

-- Tabla de plantilla mensual por usuario
CREATE TABLE IF NOT EXISTS suscripciones (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER        NOT NULL
                       REFERENCES usuarios(id) ON DELETE CASCADE,
    concepto_id      INTEGER        NOT NULL
                       REFERENCES conceptos(id) ON DELETE RESTRICT,
    monto_referencia NUMERIC(10,2)  NOT NULL CHECK (monto_referencia > 0),
    activo           BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_suscripcion UNIQUE (usuario_id, concepto_id)
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario  ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_concepto ON suscripciones(concepto_id);

COMMENT ON TABLE  suscripciones                  IS 'Plantilla de servicios mensuales por usuario';
COMMENT ON COLUMN suscripciones.monto_referencia IS 'Monto de referencia que se usa al generar pagos pendientes';
