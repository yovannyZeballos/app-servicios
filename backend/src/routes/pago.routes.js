'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { PagoController } from '../controllers/pago.controller.js';
import { authMiddleware }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authMiddleware);

const validarId = [
  param('id').isInt({ min: 1 }),
  validate,
];

const reglasCrear = [
  body('concepto_id').isInt({ min: 1 }).withMessage('concepto_id requerido'),
  body('anio').isInt({ min: 2000, max: 2100 }).withMessage('Año inválido'),
  body('mes').isInt({ min: 1, max: 12 }).withMessage('Mes inválido (1-12)'),
  body('monto').isFloat({ gt: 0 }).withMessage('monto debe ser > 0'),
  body('fecha_pago').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('referencia').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('observaciones').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('estado').optional().isIn(['pagado', 'pendiente']),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('concepto_id').optional().isInt({ min: 1 }),
  body('anio').optional().isInt({ min: 2000, max: 2100 }),
  body('mes').optional().isInt({ min: 1, max: 12 }),
  body('monto').optional().isFloat({ gt: 0 }),
  body('fecha_pago').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('referencia').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('observaciones').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('estado').optional().isIn(['pagado', 'pendiente']),
  validate,
];

const reglasGenerar = [
  body('anio').isInt({ min: 2000, max: 2100 }).withMessage('Año inválido'),
  body('mes').isInt({ min: 1, max: 12 }).withMessage('Mes inválido (1-12)'),
  validate,
];

// /generar debe ir ANTES de /:id para evitar conflicto de rutas
router.post('/generar', reglasGenerar, PagoController.generar);

router.get('/',            PagoController.listar);
router.get('/:id', validarId, PagoController.obtener);
router.post('/',   reglasCrear, PagoController.crear);
router.put('/:id', reglasActualizar, PagoController.actualizar);
router.delete('/:id', validarId, PagoController.eliminar);

export default router;
