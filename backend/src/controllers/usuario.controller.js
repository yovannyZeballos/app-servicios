'use strict';
import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../models/usuario.model.js';

const SALT_ROUNDS = 12;

export const UsuarioController = {

  /** GET /api/usuarios  (admin) */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const data = await UsuarioModel.findAll({ soloActivos });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/usuarios/:id  (admin) */
  async obtener(req, res, next) {
    try {
      const usuario = await UsuarioModel.findById(Number(req.params.id));
      if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      res.json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** POST /api/usuarios  (admin) */
  async crear(req, res, next) {
    try {
      const { nombre, email, password, rol = 'user' } = req.body;

      if (await UsuarioModel.existeEmail(email)) {
        return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const usuario = await UsuarioModel.create({ nombre, email, password_hash, rol });
      res.status(201).json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** PUT /api/usuarios/:id  (admin) */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { nombre, email, password, rol, activo } = req.body;

      if (email && await UsuarioModel.existeEmail(email, id)) {
        return res.status(409).json({ ok: false, mensaje: 'El email ya está en uso' });
      }

      const updates = { nombre, email, rol, activo };
      if (password) {
        updates.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const usuario = await UsuarioModel.update(id, updates);
      if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      res.json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** DELETE /api/usuarios/:id  (admin) */
  async eliminar(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (id === req.user.id) {
        return res.status(422).json({ ok: false, mensaje: 'No puedes eliminar tu propia cuenta' });
      }
      const usuario = await UsuarioModel.remove(id);
      if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      res.json({ ok: true, mensaje: 'Usuario desactivado', data: usuario });
    } catch (err) { next(err); }
  },

  /** PUT /api/usuarios/me/password  (usuario actual cambia su clave) */
  async cambiarPassword(req, res, next) {
    try {
      const { password_actual, password_nuevo } = req.body;
      const usuarioDb = await UsuarioModel.findByEmail(req.user.email);

      const match = await bcrypt.compare(password_actual, usuarioDb.password_hash);
      if (!match) {
        return res.status(401).json({ ok: false, mensaje: 'La contraseña actual es incorrecta' });
      }

      const password_hash = await bcrypt.hash(password_nuevo, SALT_ROUNDS);
      await UsuarioModel.update(req.user.id, { password_hash });
      res.json({ ok: true, mensaje: 'Contraseña actualizada' });
    } catch (err) { next(err); }
  },
};
