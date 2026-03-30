'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { UsuarioController } from '../controllers/usuario.controller.js';
import { authMiddleware, principalMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authMiddleware);

const validarId = [
  param('id').isInt({ min: 1 }),
  validate,
];

const reglasCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('activo').optional().isBoolean(),
  validate,
];

const reglasCambiarPassword = [
  body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('password_nuevo').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

// Solo el principal puede gestionar sus usuarios hijos
router.get('/',               principalMiddleware, UsuarioController.listar);
router.get('/:id', validarId, principalMiddleware, UsuarioController.obtener);
router.post('/',   reglasCrear,       principalMiddleware, UsuarioController.crear);
router.put('/:id', reglasActualizar,  principalMiddleware, UsuarioController.actualizar);
router.delete('/:id', validarId,      principalMiddleware, UsuarioController.eliminar);

// Ruta propia
router.put('/me/password', reglasCambiarPassword, UsuarioController.cambiarPassword);

export default router;
