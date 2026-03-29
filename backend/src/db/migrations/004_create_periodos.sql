-- ============================================================
-- Migración 004: Tabla periodos
-- Periodos mensuales de facturación (ej: Enero 2026)
-- ============================================================

CREATE TABLE IF NOT EXISTS periodos (
    id            SERIAL PRIMARY KEY,
    anio          SMALLINT        NOT NULL CHECK (anio >= 2000),
    mes           SMALLINT        NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_inicio  DATE            NOT NULL,
    fecha_fin     DATE            NOT NULL,
    estado        VARCHAR(10)     NOT NULL DEFAULT 'abierto'
                    CHECK (estado IN ('abierto', 'cerrado')),
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_periodo_anio_mes UNIQUE (anio, mes),
    CONSTRAINT ck_periodo_fechas   CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_periodos_estado ON periodos(estado);

COMMENT ON TABLE  periodos              IS 'Periodos mensuales de cobro';
COMMENT ON COLUMN periodos.estado       IS 'abierto: acepta pagos | cerrado: periodo finalizado';
