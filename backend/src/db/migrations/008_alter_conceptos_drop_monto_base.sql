-- ============================================================
-- Migración 008: Eliminar monto_base de conceptos
-- ============================================================

ALTER TABLE conceptos DROP COLUMN IF EXISTS monto_base;
