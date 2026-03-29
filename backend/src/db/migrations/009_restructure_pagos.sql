-- ============================================================
-- Migración 009: Reestructurar pagos (eliminar tablas obsoletas)
-- pagos ahora pertenece directamente al usuario, con anio/mes
-- como campos (sin tabla periodos separada)
-- ============================================================

-- Eliminar tablas obsoletas en orden de dependencias
DROP TABLE IF EXISTS pagos     CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS clientes  CASCADE;
DROP TABLE IF EXISTS periodos  CASCADE;

-- Nueva tabla pagos
CREATE TABLE pagos (
    id            SERIAL PRIMARY KEY,
    usuario_id    INTEGER         NOT NULL
                    REFERENCES usuarios(id) ON DELETE RESTRICT,
    concepto_id   INTEGER         NOT NULL
                    REFERENCES conceptos(id) ON DELETE RESTRICT,
    anio          SMALLINT        NOT NULL CHECK (anio >= 2000),
    mes           SMALLINT        NOT NULL CHECK (mes BETWEEN 1 AND 12),
    monto         NUMERIC(10, 2)  NOT NULL CHECK (monto > 0),
    fecha_pago    DATE            NOT NULL DEFAULT CURRENT_DATE,
    referencia    VARCHAR(100),
    observaciones TEXT,
    estado        VARCHAR(10)     NOT NULL DEFAULT 'pagado'
                    CHECK (estado IN ('pagado', 'pendiente')),
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Un usuario solo puede registrar un pago por concepto y periodo
    CONSTRAINT uq_pago_usuario_concepto_periodo
        UNIQUE (usuario_id, concepto_id, anio, mes)
);

CREATE INDEX IF NOT EXISTS idx_pagos_usuario  ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_concepto ON pagos(concepto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_periodo  ON pagos(anio, mes);
CREATE INDEX IF NOT EXISTS idx_pagos_estado   ON pagos(estado);

COMMENT ON TABLE  pagos           IS 'Pagos de servicios por usuario y periodo (mes/año)';
COMMENT ON COLUMN pagos.anio      IS 'Año del periodo de pago';
COMMENT ON COLUMN pagos.mes       IS 'Mes del periodo de pago (1-12)';
