'use strict';
import { query } from '../config/db.js';

export const ConceptoModel = {

  async findAll({ soloActivos = false, principalId = undefined } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;
    if (soloActivos)               { conditions.push(`c.activo = TRUE`); }
    if (principalId !== undefined) { conditions.push(`c.principal_id = $${idx++}`); params.push(principalId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT c.*, u.nombre AS principal_nombre
       FROM conceptos c
       LEFT JOIN usuarios u ON u.id = c.principal_id
       ${where}
       ORDER BY c.nombre ASC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT c.*, u.nombre AS principal_nombre
       FROM conceptos c
       LEFT JOIN usuarios u ON u.id = c.principal_id
       WHERE c.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ nombre, descripcion, campo_referencia, principal_id }) {
    const { rows } = await query(
      `INSERT INTO conceptos (nombre, descripcion, campo_referencia, principal_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, descripcion ?? null, campo_referencia ?? null, principal_id ?? null]
    );
    return rows[0];
  },

  async update(id, { nombre, descripcion, campo_referencia, activo }) {
    const { rows } = await query(
      `UPDATE conceptos
       SET nombre           = COALESCE($1, nombre),
           descripcion      = COALESCE($2, descripcion),
           campo_referencia = $3,
           activo           = COALESCE($4, activo)
       WHERE id = $5
       RETURNING *`,
      [nombre ?? null, descripcion ?? null, campo_referencia ?? null, activo ?? null, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'UPDATE conceptos SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeNombre(nombre, principalId, excludeId = null) {
    const { rows } = await query(
      `SELECT id FROM conceptos
       WHERE LOWER(nombre) = LOWER($1)
         AND principal_id = $2
         AND ($3::INT IS NULL OR id <> $3)`,
      [nombre, principalId, excludeId]
    );
    return rows.length > 0;
  },
};
