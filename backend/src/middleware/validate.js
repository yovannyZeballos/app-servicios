'use strict';
import { validationResult } from 'express-validator';

/**
 * Middleware que recoge los errores de express-validator y responde 400 si existen.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos de entrada inválidos',
      errores: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}
