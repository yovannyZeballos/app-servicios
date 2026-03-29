'use strict';
import { ClienteModel } from '../models/cliente.model.js';

export const ClienteController = {

  /** GET /api/clientes */
  async listar(req, res, next) {
    try {
      const soloActivos = req.query.activo === 'true';
      const data = await ClienteModel.findAll({ soloActivos });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/clientes/:id */
  async obtener(req, res, next) {
    try {
      const con_servicios = req.query.servicios === 'true';
      const id = Number(req.params.id);
      const cliente = con_servicios
        ? await ClienteModel.findByIdWithServicios(id)
        : await ClienteModel.findById(id);
      if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
      res.json({ ok: true, data: cliente });
    } catch (err) { next(err); }
  },

  /** POST /api/clientes */
  async crear(req, res, next) {
    try {
      const { nombre, apellido, email, telefono, direccion } = req.body;
      if (await ClienteModel.existeEmail(email)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un cliente con ese email' });
      }
      const cliente = await ClienteModel.create({ nombre, apellido, email, telefono, direccion });
      res.status(201).json({ ok: true, data: cliente });
    } catch (err) { next(err); }
  },

  /** PUT /api/clientes/:id */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { nombre, apellido, email, telefono, direccion, activo } = req.body;

      if (email && await ClienteModel.existeEmail(email, id)) {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un cliente con ese email' });
      }

      const cliente = await ClienteModel.update(id, { nombre, apellido, email, telefono, direccion, activo });
      if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
      res.json({ ok: true, data: cliente });
    } catch (err) { next(err); }
  },

  /** DELETE /api/clientes/:id */
  async eliminar(req, res, next) {
    try {
      const cliente = await ClienteModel.remove(Number(req.params.id));
      if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
      res.json({ ok: true, mensaje: 'Cliente desactivado', data: cliente });
    } catch (err) { next(err); }
  },
};
