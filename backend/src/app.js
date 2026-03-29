'use strict';
import express from 'express';
import helmet  from 'helmet';
import cors    from 'cors';

import authRoutes        from './routes/auth.routes.js';
import usuarioRoutes     from './routes/usuario.routes.js';
import conceptoRoutes    from './routes/concepto.routes.js';
import pagoRoutes        from './routes/pago.routes.js';
import suscripcionRoutes from './routes/suscripcion.routes.js';
import reporteRoutes     from './routes/reporte.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── Seguridad y parseo ──────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Rutas ───────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/usuarios',      usuarioRoutes);
app.use('/api/conceptos',     conceptoRoutes);
app.use('/api/pagos',         pagoRoutes);
app.use('/api/suscripciones', suscripcionRoutes);
app.use('/api/reporte',       reporteRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' }));

// ── Manejador de errores ────────────────────────────────────
app.use(errorHandler);

export default app;
