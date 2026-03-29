'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { UsuarioController } from '../controllers/usuario.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(authMiddleware);

const validarId = [
  param('id').isInt({ min: 1 }),
  validate,
];

const reglasCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('rol').optional().isIn(['admin', 'user']).withMessage('rol debe ser admin o user'),
  validate,
];

const reglasActualizar = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('rol').optional().isIn(['admin', 'user']),
  body('activo').optional().isBoolean(),
  validate,
];

const reglasCambiarPassword = [
  body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('password_nuevo').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

// Rutas admin
router.get('/',              adminMiddleware, UsuarioController.listar);
router.get('/:id', validarId, adminMiddleware, UsuarioController.obtener);
router.post('/',   reglasCrear, adminMiddleware, UsuarioController.crear);
router.put('/:id', reglasActualizar, adminMiddleware, UsuarioController.actualizar);
router.delete('/:id', validarId, adminMiddleware, UsuarioController.eliminar);

// Ruta propia (no admin)
router.put('/me/password', reglasCambiarPassword, UsuarioController.cambiarPassword);

export default router;
