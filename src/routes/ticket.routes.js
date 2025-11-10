import express from 'express';
import {
  getUserTickets,
  getTicketById,
  transferTicket,
  downloadTicket,
  validateTicket,
  checkInTicket,
  getTicketStats
} from '../controllers/ticket.controller.js';
import { authRequired } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { ticketSchemas } from '../schemas/ticket.schemas.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authRequired);

// Obtener tickets del usuario
router.get('/user', getUserTickets);

// Obtener estadísticas de tickets del usuario
router.get('/stats', getTicketStats);

// Obtener ticket por ID
router.get('/:ticketId', getTicketById);

// Transferir ticket
router.post('/transfer', 
  validateSchema(ticketSchemas.transferTicket),
  transferTicket
);

// Descargar ticket en PDF
router.get('/:ticketId/download', downloadTicket);

// Validar ticket (para check-in)
router.post('/validate',
  validateSchema(ticketSchemas.validateTicket),
  validateTicket
);

// Check-in de ticket (para organizadores)
router.post('/checkin',
  validateSchema(ticketSchemas.checkInTicket),
  checkInTicket
);

export default router;

