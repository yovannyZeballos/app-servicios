'use strict';
import { query } from '../config/db.js';

export const PagoModel = {

  async findAll({ usuarioId, conceptoId, tipoPagoId, anio, mes, estado } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (usuarioId)   { conditions.push(`p.usuario_id   = $${idx++}`); params.push(usuarioId); }
    if (conceptoId)  { conditions.push(`p.concepto_id  = $${idx++}`); params.push(conceptoId); }
    if (tipoPagoId)  { conditions.push(`p.tipo_pago_id = $${idx++}`); params.push(tipoPagoId); }
    if (anio)        { conditions.push(`p.anio         = $${idx++}`); params.push(anio); }
    if (mes)         { conditions.push(`p.mes          = $${idx++}`); params.push(mes); }
    if (estado)      { conditions.push(`p.estado       = $${idx++}`); params.push(estado); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT p.*,
              u.nombre  AS usuario_nombre,
              u.email   AS usuario_email,
              c.nombre  AS concepto_nombre,
              c.campo_referencia,
              tp.nombre AS tipo_pago_nombre,
              (SELECT s.referencia_valor
               FROM suscripciones s
               WHERE s.usuario_id = p.usuario_id AND s.concepto_id = p.concepto_id
               LIMIT 1) AS referencia_valor_cuenta
       FROM pagos p
       JOIN usuarios  u  ON u.id  = p.usuario_id
       JOIN conceptos c  ON c.id  = p.concepto_id
       LEFT JOIN tipos_pago tp ON tp.id = p.tipo_pago_id
       ${where}
       ORDER BY p.anio DESC, p.mes DESC, p.id DESC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT p.*,
              u.nombre  AS usuario_nombre,
              u.email   AS usuario_email,
              c.nombre  AS concepto_nombre,
              c.campo_referencia,
              tp.nombre AS tipo_pago_nombre,
              (SELECT s.referencia_valor
               FROM suscripciones s
               WHERE s.usuario_id = p.usuario_id AND s.concepto_id = p.concepto_id
               LIMIT 1) AS referencia_valor_cuenta
       FROM pagos p
       JOIN usuarios  u  ON u.id  = p.usuario_id
       JOIN conceptos c  ON c.id  = p.concepto_id
       LEFT JOIN tipos_pago tp ON tp.id = p.tipo_pago_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ usuario_id, concepto_id, tipo_pago_id, anio, mes, monto, fecha_pago, referencia, observaciones, estado }) {
    const estadoFinal = estado ?? (fecha_pago ? 'pagado' : 'pendiente');
    const { rows } = await query(
      `INSERT INTO pagos (usuario_id, concepto_id, tipo_pago_id, anio, mes, monto, fecha_pago, referencia, observaciones, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [usuario_id, concepto_id, tipo_pago_id ?? null, anio, mes, monto,
       fecha_pago ?? null,
       referencia ?? null, observaciones ?? null, estadoFinal]
    );
    return rows[0];
  },

  async update(id, { concepto_id, tipo_pago_id, anio, mes, monto, fecha_pago, referencia, observaciones, estado }) {
    const { rows } = await query(
      `UPDATE pagos
       SET concepto_id   = COALESCE($1, concepto_id),
           tipo_pago_id  = COALESCE($2, tipo_pago_id),
           anio          = COALESCE($3, anio),
           mes           = COALESCE($4, mes),
           monto         = COALESCE($5, monto),
           fecha_pago    = COALESCE($6, fecha_pago),
           referencia    = COALESCE($7, referencia),
           observaciones = COALESCE($8, observaciones),
           estado        = COALESCE($9, estado)
       WHERE id = $10
       RETURNING *`,
      [
        concepto_id ?? null, tipo_pago_id ?? null, anio ?? null, mes ?? null,
        monto ?? null, fecha_pago ?? null, referencia ?? null,
        observaciones ?? null, estado ?? null, id,
      ]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'DELETE FROM pagos WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existePago(usuario_id, concepto_id, anio, mes, { estado = null, excludeId = null } = {}) {
    const { rows } = await query(
      `SELECT id FROM pagos
       WHERE usuario_id  = $1 AND concepto_id = $2
         AND anio = $3   AND mes = $4
         AND ($5::TEXT IS NULL OR estado = $5)
         AND ($6::INT  IS NULL OR id <> $6)`,
      [usuario_id, concepto_id, anio, mes, estado, excludeId]
    );
    return rows.length > 0;
  },

  async countPagos(usuario_id, concepto_id, anio, mes, estado = null) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM pagos
       WHERE usuario_id = $1 AND concepto_id = $2
         AND anio = $3 AND mes = $4
         AND ($5::TEXT IS NULL OR estado = $5)`,
      [usuario_id, concepto_id, anio, mes, estado]
    );
    return rows[0].total;
  },

  async reporteDetalle({ usuarioId, anio, mes } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (usuarioId) { conditions.push(`p.usuario_id = $${idx++}`); params.push(usuarioId); }
    if (anio)      { conditions.push(`p.anio       = $${idx++}`); params.push(anio); }
    if (mes)       { conditions.push(`p.mes        = $${idx++}`); params.push(mes); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT p.*,
              u.nombre AS usuario_nombre,
              u.email  AS usuario_email,
              c.nombre AS concepto_nombre
       FROM pagos p
       JOIN usuarios  u ON u.id = p.usuario_id
       JOIN conceptos c ON c.id = p.concepto_id
       ${where}
       ORDER BY p.anio DESC, p.mes DESC, c.nombre ASC`,
      params
    );
    return rows;
  },

  async reporteResumen({ usuarioId, anio } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (usuarioId) { conditions.push(`p.usuario_id = $${idx++}`); params.push(usuarioId); }
    if (anio)      { conditions.push(`p.anio       = $${idx++}`); params.push(anio); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT p.anio,
              p.mes,
              COUNT(*)                                                        AS total_pagos,
              SUM(p.monto)                                                    AS total_monto,
              COUNT(CASE WHEN p.estado = 'pagado'    THEN 1 END)             AS total_pagados,
              COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END)             AS total_pendientes,
              COALESCE(SUM(CASE WHEN p.estado = 'pagado'    THEN p.monto END), 0) AS monto_pagado,
              COALESCE(SUM(CASE WHEN p.estado = 'pendiente' THEN p.monto END), 0) AS monto_pendiente
       FROM pagos p
       JOIN usuarios  u ON u.id = p.usuario_id
       JOIN conceptos c ON c.id = p.concepto_id
       ${where}
       GROUP BY p.anio, p.mes
       ORDER BY p.anio DESC, p.mes DESC`,
      params
    );
    return rows;
  },
};
