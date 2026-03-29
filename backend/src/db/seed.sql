-- ============================================================
-- Seed: Datos iniciales para desarrollo/pruebas
-- ============================================================

-- Conceptos de servicios comunes
INSERT INTO conceptos (nombre, descripcion, monto_base) VALUES
    ('Agua',       'Servicio de agua potable',            25.00),
    ('Luz',        'Servicio de energía eléctrica',       80.00),
    ('Gas',        'Servicio de gas natural',             45.00),
    ('Internet',   'Servicio de internet banda ancha',   60.00),
    ('Cable TV',   'Servicio de televisión por cable',   35.00),
    ('Teléfono',   'Servicio de telefonía fija',         20.00)
ON CONFLICT (nombre) DO NOTHING;

-- Clientes de ejemplo
INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
    ('Juan',  'Pérez',    'juan.perez@email.com',   '555-1001', 'Av. Principal 123'),
    ('María', 'García',   'maria.garcia@email.com', '555-1002', 'Calle 2 #456'),
    ('Carlos','López',    'carlos.lopez@email.com', '555-1003', 'Jr. Los Pinos 789')
ON CONFLICT (email) DO NOTHING;

-- Periodos: últimos 3 meses + mes actual
INSERT INTO periodos (anio, mes, fecha_inicio, fecha_fin, estado)
SELECT
    EXTRACT(YEAR  FROM d)::SMALLINT,
    EXTRACT(MONTH FROM d)::SMALLINT,
    DATE_TRUNC('month', d)::DATE,
    (DATE_TRUNC('month', d) + INTERVAL '1 month - 1 day')::DATE,
    CASE WHEN d < DATE_TRUNC('month', NOW()) THEN 'cerrado' ELSE 'abierto' END
FROM GENERATE_SERIES(
    DATE_TRUNC('month', NOW() - INTERVAL '2 months'),
    DATE_TRUNC('month', NOW()),
    INTERVAL '1 month'
) AS d
ON CONFLICT (anio, mes) DO NOTHING;
