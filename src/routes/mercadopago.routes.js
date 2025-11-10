import express from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import {
  createMPPayment,
  confirmMPPayment,
  mpWebhook,
  validateMPTicket,
  getUserMPTickets,
  getMPPaymentStats,
  refundMPPayment,
  searchMPPayments,
  getMPPaymentInfo
} from '../controllers/mercadopago.controller.js';
import {
  createMPPaymentSchema,
  confirmMPPaymentSchema,
  validateMPTicketSchema,
  refundMPSchema,
  mpPaymentStatsSchema,
  mpWebhookSchema,
  getUserMPTicketsSchema,
  searchMPPaymentsSchema
} from '../schemas/mercadopago.schemas.js';

const router = express.Router();

// Webhook de Mercado Pago (sin autenticación)
router.post('/webhook', 
  validateSchema(mpWebhookSchema),
  mpWebhook
);

// Middleware de autenticación para todas las demás rutas
router.use(authRequired);

// Crear preferencia de pago
router.post('/create', 
  validateSchema(createMPPaymentSchema), 
  createMPPayment
);

// Confirmar pago (para desarrollo/testing)
router.post('/confirm', 
  validateSchema(confirmMPPaymentSchema), 
  confirmMPPayment
);

// Validar ticket (para organizadores/admins)
router.post('/validate-ticket', 
  validateSchema(validateMPTicketSchema), 
  validateMPTicket
);

// Obtener tickets del usuario
router.get('/tickets', 
  validateSchema(getUserMPTicketsSchema), 
  getUserMPTickets
);

// Obtener estadísticas de pagos (organizadores/admins)
router.get('/stats', 
  validateSchema(mpPaymentStatsSchema), 
  getMPPaymentStats
);

// Reembolsar pago (organizadores/admins)
router.post('/refund', 
  validateSchema(refundMPSchema), 
  refundMPPayment
);

// Buscar pagos (organizadores/admins)
router.get('/search', 
  validateSchema(searchMPPaymentsSchema), 
  searchMPPayments
);

// Obtener información de un pago específico
router.get('/payment/:paymentId', 
  getMPPaymentInfo
);

export default router; 