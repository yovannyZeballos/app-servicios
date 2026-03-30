-- ============================================================
-- Migración 014: Jerarquía de usuarios (principal → hijos)
-- ============================================================

-- Agregar columna principal_id (auto-referencia)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS principal_id INTEGER
    REFERENCES usuarios(id) ON DELETE SET NULL;

-- Ampliar el CHECK de rol para incluir 'principal'
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('admin', 'principal', 'user'));

CREATE INDEX IF NOT EXISTS idx_usuarios_principal ON usuarios(principal_id);

COMMENT ON COLUMN usuarios.principal_id IS 'NULL para admin/principal; FK al usuario principal para usuarios hijos';
COMMENT ON COLUMN usuarios.rol          IS 'admin: sistema | principal: dueño de grupo | user: usuario hijo';
