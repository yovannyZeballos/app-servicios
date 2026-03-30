'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { TipoPagoController } from '../controllers/tipo_pago.controller.js';
import { authMiddleware, principalOrAdminMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authMiddleware);

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),
  validate,
];

const reglasCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('descripcion').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('principal_id').optional().isInt({ min: 1 }),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('descripcion').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('activo').optional().isBoolean(),
  validate,
];

// Lectura: cualquier usuario autenticado
router.get('/',           TipoPagoController.listar);
router.get('/:id', validarId, TipoPagoController.obtener);

// Escritura: solo admin o principal
router.post('/',   reglasCrear,      principalOrAdminMiddleware, TipoPagoController.crear);
router.put('/:id', reglasActualizar, principalOrAdminMiddleware, TipoPagoController.actualizar);
router.delete('/:id', validarId,     principalOrAdminMiddleware, TipoPagoController.eliminar);

export default router;
