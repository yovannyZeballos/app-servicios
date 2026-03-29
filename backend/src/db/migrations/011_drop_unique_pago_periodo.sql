-- ============================================================
-- Migración 011: Permitir múltiples pagos del mismo concepto
-- en el mismo período (elimina restricción UNIQUE)
-- ============================================================
ALTER TABLE pagos
  DROP CONSTRAINT IF EXISTS uq_pago_usuario_concepto_periodo;
