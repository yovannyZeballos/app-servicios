'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { ClienteController } from '../controllers/cliente.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),
  validate,
];

const reglasCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido').isLength({ max: 100 }),
  body('email').trim().notEmpty().isEmail().withMessage('Email inválido').isLength({ max: 255 }),
  body('telefono').optional().trim().isLength({ max: 20 }),
  body('direccion').optional().trim().isLength({ max: 500 }),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('apellido').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().isLength({ max: 255 }),
  body('telefono').optional().trim().isLength({ max: 20 }),
  body('direccion').optional().trim().isLength({ max: 500 }),
  body('activo').optional().isBoolean(),
  validate,
];

router.get('/',           ClienteController.listar);
router.get('/:id', validarId, ClienteController.obtener);
router.post('/',   reglasCrear, ClienteController.crear);
router.put('/:id', reglasActualizar, ClienteController.actualizar);
router.delete('/:id', validarId, ClienteController.eliminar);

export default router;
