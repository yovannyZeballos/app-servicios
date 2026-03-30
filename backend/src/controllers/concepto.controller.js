'use strict';
import { ConceptoModel }  from '../models/concepto.model.js';
import { getPrincipalId } from '../middleware/auth.js';

export const ConceptoController = {

  /** GET /api/conceptos */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const principalId = getPrincipalId(req.user);
      const data = await ConceptoModel.findAll({ soloActivos, principalId: principalId ?? undefined });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/conceptos/:id */
  async obtener(req, res, next) {
    try {
      const concepto = await ConceptoModel.findById(Number(req.params.id));
      if (!concepto) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });
      res.json({ ok: true, data: concepto });
    } catch (err) { next(err); }
  },

  /** POST /api/conceptos */
  async crear(req, res, next) {
    try {
      const { nombre, descripcion, campo_referencia, principal_id: bodyPrincipalId } = req.body;

      const principal_id = req.user.rol === 'admin'
        ? (bodyPrincipalId ? Number(bodyPrincipalId) : null)
        : req.user.id; // principal usa el suyo propio

      if (principal_id && await ConceptoModel.existeNombre(nombre, principal_id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un concepto con ese nombre' });
      }
      const concepto = await ConceptoModel.create({ nombre, descripcion, campo_referencia, principal_id });
      res.status(201).json({ ok: true, data: concepto });
    } catch (err) { next(err); }
  },

  /** PUT /api/conceptos/:id */
  async actualizar(req, res, next) {
    try {
      const id      = Number(req.params.id);
      const actual  = await ConceptoModel.findById(id);
      if (!actual) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });

      // Principal solo puede editar sus propios conceptos
      if (req.user.rol === 'principal' && actual.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const { nombre, descripcion, campo_referencia, activo } = req.body;

      if (nombre && actual.principal_id && await ConceptoModel.existeNombre(nombre, actual.principal_id, id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un concepto con ese nombre' });
      }

      const concepto = await ConceptoModel.update(id, { nombre, descripcion, campo_referencia, activo });
      res.json({ ok: true, data: concepto });
    } catch (err) { next(err); }
  },

  /** DELETE /api/conceptos/:id */
  async eliminar(req, res, next) {
    try {
      const id     = Number(req.params.id);
      const actual = await ConceptoModel.findById(id);
      if (!actual) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });

      if (req.user.rol === 'principal' && actual.principal_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const concepto = await ConceptoModel.remove(id);
      res.json({ ok: true, mensaje: 'Concepto desactivado', data: concepto });
    } catch (err) { next(err); }
  },
};
