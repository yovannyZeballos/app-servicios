-- Permite usuarios sin contraseña (registro via Google OAuth)
ALTER TABLE usuarios ALTER COLUMN password_hash DROP NOT NULL;
