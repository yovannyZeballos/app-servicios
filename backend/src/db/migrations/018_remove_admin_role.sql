-- Migración 018: eliminar rol 'admin', dejar solo 'principal' y 'user'
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('principal', 'user'));

-- Convertir admins existentes a principal
UPDATE usuarios SET rol = 'principal', principal_id = NULL WHERE rol = 'admin';
