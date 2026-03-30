-- ============================================================
-- Migración 017: Agregar tipo_pago_id a pagos
-- ============================================================

ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS tipo_pago_id INTEGER
    REFERENCES tipos_pago(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pagos_tipo_pago ON pagos(tipo_pago_id);

COMMENT ON COLUMN pagos.tipo_pago_id IS 'Categoría del pago (opcional)';
