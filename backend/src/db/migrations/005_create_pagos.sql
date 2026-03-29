-- ============================================================
-- Migración 005: Tabla pagos
-- Registro del pago de un servicio en un periodo mensual
-- ============================================================

CREATE TABLE IF NOT EXISTS pagos (
    id            SERIAL PRIMARY KEY,
    servicio_id   INTEGER         NOT NULL
                    REFERENCES servicios(id) ON DELETE RESTRICT,
    periodo_id    INTEGER         NOT NULL
                    REFERENCES periodos(id)  ON DELETE RESTRICT,
    monto         NUMERIC(10, 2)  NOT NULL CHECK (monto > 0),
    fecha_pago    DATE,
    estado        VARCHAR(10)     NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagado', 'vencido')),
    referencia    VARCHAR(100),
    observaciones TEXT,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Un servicio solo puede tener un pago por periodo
    CONSTRAINT uq_pago_servicio_periodo UNIQUE (servicio_id, periodo_id)
);

CREATE INDEX IF NOT EXISTS idx_pagos_servicio ON pagos(servicio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_periodo  ON pagos(periodo_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado   ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha    ON pagos(fecha_pago);

COMMENT ON TABLE  pagos             IS 'Registro de pagos mensuales por servicio';
COMMENT ON COLUMN pagos.estado      IS 'pendiente | pagado | vencido';
COMMENT ON COLUMN pagos.referencia  IS 'Número de comprobante o referencia de pago';
