'use strict';
import { TipoPagoModel }   from '../models/tipo_pago.model.js';
import { getPrincipalId }  from '../middleware/auth.js';

export const TipoPagoController = {

  /** GET /api/tipos-pago */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const principalId = getPrincipalId(req.user);
      const data = await TipoPagoModel.findAll({ principalId: principalId ?? undefined, soloActivos });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/tipos-pago/:id */
  async obtener(req, res, next) {
    try {
      const tipo = await TipoPagoModel.findById(Number(req.params.id));
      if (!tipo) return res.status(404).json({ ok: false, mensaje: 'Tipo de pago no encontrado' });
      res.json({ ok: true, data: tipo });
    } catch (err) { next(err); }
  },

  /** POST /api/tipos-pago */
  async crear(req, res, next) {
    try {
      const { nombre, descripcion, principal_id: bodyPrincipalId } = req.body;

      // Admin puede especificar principal_id; principal usa el suyo
      const principal_id = req.user.rol === 'admin'
        ? (bodyPrincipalId ? Number(bodyPrincipalId) : req.user.id)
        : req.user.id;

      if (await TipoPagoModel.existeNombre(nombre, principal_id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un tipo de pago con ese nombre' });
      }

      const tipo = await TipoPagoModel.create({ principal_id, nombre, descripcion });
      res.status(201).json({ ok: true, data: tipo });
    } catch (err) { next(err); }
  },

  /** PUT /api/tipos-pago/:id */
  async actualizar(req, res, next) {
    try {
      const id   = Number(req.params.id);
      const tipo = await TipoPagoModel.findById(id);
      if (!tipo) return res.status(404).json({ ok: false, mensaje: 'Tipo de pago no encontrado' });

      // Verificar que el principal sea el dueño (admin puede editar cualquiera)
      if (req.user.rol === 'principal' && tipo.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const { nombre, descripcion, activo } = req.body;

      if (nombre && await TipoPagoModel.existeNombre(nombre, tipo.principal_id, id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un tipo de pago con ese nombre' });
      }

      const updated = await TipoPagoModel.update(id, { nombre, descripcion, activo });
      res.json({ ok: true, data: updated });
    } catch (err) { next(err); }
  },

  /** DELETE /api/tipos-pago/:id */
  async eliminar(req, res, next) {
    try {
      const id   = Number(req.params.id);
      const tipo = await TipoPagoModel.findById(id);
      if (!tipo) return res.status(404).json({ ok: false, mensaje: 'Tipo de pago no encontrado' });

      if (req.user.rol === 'principal' && tipo.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const removed = await TipoPagoModel.remove(id);
      res.json({ ok: true, mensaje: 'Tipo de pago desactivado', data: removed });
    } catch (err) { next(err); }
  },
};
