'use strict';
import { query } from '../config/db.js';

export const ClienteModel = {

  async findAll({ soloActivos = false } = {}) {
    const sql = soloActivos
      ? `SELECT * FROM clientes WHERE activo = TRUE ORDER BY apellido, nombre ASC`
      : `SELECT * FROM clientes ORDER BY apellido, nombre ASC`;
    const { rows } = await query(sql);
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async findByIdWithServicios(id) {
    const { rows } = await query(
      `SELECT c.*,
              json_agg(
                json_build_object(
                  'id', s.id,
                  'concepto_id', s.concepto_id,
                  'concepto', co.nombre,
                  'monto', s.monto,
                  'activo', s.activo
                )
              ) FILTER (WHERE s.id IS NOT NULL) AS servicios
       FROM clientes c
       LEFT JOIN servicios s  ON s.cliente_id  = c.id
       LEFT JOIN conceptos co ON co.id = s.concepto_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ nombre, apellido, email, telefono, direccion }) {
    const { rows } = await query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, apellido, email, telefono ?? null, direccion ?? null]
    );
    return rows[0];
  },

  async update(id, { nombre, apellido, email, telefono, direccion, activo }) {
    const { rows } = await query(
      `UPDATE clientes
       SET nombre    = COALESCE($1, nombre),
           apellido  = COALESCE($2, apellido),
           email     = COALESCE($3, email),
           telefono  = COALESCE($4, telefono),
           direccion = COALESCE($5, direccion),
           activo    = COALESCE($6, activo)
       WHERE id = $7
       RETURNING *`,
      [nombre ?? null, apellido ?? null, email ?? null,
       telefono ?? null, direccion ?? null, activo ?? null, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'UPDATE clientes SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeEmail(email, excludeId = null) {
    const { rows } = await query(
      'SELECT id FROM clientes WHERE LOWER(email) = LOWER($1) AND ($2::INT IS NULL OR id <> $2)',
      [email, excludeId]
    );
    return rows.length > 0;
  },
};
