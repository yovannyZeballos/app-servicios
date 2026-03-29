'use strict';
import { ServicioModel } from '../models/servicio.model.js';
import { ClienteModel }  from '../models/cliente.model.js';
import { ConceptoModel } from '../models/concepto.model.js';

export const ServicioController = {

  /** GET /api/servicios */
  async listar(req, res, next) {
    try {
      const { cliente_id, concepto_id, activo } = req.query;
      const data = await ServicioModel.findAll({
        clienteId:  cliente_id  ? Number(cliente_id)  : undefined,
        conceptoId: concepto_id ? Number(concepto_id) : undefined,
        soloActivos: activo === 'true',
      });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/servicios/:id */
  async obtener(req, res, next) {
    try {
      const servicio = await ServicioModel.findById(Number(req.params.id));
      if (!servicio) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
      res.json({ ok: true, data: servicio });
    } catch (err) { next(err); }
  },

  /** POST /api/servicios */
  async crear(req, res, next) {
    try {
      const { cliente_id, concepto_id, monto, fecha_inicio, fecha_fin, observaciones } = req.body;

      const [cliente, concepto] = await Promise.all([
        ClienteModel.findById(cliente_id),
        ConceptoModel.findById(concepto_id),
      ]);
      if (!cliente)  return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
      if (!concepto) return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });
      if (!cliente.activo)  return res.status(422).json({ ok: false, mensaje: 'El cliente está inactivo' });
      if (!concepto.activo) return res.status(422).json({ ok: false, mensaje: 'El concepto está inactivo' });

      if (await ServicioModel.existeContratoActivo(cliente_id, concepto_id)) {
        return res.status(409).json({ ok: false, mensaje: 'El cliente ya tiene ese servicio activo' });
      }

      const montoFinal = monto ?? concepto.monto_base;
      const servicio = await ServicioModel.create({
        cliente_id, concepto_id, monto: montoFinal,
        fecha_inicio, fecha_fin, observaciones,
      });
      res.status(201).json({ ok: true, data: servicio });
    } catch (err) { next(err); }
  },

  /** PUT /api/servicios/:id */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { monto, fecha_fin, activo, observaciones } = req.body;
      const servicio = await ServicioModel.update(id, { monto, fecha_fin, activo, observaciones });
      if (!servicio) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
      res.json({ ok: true, data: servicio });
    } catch (err) { next(err); }
  },

  /** DELETE /api/servicios/:id */
  async eliminar(req, res, next) {
    try {
      const servicio = await ServicioModel.remove(Number(req.params.id));
      if (!servicio) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
      res.json({ ok: true, mensaje: 'Servicio desactivado', data: servicio });
    } catch (err) { next(err); }
  },
};
