-- Migración 019: Agregar tipo_pago_id a suscripciones
ALTER TABLE suscripciones
  ADD COLUMN IF NOT EXISTS tipo_pago_id INTEGER
    REFERENCES tipos_pago(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_suscripciones_tipo_pago ON suscripciones(tipo_pago_id);

COMMENT ON COLUMN suscripciones.tipo_pago_id IS 'Categoría de pago heredada al generar pagos';
