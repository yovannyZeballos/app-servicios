'use strict';
import { PeriodoModel } from '../models/periodo.model.js';
import { PagoModel }    from '../models/pago.model.js';

/** Devuelve la fecha de inicio y fin dado un año y mes */
function calcularFechasPeriodo(anio, mes) {
  const fecha_inicio = new Date(anio, mes - 1, 1);
  const fecha_fin    = new Date(anio, mes, 0);       // día 0 del mes siguiente = último día del mes actual
  return {
    fecha_inicio: fecha_inicio.toISOString().slice(0, 10),
    fecha_fin:    fecha_fin.toISOString().slice(0, 10),
  };
}

export const PeriodoController = {

  /** GET /api/periodos */
  async listar(req, res, next) {
    try {
      const { estado } = req.query;
      if (estado && !['abierto', 'cerrado'].includes(estado)) {
        return res.status(400).json({ ok: false, mensaje: 'estado debe ser abierto o cerrado' });
      }
      const data = await PeriodoModel.findAll({ estado });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/periodos/:id */
  async obtener(req, res, next) {
    try {
      const periodo = await PeriodoModel.findById(Number(req.params.id));
      if (!periodo) return res.status(404).json({ ok: false, mensaje: 'Periodo no encontrado' });
      res.json({ ok: true, data: periodo });
    } catch (err) { next(err); }
  },

  /** POST /api/periodos */
  async crear(req, res, next) {
    try {
      const { anio, mes } = req.body;

      const existente = await PeriodoModel.findByAnioMes(anio, mes);
      if (existente) {
        return res.status(409).json({ ok: false, mensaje: `Ya existe el periodo ${mes}/${anio}` });
      }

      const { fecha_inicio, fecha_fin } = calcularFechasPeriodo(anio, mes);
      const periodo = await PeriodoModel.create({ anio, mes, fecha_inicio, fecha_fin });
      res.status(201).json({ ok: true, data: periodo });
    } catch (err) { next(err); }
  },

  /**
   * PUT /api/periodos/:id/cerrar
   * Cierra el periodo y marca los pagos pendientes como vencidos.
   */
  async cerrar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const periodo = await PeriodoModel.cerrar(id);
      if (!periodo) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Periodo no encontrado o ya se encuentra cerrado',
        });
      }
      const vencidos = await PagoModel.marcarVencidos(id);
      res.json({ ok: true, data: periodo, pagos_vencidos: vencidos });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/periodos/:id/generar-pagos
   * Genera registros pendientes de pago para todos los servicios activos.
   */
  async generarPagos(req, res, next) {
    try {
      const id = Number(req.params.id);
      const periodo = await PeriodoModel.findById(id);
      if (!periodo) return res.status(404).json({ ok: false, mensaje: 'Periodo no encontrado' });
      if (periodo.estado === 'cerrado') {
        return res.status(422).json({ ok: false, mensaje: 'No se pueden generar pagos en un periodo cerrado' });
      }
      const pagos = await PagoModel.generarPagosPeriodo(id);
      res.status(201).json({ ok: true, generados: pagos.length, data: pagos });
    } catch (err) { next(err); }
  },
};
