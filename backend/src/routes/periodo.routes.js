'use strict';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { PeriodoController } from '../controllers/periodo.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const validarId = [
  param('id').isInt({ min: 1 }),
  validate,
];

const reglasCrear = [
  body('anio')
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido (2000-2100)'),
  body('mes')
    .isInt({ min: 1, max: 12 }).withMessage('mes inválido (1-12)'),
  validate,
];

router.get('/',                    PeriodoController.listar);
router.get('/:id',   validarId,    PeriodoController.obtener);
router.post('/',     reglasCrear,  PeriodoController.crear);
router.put('/:id/cerrar',  validarId, PeriodoController.cerrar);
router.post('/:id/generar-pagos', validarId, PeriodoController.generarPagos);

export default router;
