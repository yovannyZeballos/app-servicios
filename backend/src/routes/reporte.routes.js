'use strict';
import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller.js';
import { authMiddleware }     from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/reporte/detalle?anio=&mes=
router.get('/detalle', ReporteController.detalle);

// GET /api/reporte/resumen?anio=
router.get('/resumen', ReporteController.resumen);

export default router;
