import express from 'express';
import {
  getHealthStatus,
  getDetailedMetrics,
  getPerformanceStats,
  startMonitoring,
  stopMonitoring,
  getDatabaseStatus,
  getServicesStatus,
  getSystemAlerts,
  getMetricsHistory,
  getAlertHistory,
  getAlertStats,
  setAlertThresholds,
  setAutoRecovery
} from '../controllers/monitoring.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = express.Router();

// Rutas públicas para health check
router.get('/health', getHealthStatus);
router.get('/health/database', getDatabaseStatus);
router.get('/health/services', getServicesStatus);

// Rutas protegidas para monitoreo detallado
router.use(authRequired);

// Métricas y monitoreo
router.get('/monitoring/metrics', getDetailedMetrics);
router.get('/monitoring/performance', getPerformanceStats);
router.get('/monitoring/alerts', getSystemAlerts);
router.get('/monitoring/history', getMetricsHistory);
router.get('/monitoring/alert-history', getAlertHistory);
router.get('/monitoring/alert-stats', getAlertStats);

// Control del monitoreo (solo admin)
router.post('/monitoring/start', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los administradores pueden iniciar el monitoreo'
    });
  }
  next();
}, startMonitoring);

router.post('/monitoring/stop', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los administradores pueden detener el monitoreo'
    });
  }
  next();
}, stopMonitoring);

// Configuración de alertas (solo admin)
router.post('/monitoring/alert-thresholds', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los administradores pueden configurar umbrales de alerta'
    });
  }
  next();
}, setAlertThresholds);

router.post('/monitoring/auto-recovery', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los administradores pueden configurar recuperación automática'
    });
  }
  next();
}, setAutoRecovery);

export default router;
