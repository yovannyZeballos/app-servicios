'use strict';
import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../models/usuario.model.js';

const SALT_ROUNDS = 12;

export const UsuarioController = {

  /** GET /api/usuarios  (admin ve todos; principal ve sus hijos) */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const principalId = req.user.rol === 'principal' ? req.user.id : undefined;
      const data = await UsuarioModel.findAll({ soloActivos, principalId });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/usuarios/:id */
  async obtener(req, res, next) {
    try {
      const usuario = await UsuarioModel.findById(Number(req.params.id));
      if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      // Principal solo puede ver sus propios hijos
      if (req.user.rol === 'principal' && usuario.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }
      res.json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** POST /api/usuarios */
  async crear(req, res, next) {
    try {
      const { nombre, email, password } = req.body;

      // Solo se crean usuarios 'user', automáticamente asociados al principal que los crea
      const principal_id = req.user.id;

      if (await UsuarioModel.existeEmail(email)) {
        return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const usuario = await UsuarioModel.create({ nombre, email, password_hash, rol: 'user', principal_id });
      res.status(201).json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** PUT /api/usuarios/:id */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const existente = await UsuarioModel.findById(id);
      if (!existente) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

      // Principal solo puede editar sus hijos
      if (existente.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const { nombre, email, password, activo } = req.body;

      if (email && await UsuarioModel.existeEmail(email, id)) {
        return res.status(409).json({ ok: false, mensaje: 'El email ya está en uso' });
      }

      const updates = { nombre, email, activo, rol: 'user', principal_id: req.user.id };
      if (password) {
        updates.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const usuario = await UsuarioModel.update(id, updates);
      res.json({ ok: true, data: usuario });
    } catch (err) { next(err); }
  },

  /** DELETE /api/usuarios/:id */
  async eliminar(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (id === req.user.id) {
        return res.status(422).json({ ok: false, mensaje: 'No puedes eliminar tu propia cuenta' });
      }

      const existente = await UsuarioModel.findById(id);
      if (!existente) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

      if (req.user.rol === 'principal' && existente.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const usuario = await UsuarioModel.remove(id);
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
