'use strict';
import { query } from '../config/db.js';

export const PeriodoModel = {

  async findAll({ estado } = {}) {
    const params = [];
    const where = estado ? `WHERE estado = $${params.push(estado)}` : '';
    const { rows } = await query(
      `SELECT * FROM periodos ${where} ORDER BY anio DESC, mes DESC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM periodos WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async findByAnioMes(anio, mes) {
    const { rows } = await query(
      'SELECT * FROM periodos WHERE anio = $1 AND mes = $2',
      [anio, mes]
    );
    return rows[0] ?? null;
  },

  async findAbierto() {
    const { rows } = await query(
      `SELECT * FROM periodos WHERE estado = 'abierto' ORDER BY anio DESC, mes DESC LIMIT 1`
    );
    return rows[0] ?? null;
  },

  async create({ anio, mes, fecha_inicio, fecha_fin }) {
    const { rows } = await query(
      `INSERT INTO periodos (anio, mes, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [anio, mes, fecha_inicio, fecha_fin]
    );
    return rows[0];
  },

  async cerrar(id) {
    const { rows } = await query(
      `UPDATE periodos SET estado = 'cerrado' WHERE id = $1 AND estado = 'abierto' RETURNING *`,
      [id]
    );
    return rows[0] ?? null;
  },

  async estaAbierto(id) {
    const { rows } = await query(
      `SELECT id FROM periodos WHERE id = $1 AND estado = 'abierto'`,
      [id]
    );
    return rows.length > 0;
  },
};
