'use strict';
import { query } from '../config/db.js';

export const SuscripcionModel = {

  async findByUsuario(usuarioId, soloActivas = false) {
    const and = soloActivas ? 'AND s.activo = TRUE' : '';
    const { rows } = await query(
      `SELECT s.*, c.nombre AS concepto_nombre, c.descripcion AS concepto_descripcion,
              c.campo_referencia,
              tp.nombre AS tipo_pago_nombre
       FROM suscripciones s
       JOIN conceptos c ON c.id = s.concepto_id
       LEFT JOIN tipos_pago tp ON tp.id = s.tipo_pago_id
       WHERE s.usuario_id = $1 ${and}
       ORDER BY c.nombre ASC`,
      [usuarioId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT s.*, c.nombre AS concepto_nombre, c.campo_referencia,
              tp.nombre AS tipo_pago_nombre
       FROM suscripciones s
       JOIN conceptos c ON c.id = s.concepto_id
       LEFT JOIN tipos_pago tp ON tp.id = s.tipo_pago_id
       WHERE s.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ usuario_id, concepto_id, tipo_pago_id, monto_referencia, referencia_valor }) {
    const { rows } = await query(
      `INSERT INTO suscripciones (usuario_id, concepto_id, tipo_pago_id, monto_referencia, referencia_valor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [usuario_id, concepto_id, tipo_pago_id ?? null, monto_referencia, referencia_valor ?? null]
    );
    return rows[0];
  },

  async update(id, { tipo_pago_id, monto_referencia, referencia_valor, activo }) {
    const { rows } = await query(
      `UPDATE suscripciones
       SET tipo_pago_id     = $1,
           monto_referencia = COALESCE($2, monto_referencia),
           referencia_valor = $3,
           activo           = COALESCE($4, activo)
       WHERE id = $5
       RETURNING *`,
      [tipo_pago_id ?? null, monto_referencia ?? null, referencia_valor ?? null, activo ?? null, id]
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
