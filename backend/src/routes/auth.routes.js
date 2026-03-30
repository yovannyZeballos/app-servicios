'use strict';
import { Router } from 'express';
import { body }   from 'express-validator';
import passport   from '../config/passport.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const reglasLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate,
];

const reglasRegister = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

// POST /api/auth/register
router.post('/register', reglasRegister, AuthController.register);

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

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }),
  AuthController.googleCallback,
);

export default router;
