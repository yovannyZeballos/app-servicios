'use strict';
/**
 * Script de migración: ejecuta todos los archivos SQL de /migrations
 * en orden alfabético dentro de una transacción.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { getClient } from '../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function migrate() {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Tabla de control de migraciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migraciones (
        nombre      VARCHAR(255) PRIMARY KEY,
        ejecutada_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM _migraciones WHERE nombre = $1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`  [skip] ${file}`);
        continue;
      }
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migraciones (nombre) VALUES ($1)',
        [file]
      );
      console.log(`  [ok]   ${file}`);
    }

    await client.query('COMMIT');
    console.log('\nMigraciones completadas.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en migración:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
