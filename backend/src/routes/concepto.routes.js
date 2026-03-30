'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { ConceptoController } from '../controllers/concepto.controller.js';
import { authMiddleware, principalOrAdminMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Todos los endpoints de conceptos requieren autenticación
router.use(authMiddleware);

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),
  validate,
];

const reglasCrear = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  body('descripcion').optional().trim().isLength({ max: 500 }),
  body('campo_referencia').optional().trim().isLength({ max: 200 }),
  body('principal_id').optional().isInt({ min: 1 }),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('descripcion').optional().trim().isLength({ max: 500 }),
  body('campo_referencia').optional().trim().isLength({ max: 200 }),
  body('activo').optional().isBoolean(),
  validate,
];

// Lectura: cualquier usuario autenticado
router.get('/',           ConceptoController.listar);
router.get('/:id', validarId, ConceptoController.obtener);

// Escritura: admin o principal
router.post('/',   reglasCrear,      principalOrAdminMiddleware, ConceptoController.crear);
router.put('/:id', reglasActualizar, principalOrAdminMiddleware, ConceptoController.actualizar);
router.delete('/:id', validarId,     principalOrAdminMiddleware, ConceptoController.eliminar);

export default router;
