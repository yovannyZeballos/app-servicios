-- ============================================================
-- Migración 003: Tabla servicios
-- Asociación de un cliente con un concepto de servicio
-- ============================================================

CREATE TABLE IF NOT EXISTS servicios (
    id            SERIAL PRIMARY KEY,
    cliente_id    INTEGER         NOT NULL
                    REFERENCES clientes(id) ON DELETE RESTRICT,
    concepto_id   INTEGER         NOT NULL
                    REFERENCES conceptos(id) ON DELETE RESTRICT,
    -- El monto puede sobrescribir el monto_base del concepto
    monto         NUMERIC(10, 2)  NOT NULL
                    CHECK (monto > 0),
    fecha_inicio  DATE            NOT NULL,
    fecha_fin     DATE,
    activo        BOOLEAN         NOT NULL DEFAULT TRUE,
    observaciones TEXT,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Un cliente no puede tener el mismo concepto activo dos veces
    CONSTRAINT uq_servicio_activo
        UNIQUE NULLS NOT DISTINCT (cliente_id, concepto_id, fecha_fin)
);

CREATE INDEX IF NOT EXISTS idx_servicios_cliente  ON servicios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicios_concepto ON servicios(concepto_id);
CREATE INDEX IF NOT EXISTS idx_servicios_activo   ON servicios(activo);

COMMENT ON TABLE  servicios               IS 'Servicios contratados: vincula cliente con concepto';
COMMENT ON COLUMN servicios.monto         IS 'Monto mensual real del servicio para este cliente';
COMMENT ON COLUMN servicios.fecha_fin     IS 'NULL indica que el servicio sigue vigente';
