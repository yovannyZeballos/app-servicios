'use strict';
import { Router } from 'express';
import { body }   from 'express-validator';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const reglasLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate,
];

// POST /api/auth/login
router.post('/login', reglasLogin, AuthController.login);

// POST /api/auth/refresh
router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
  validate,
  AuthController.refresh,
);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me
router.get('/me', authMiddleware, AuthController.me);

export default router;
