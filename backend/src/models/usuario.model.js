'use strict';
import { query } from '../config/db.js';

export const UsuarioModel = {

  async findAll({ soloActivos = false, principalId = undefined } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;
    if (soloActivos)               { conditions.push(`u.activo = TRUE`); }
    if (principalId !== undefined) { conditions.push(`u.principal_id = $${idx++}`); params.push(principalId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.principal_id, u.created_at,
              p.nombre AS principal_nombre
       FROM usuarios u
       LEFT JOIN usuarios p ON p.id = u.principal_id
       ${where}
       ORDER BY u.nombre ASC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.principal_id, u.created_at,
              p.nombre AS principal_nombre
       FROM usuarios u
       LEFT JOIN usuarios p ON p.id = u.principal_id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return rows[0] ?? null;
  },

  async create({ nombre, email, password_hash, rol = 'user', principal_id = null }) {
    const { rows } = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, principal_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, rol, activo, principal_id, created_at`,
      [nombre, email, password_hash, rol, principal_id]
    );
    return rows[0];
  },

  async update(id, { nombre, email, password_hash, rol, activo, principal_id }) {
    const { rows } = await query(
      `UPDATE usuarios
       SET nombre        = COALESCE($1, nombre),
           email         = COALESCE($2, email),
           password_hash = COALESCE($3, password_hash),
           rol           = COALESCE($4, rol),
           activo        = COALESCE($5, activo),
           principal_id  = $6
       WHERE id = $7
       RETURNING id, nombre, email, rol, activo, principal_id, created_at`,
      [nombre ?? null, email ?? null, password_hash ?? null, rol ?? null, activo ?? null, principal_id, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rows } = await query(
      'UPDATE usuarios SET activo = FALSE WHERE id = $1 RETURNING id, nombre, email, rol, activo',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeEmail(email, excludeId = null) {
    const { rows } = await query(
      'SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1) AND ($2::INT IS NULL OR id <> $2)',
      [email, excludeId]
    );
    return rows.length > 0;
  },
};
