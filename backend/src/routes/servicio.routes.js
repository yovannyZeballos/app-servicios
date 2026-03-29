'use strict';
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ServicioController } from '../controllers/servicio.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const validarId = [
  param('id').isInt({ min: 1 }),
  validate,
];

const reglasCrear = [
  body('cliente_id').isInt({ min: 1 }).withMessage('cliente_id requerido'),
  body('concepto_id').isInt({ min: 1 }).withMessage('concepto_id requerido'),
  body('monto').optional().isFloat({ gt: 0 }).withMessage('monto debe ser > 0'),
  body('fecha_inicio').notEmpty().isISO8601().withMessage('fecha_inicio requerida (YYYY-MM-DD)'),
  body('fecha_fin').optional().isISO8601().withMessage('fecha_fin debe ser YYYY-MM-DD'),
  body('observaciones').optional().trim().isLength({ max: 500 }),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('monto').optional().isFloat({ gt: 0 }),
  body('fecha_fin').optional().isISO8601(),
  body('activo').optional().isBoolean(),
  body('observaciones').optional().trim().isLength({ max: 500 }),
  validate,
];

router.get('/',           ServicioController.listar);
router.get('/:id', validarId, ServicioController.obtener);
router.post('/',   reglasCrear, ServicioController.crear);
router.put('/:id', reglasActualizar, ServicioController.actualizar);
router.delete('/:id', validarId, ServicioController.eliminar);

export default router;
