import express from 'express';
import {
  registerAttendance,
  getUserAttendances,
  getEventAttendances,
  confirmAttendance,
  checkInAttendance,
  cancelAttendance,
  getAttendanceStats
} from '../controllers/attendance.controller.js';
import { authRequired } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { attendanceSchemas } from '../schemas/attendance.schemas.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authRequired);

// Registrar asistencia a un evento
router.post('/register/:eventId',
  validateSchema(attendanceSchemas.registerAttendance),
  registerAttendance
);

// Obtener asistencias del usuario
router.get('/user', getUserAttendances);

// Obtener asistencias de un evento (para organizadores)
router.get('/event/:eventId', getEventAttendances);

// Obtener estadísticas de asistencia (para organizadores)
router.get('/stats/:eventId', getAttendanceStats);

// Confirmar asistencia
router.post('/confirm/:attendanceId', confirmAttendance);

// Realizar check-in (para organizadores)
router.post('/checkin/:attendanceId',
  validateSchema(attendanceSchemas.checkInAttendance),
  checkInAttendance
);

// Cancelar asistencia
router.post('/cancel/:attendanceId',
  validateSchema(attendanceSchemas.cancelAttendance),
  cancelAttendance
);

export default router;

