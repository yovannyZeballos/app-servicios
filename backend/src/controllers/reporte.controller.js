'use strict';
import { PagoModel } from '../models/pago.model.js';

export const ReporteController = {

  /** GET /api/reporte/detalle?anio=&mes=&usuario_id= */
  async detalle(req, res, next) {
    try {
      const { anio, mes } = req.query;
      // Usuarios regulares solo ven su propio reporte
      const usuarioId = req.user.rol === 'admin'
        ? (req.query.usuario_id ? Number(req.query.usuario_id) : undefined)
        : req.user.id;

      const data = await PagoModel.reporteDetalle({
        usuarioId,
        anio: anio ? Number(anio) : undefined,
        mes:  mes  ? Number(mes)  : undefined,
      });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/reporte/resumen?anio=&usuario_id= */
  async resumen(req, res, next) {
    try {
      const { anio } = req.query;
      const usuarioId = req.user.rol === 'admin'
        ? (req.query.usuario_id ? Number(req.query.usuario_id) : undefined)
        : req.user.id;

      const data = await PagoModel.reporteResumen({
        usuarioId,
        anio: anio ? Number(anio) : undefined,
      });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },
};
