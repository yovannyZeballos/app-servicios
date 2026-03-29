'use strict';
import { query } from '../config/db.js';

export const ServicioModel = {

  async findAll({ clienteId, conceptoId, soloActivos = false } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (clienteId)   { conditions.push(`s.cliente_id  = $${idx++}`);  params.push(clienteId); }
    if (conceptoId)  { conditions.push(`s.concepto_id = $${idx++}`);  params.push(conceptoId); }
    if (soloActivos) { conditions.push(`s.activo = TRUE`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT s.*,
              c.nombre  AS cliente_nombre,
              c.apellido AS cliente_apellido,
              co.nombre AS concepto_nombre
       FROM servicios s
       JOIN clientes  c  ON c.id  = s.cliente_id
       JOIN conceptos co ON co.id = s.concepto_id
       ${where}
       ORDER BY s.id DESC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT s.*,
              c.nombre  AS cliente_nombre,
              c.apellido AS cliente_apellido,
              co.nombre AS concepto_nombre
       FROM servicios s
       JOIN clientes  c  ON c.id  = s.cliente_id
       JOIN conceptos co ON co.id = s.concepto_id
       WHERE s.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ cliente_id, concepto_id, monto, fecha_inicio, fecha_fin, observaciones }) {
    const { rows } = await query(
      `INSERT INTO servicios (cliente_id, concepto_id, monto, fecha_inicio, fecha_fin, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cliente_id, concepto_id, monto, fecha_inicio, fecha_fin ?? null, observaciones ?? null]
    );
    return rows[0];
  },

  async update(id, { monto, fecha_fin, activo, observaciones }) {
    const { rows } = await query(
      `UPDATE servicios
       SET monto        = COALESCE($1, monto),
           fecha_fin    = COALESCE($2, fecha_fin),
           activo       = COALESCE($3, activo),
           observaciones= COALESCE($4, observaciones)
       WHERE id = $5
       RETURNING *`,
      [monto ?? null, fecha_fin ?? null, activo ?? null, observaciones ?? null, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'UPDATE servicios SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeContratoActivo(cliente_id, concepto_id, excludeId = null) {
    const { rows } = await query(
      `SELECT id FROM servicios
       WHERE cliente_id  = $1
         AND concepto_id = $2
         AND activo      = TRUE
         AND ($3::INT IS NULL OR id <> $3)`,
      [cliente_id, concepto_id, excludeId]
    );
    return rows.length > 0;
  },
};
