'use strict';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/** Verifica token JWT en header Authorization: Bearer <token>  */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, mensaje: 'Token de autenticación requerido' });
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
  }
}

/** Permite acceso solo a 'principal' */
export function principalMiddleware(req, res, next) {
  if (req.user?.rol !== 'principal') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso restringido al usuario principal' });
  }
  next();
}

// Alias para compatibilidad con rutas existentes
export const principalOrAdminMiddleware = principalMiddleware;
export const adminMiddleware = principalMiddleware;

/**
 * Devuelve el ID del usuario principal según el rol:
 * - principal → su propio ID
 * - user      → su principal_id
 */
export function getPrincipalId(user) {
  if (user.rol === 'principal') return user.id;
  return user.principal_id ?? null;
}
