'use strict';
import 'dotenv/config';
import app from './src/app.js';
import config from './src/config/env.js';
import { testConnection } from './src/config/db.js';

async function main() {
  await testConnection();
  app.listen(config.port, () => {
    console.log(`[SERVER] App-Servicios corriendo en http://localhost:${config.port}`);
    console.log(`[SERVER] Entorno: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('[SERVER] Error al iniciar:', err.message);
  process.exit(1);
});
