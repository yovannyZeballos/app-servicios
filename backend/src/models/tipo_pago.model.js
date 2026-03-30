'use strict';
import { query } from '../config/db.js';

export const TipoPagoModel = {

  async findAll({ principalId = undefined, soloActivos = false } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;
    if (principalId !== undefined) { conditions.push(`principal_id = $${idx++}`); params.push(principalId); }
    if (soloActivos)               { conditions.push(`activo = TRUE`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT * FROM tipos_pago ${where} ORDER BY nombre ASC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM tipos_pago WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ principal_id, nombre, descripcion }) {
    const { rows } = await query(
      `INSERT INTO tipos_pago (principal_id, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [principal_id, nombre, descripcion ?? null]
    );
    return rows[0];
  },

  async update(id, { nombre, descripcion, activo }) {
    const { rows } = await query(
      `UPDATE tipos_pago
       SET nombre      = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           activo      = COALESCE($3, activo)
       WHERE id = $4
       RETURNING *`,
      [nombre ?? null, descripcion ?? null, activo ?? null, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'UPDATE tipos_pago SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeNombre(nombre, principalId, excludeId = null) {
    const { rows } = await query(
      `SELECT id FROM tipos_pago
       WHERE LOWER(nombre) = LOWER($1)
         AND principal_id = $2
         AND ($3::INT IS NULL OR id <> $3)`,
      [nombre, principalId, excludeId]
    );
    return rows.length > 0;
  },
};
