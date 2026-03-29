'use strict';
import { PagoModel }         from '../models/pago.model.js';
import { ConceptoModel }     from '../models/concepto.model.js';
import { SuscripcionModel }  from '../models/suscripcion.model.js';

export const PagoController = {

  async listar(req, res, next) {
    try {
      const { concepto_id, anio, mes, estado } = req.query;
      const usuarioId = req.user.rol === 'admin'
        ? (req.query.usuario_id ? Number(req.query.usuario_id) : undefined)
        : req.user.id;

      const data = await PagoModel.findAll({
        usuarioId,
        conceptoId: concepto_id ? Number(concepto_id) : undefined,
        anio:       anio   ? Number(anio)   : undefined,
        mes:        mes    ? Number(mes)    : undefined,
        estado,
      });
      res.json({ ok: true, data });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const pago = await PagoModel.findById(Number(req.params.id));
      if (!pago) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
      if (req.user.rol !== 'admin' && pago.usuario_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }
      res.json({ ok: true, data: pago });
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const { concepto_id, anio, mes, monto, fecha_pago, referencia, observaciones, estado } = req.body;
      const usuario_id = req.user.id;

      const concepto = await ConceptoModel.findById(concepto_id);
      if (!concepto)        return res.status(404).json({ ok: false, mensaje: 'Concepto no encontrado' });
      if (!concepto.activo) return res.status(422).json({ ok: false, mensaje: 'El concepto está inactivo' });

      const pago = await PagoModel.create({
        usuario_id, concepto_id, anio, mes, monto,
        fecha_pago: fecha_pago || null,
        referencia, observaciones, estado,
      });
      res.status(201).json({ ok: true, data: pago });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const pagoActual = await PagoModel.findById(id);
      if (!pagoActual) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
      if (req.user.rol !== 'admin' && pagoActual.usuario_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }
      const { concepto_id, anio, mes, monto, fecha_pago, referencia, observaciones, estado } = req.body;
      const pago = await PagoModel.update(id, {
        concepto_id: concepto_id ?? null,
        anio:        anio        ?? null,
        mes:         mes         ?? null,
        monto,
        fecha_pago: fecha_pago || null,
        referencia, observaciones, estado,
      });
      res.json({ ok: true, data: pago });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const pagoActual = await PagoModel.findById(id);
      if (!pagoActual) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
      if (req.user.rol !== 'admin' && pagoActual.usuario_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado' });
      }
      await PagoModel.remove(id);
      res.json({ ok: true, mensaje: 'Pago eliminado' });
    } catch (err) { next(err); }
  },

  /** POST /api/pagos/generar — genera pendientes desde la plantilla mensual */
  async generar(req, res, next) {
    try {
      const { anio, mes } = req.body;
      const usuario_id = req.user.id;

      const suscripciones = await SuscripcionModel.findByUsuario(usuario_id, true);
      if (suscripciones.length === 0) {
        return res.status(422).json({
          ok: false,
          mensaje: 'No tienes servicios en tu plantilla mensual. Agrégalos primero.',
        });
      }

      let creados = 0;
      let saltados = 0;

      for (const s of suscripciones) {
        // Solo salta si ya hay un pendiente para ese concepto y período
        const existe = await PagoModel.existePago(usuario_id, s.concepto_id, anio, mes, { estado: 'pendiente' });
        if (existe) { saltados++; continue; }

        await PagoModel.create({
          usuario_id,
          concepto_id: s.concepto_id,
          anio, mes,
          monto:      s.monto_referencia,
          fecha_pago: null,
          estado:     'pendiente',
        });
        creados++;
      }

      const mensaje = creados > 0
        ? `${creados} pago(s) pendiente(s) generado(s)` + (saltados > 0 ? `, ${saltados} ya existían` : '')
        : 'Todos los pagos de este período ya estaban registrados';

      res.json({ ok: true, mensaje, data: { creados, saltados } });
    } catch (err) { next(err); }
  },
};
