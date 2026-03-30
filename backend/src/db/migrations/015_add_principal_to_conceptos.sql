-- ============================================================
-- Migración 015: Conceptos pertenecen a un usuario principal
-- ============================================================

-- Agregar principal_id a conceptos
ALTER TABLE conceptos
  ADD COLUMN IF NOT EXISTS principal_id INTEGER
    REFERENCES usuarios(id) ON DELETE CASCADE;

-- Eliminar la unicidad global de nombre (ahora es por principal)
ALTER TABLE conceptos DROP CONSTRAINT IF EXISTS conceptos_nombre_key;

-- Unicidad por (principal_id, nombre) — insensible a mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS uq_concepto_nombre_principal
  ON conceptos (principal_id, LOWER(nombre))
  WHERE principal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conceptos_principal ON conceptos(principal_id);

COMMENT ON COLUMN conceptos.principal_id IS 'Usuario principal dueño de este concepto';
