'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { SuscripcionController } from '../controllers/suscripcion.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authMiddleware);

const validarId = [param('id').isInt({ min: 1 }), validate];

const reglasCrear = [
  body('concepto_id').isInt({ min: 1 }).withMessage('concepto_id requerido'),
  body('monto_referencia').isFloat({ gt: 0 }).withMessage('monto_referencia debe ser mayor a 0'),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('monto_referencia').optional().isFloat({ gt: 0 }),
  body('activo').optional().isBoolean(),
  validate,
];

router.get('/',            SuscripcionController.listar);
router.post('/',  reglasCrear,     SuscripcionController.crear);
router.put('/:id', reglasActualizar, SuscripcionController.actualizar);
router.delete('/:id', validarId,   SuscripcionController.eliminar);

export default router;
