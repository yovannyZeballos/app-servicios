'use strict';
import crypto     from 'node:crypto';
import jwt        from 'jsonwebtoken';
import bcrypt     from 'bcryptjs';
import config     from '../config/env.js';
import { query }  from '../config/db.js';
import { UsuarioModel } from '../models/usuario.model.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(usuarioId, token) {
  const hash      = hashToken(token);
  const msPerDay  = 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + config.refreshToken.expiresInDays * msPerDay);
  await query(
    'INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [usuarioId, hash, expiresAt],
  );
}

export const AuthController = {

  /** POST /api/auth/login */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const usuario = await UsuarioModel.findByEmail(email);
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
      }

      const match = await bcrypt.compare(password, usuario.password_hash);
      if (!match) {
        return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
      }

      const payload      = { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
      const accessToken  = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      const refreshToken = generateRefreshToken();
      await saveRefreshToken(usuario.id, refreshToken);

      res.json({ ok: true, accessToken, refreshToken, usuario: payload });
    } catch (err) { next(err); }
  },

  /** POST /api/auth/refresh */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ ok: false, mensaje: 'Refresh token requerido' });
      }

      const hash    = hashToken(refreshToken);
      const { rows } = await query(
        'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
        [hash],
      );
      if (rows.length === 0) {
        return res.status(401).json({ ok: false, mensaje: 'Refresh token inválido o expirado' });
      }

      const usuario = await UsuarioModel.findById(rows[0].usuario_id);
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ ok: false, mensaje: 'Usuario inactivo' });
      }

      const payload     = { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
      const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

      res.json({ ok: true, accessToken });
    } catch (err) { next(err); }
  },

  /** POST /api/auth/logout */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const hash = hashToken(refreshToken);
        await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [hash]);
      }
      res.json({ ok: true, mensaje: 'Sesión cerrada' });
    } catch (err) { next(err); }
  },

  /** GET /api/auth/me  (requiere token) */
  async me(req, res) {
    res.json({ ok: true, usuario: req.user });
  },
};
