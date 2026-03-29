'use strict';
import { query } from '../config/db.js';

export const SuscripcionModel = {

  async findByUsuario(usuarioId, soloActivas = false) {
    const and = soloActivas ? 'AND s.activo = TRUE' : '';
    const { rows } = await query(
      `SELECT s.*, c.nombre AS concepto_nombre, c.descripcion AS concepto_descripcion
       FROM suscripciones s
       JOIN conceptos c ON c.id = s.concepto_id
       WHERE s.usuario_id = $1 ${and}
       ORDER BY c.nombre ASC`,
      [usuarioId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT s.*, c.nombre AS concepto_nombre
       FROM suscripciones s
       JOIN conceptos c ON c.id = s.concepto_id
       WHERE s.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ usuario_id, concepto_id, monto_referencia }) {
    const { rows } = await query(
      `INSERT INTO suscripciones (usuario_id, concepto_id, monto_referencia)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario_id, concepto_id, monto_referencia]
    );
    return rows[0];
  },

  async update(id, { monto_referencia, activo }) {
    const { rows } = await query(
      `UPDATE suscripciones
       SET monto_referencia = COALESCE($1, monto_referencia),
           activo           = COALESCE($2, activo)
       WHERE id = $3
       RETURNING *`,
      [monto_referencia ?? null, activo ?? null, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'DELETE FROM suscripciones WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

};
