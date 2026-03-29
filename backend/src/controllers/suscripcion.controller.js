'use strict';
import { SuscripcionModel } from '../models/suscripcion.model.js';

export const SuscripcionController = {

  /** GET /api/suscripciones */
  async listar(req, res, next) {
    try {
      const data = await SuscripcionModel.findByUsuario(req.user.id);
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** POST /api/suscripciones */
  async crear(req, res, next) {
    try {
      const { concepto_id, monto_referencia } = req.body;
      const usuario_id = req.user.id;

      const s = await SuscripcionModel.create({ usuario_id, concepto_id, monto_referencia });
      res.status(201).json({ ok: true, data: s });
    } catch (err) { next(err); }
  },

  /** PUT /api/suscripciones/:id */
  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const s  = await SuscripcionModel.findById(id);
      if (!s) return res.status(404).json({ ok: false, mensaje: 'Suscripción no encontrada' });

      if (s.usuario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      const { monto_referencia, activo } = req.body;
      const updated = await SuscripcionModel.update(id, { monto_referencia, activo });
      res.json({ ok: true, data: updated });
    } catch (err) { next(err); }
  },

  /** DELETE /api/suscripciones/:id */
  async eliminar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const s  = await SuscripcionModel.findById(id);
      if (!s) return res.status(404).json({ ok: false, mensaje: 'Suscripción no encontrada' });

      if (s.usuario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }

      await SuscripcionModel.remove(id);
      res.json({ ok: true, mensaje: 'Servicio eliminado de la plantilla' });
    } catch (err) { next(err); }
  },
};
