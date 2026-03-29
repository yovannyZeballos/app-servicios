'use strict';
import { query } from '../config/db.js';

export const ConceptoModel = {

  async findAll({ soloActivos = false } = {}) {
    const sql = soloActivos
      ? 'SELECT * FROM conceptos WHERE activo = TRUE ORDER BY nombre ASC'
      : 'SELECT * FROM conceptos ORDER BY nombre ASC';
    const { rows } = await query(sql);
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM conceptos WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async create({ nombre, descripcion }) {
    const { rows } = await query(
      `INSERT INTO conceptos (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, descripcion ?? null]
    );
    return rows[0];
  },

  async update(id, { nombre, descripcion, activo }) {
    const { rows } = await query(
      `UPDATE conceptos
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
    // Borrado lógico
    const { rows } = await query(
      'UPDATE conceptos SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] ?? null;
  },

  async existeNombre(nombre, excludeId = null) {
    const { rows } = await query(
      'SELECT id FROM conceptos WHERE LOWER(nombre) = LOWER($1) AND ($2::INT IS NULL OR id <> $2)',
      [nombre, excludeId]
    );
    return rows.length > 0;
  },
};
