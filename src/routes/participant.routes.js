import express from 'express';
import {
  registerParticipant,
  getEventParticipants,
  getUserParticipants,
  getParticipantById,
  confirmParticipant,
  cancelParticipant,
  checkInParticipant,
  markAsNoShow,
  submitFeedback,
  getEventParticipantStats,
  searchParticipantByTicket
} from '../controllers/participant.controller.js';
import { authRequired } from '../middlewares/validateToken.js';
import { validateParticipant, validateFeedback } from '../schemas/participant.schemas.js';

const router = express.Router();

// Rutas públicas
router.get('/participants/search/ticket/:ticketNumber', searchParticipantByTicket);

// Rutas protegidas
router.use(authRequired);

// Registro de participantes
router.post('/participants/register', validateParticipant, registerParticipant);

// Obtener participantes
router.get('/participants/event/:eventId', getEventParticipants);
router.get('/participants/user', getUserParticipants);
router.get('/participants/:id', getParticipantById);

// Gestión de participantes
router.put('/participants/:id/confirm', confirmParticipant);
router.put('/participants/:id/cancel', cancelParticipant);
router.put('/participants/:id/checkin', checkInParticipant);
router.put('/participants/:id/no-show', markAsNoShow);

// Feedback
router.post('/participants/:id/feedback', validateFeedback, submitFeedback);

// Estadísticas
router.get('/participants/event/:eventId/stats', getEventParticipantStats);

export default router;
