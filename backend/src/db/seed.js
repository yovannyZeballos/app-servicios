'use strict';
import bcrypt      from 'bcryptjs';
import 'dotenv/config';
import { getClient } from '../config/db.js';

async function seed() {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Admin user
    const hash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES ('Administrador', 'admin@app.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    // Conceptos iniciales
    const conceptos = [
      ['Agua potable',   'Servicio de agua municipal'],
      ['Luz eléctrica',  'Servicio eléctrico residencial'],
      ['Gas natural',    'Servicio de gas por red'],
      ['Internet',       'Servicio de banda ancha'],
      ['Teléfono',       'Servicio telefónico'],
    ];
    for (const [nombre, descripcion] of conceptos) {
      await client.query(`
        INSERT INTO conceptos (nombre, descripcion)
        VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING
      `, [nombre, descripcion]);
    }

    await client.query('COMMIT');
    console.log('Seed ejecutado correctamente.');
    console.log('Usuario admin: admin@app.com / admin123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en seed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
