'use strict';
import config from '../config/env.js';

/**
 * Manejador central de errores de Express.
 * Captura errores lanzados con next(err).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;

  // Errores de constraint de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ ok: false, mensaje: 'Registro duplicado', detalle: err.detail });
  }
  if (err.code === '23503') {
    return res.status(422).json({ ok: false, mensaje: 'Referencia inválida', detalle: err.detail });
  }

  // En desarrollo se expone el stack
  const respuesta = { ok: false, mensaje: err.message ?? 'Error interno del servidor' };
  if (config.nodeEnv === 'development' && err.stack) {
    respuesta.stack = err.stack;
  }

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json(respuesta);
}
