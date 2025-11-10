import express from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  createCoupon,
  validateCoupon,
  getActiveCoupons,
  getUserCoupons,
  getCouponStats,
  deactivateCoupon,
  getCouponUsageHistory
} from '../controllers/coupon.controller.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.use(authRequired);

// Crear un nuevo cupón (solo admins y organizadores)
router.post('/create', createCoupon);

// Validar un cupón
router.post('/validate', validateCoupon);

// Obtener cupones activos
router.get('/active', getActiveCoupons);

// Obtener cupones del usuario
router.get('/user', getUserCoupons);

// Obtener estadísticas de cupones (solo admins)
router.get('/stats', getCouponStats);

// Desactivar un cupón
router.put('/:couponId/deactivate', deactivateCoupon);

// Obtener historial de uso de un cupón
router.get('/:couponId/history', getCouponUsageHistory);

export default router; 