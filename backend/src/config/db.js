'use strict';
import pg from 'pg';
import config from './env.js';

const { Pool } = pg;

const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente inactivo:', err.message);
});

/**
 * Ejecuta una query con parámetros opcionales.
 * @param {string} text  - SQL query
 * @param {Array}  params - Parámetros parametrizados
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (config.nodeEnv === 'development') {
    console.debug(`[DB] query(${Date.now() - start}ms): ${text.slice(0, 80)}`);
  }
  return result;
}

/** Obtiene un cliente del pool para transacciones manuales. */
export async function getClient() {
  return pool.connect();
}

/** Verifica la conexión al arrancar. */
export async function testConnection() {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
  console.log('[DB] Conexión establecida con PostgreSQL.');
}

export default pool;
