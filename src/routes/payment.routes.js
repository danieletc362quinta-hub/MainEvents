import express from 'express';
import {
  getUserPayments,
  getPaymentById,
  requestRefund,
  getUserRefunds,
  getPaymentStats,
  processPayment,
  getEventPayments
} from '../controllers/payment.controller.js';
import { authRequired } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { paymentSchemas } from '../schemas/payment.schemas.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authRequired);

// Obtener pagos del usuario
router.get('/user', getUserPayments);

// Obtener estadísticas de pagos del usuario
router.get('/stats', getPaymentStats);

// Obtener reembolsos del usuario
router.get('/refunds', getUserRefunds);

// Obtener pago por ID
router.get('/:paymentId', getPaymentById);

// Obtener pagos de un evento (para organizadores)
router.get('/event/:eventId', getEventPayments);

// Procesar pago
router.post('/process',
  validateSchema(paymentSchemas.processPayment),
  processPayment
);

// Solicitar reembolso
router.post('/:paymentId/refund',
  validateSchema(paymentSchemas.requestRefund),
  requestRefund
);

export default router;

