'use strict';
import { query } from '../config/db.js';

export const UsuarioModel = {

  async findAll({ soloActivos = false } = {}) {
    const where = soloActivos ? 'WHERE activo = TRUE' : '';
    const { rows } = await query(
      `SELECT id, nombre, email, rol, activo, created_at FROM usuarios ${where} ORDER BY nombre ASC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = $1',
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

  async create({ nombre, email, password_hash, rol = 'user' }) {
    const { rows } = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre, email, password_hash, rol]
    );
    return rows[0];
  },

  async update(id, { nombre, email, password_hash, rol, activo }) {
    const { rows } = await query(
      `UPDATE usuarios
       SET nombre        = COALESCE($1, nombre),
           email         = COALESCE($2, email),
           password_hash = COALESCE($3, password_hash),
           rol           = COALESCE($4, rol),
           activo        = COALESCE($5, activo)
       WHERE id = $6
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre ?? null, email ?? null, password_hash ?? null, rol ?? null, activo ?? null, id]
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
