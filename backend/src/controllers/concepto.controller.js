'use strict';
import { ConceptoModel } from '../models/concepto.model.js';

export const ConceptoController = {

  /** GET /api/conceptos */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const data = await ConceptoModel.findAll({ soloActivos });
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
      const { nombre, descripcion } = req.body;
      if (await ConceptoModel.existeNombre(nombre)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un concepto con ese nombre' });
      }
      const concepto = await ConceptoModel.create({ nombre, descripcion });
      res.status(201).json({ ok: true, data: concepto });
    } catch (err) { next(err); }
  },

  /** PUT /api/conceptos/:id */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { nombre, descripcion, activo } = req.body;

      if (nombre && await ConceptoModel.existeNombre(nombre, id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un concepto con ese nombre' });
      }

      const concepto = await ConceptoModel.update(id, { nombre, descripcion, activo });
      if (!concepto) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });
      res.json({ ok: true, data: concepto });
    } catch (err) { next(err); }
  },

  /** DELETE /api/conceptos/:id */
  async eliminar(req, res, next) {
    try {
      const concepto = await ConceptoModel.remove(Number(req.params.id));
      if (!concepto) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });
      res.json({ ok: true, mensaje: 'Concepto desactivado', data: concepto });
    } catch (err) { next(err); }
  },
};
