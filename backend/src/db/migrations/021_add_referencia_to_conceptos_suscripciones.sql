-- campo_referencia: etiqueta del dato requerido para pagar (ej: "Código de usuario", "Número de cuenta")
ALTER TABLE conceptos ADD COLUMN IF NOT EXISTS campo_referencia VARCHAR(200);

-- referencia_valor: el valor real por suscripción (ej: "12345", "001-456789")
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS referencia_valor TEXT;
