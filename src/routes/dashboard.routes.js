import { Router } from 'express';
import {
  getAdminDashboard,
  getOrganizerDashboard,
  getUserDashboard,
  getPublicStats
} from '../controllers/dashboard.controller.js';
import { authRequired } from '../middlewares/auth.js';

const router = Router();

// Ruta pública (sin autenticación)
router.get('/stats/public', getPublicStats);

// Rutas protegidas (requieren autenticación)
router.get('/dashboard/admin', authRequired, getAdminDashboard);
router.get('/dashboard/organizer', authRequired, getOrganizerDashboard);
router.get('/dashboard/user', authRequired, getUserDashboard);

// Ruta para estadísticas de usuario (usada por el frontend)
router.get('/stats/user', authRequired, getUserDashboard);

export default router; 