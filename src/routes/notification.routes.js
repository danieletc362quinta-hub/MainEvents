import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getNotificationStats,
  createNotification,
  sendSystemAnnouncement,
  cleanupOldNotifications,
  getNotificationsByType
} from '../controllers/notification.controller.js';
import { authRequired } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { notificationSchemas } from '../schemas/notification.schemas.js';

const router = express.Router();

// Rutas protegidas
router.use(authRequired);

// Obtener notificaciones del usuario
router.get('/', getUserNotifications);

// Obtener estadísticas de notificaciones
router.get('/stats', getNotificationStats);

// Obtener notificaciones por tipo
router.get('/type/:type', getNotificationsByType);

// Marcar notificación como leída
router.put('/:notificationId/read', markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/read-all', markAllAsRead);

// Archivar notificación
router.put('/:notificationId/archive', archiveNotification);

// Crear notificación (para administradores)
router.post('/',
  validateSchema(notificationSchemas.createNotification),
  createNotification
);

// Enviar anuncio del sistema (para administradores)
router.post('/announcement',
  validateSchema(notificationSchemas.sendSystemAnnouncement),
  sendSystemAnnouncement
);

// Limpiar notificaciones antiguas (para administradores)
router.delete('/cleanup', cleanupOldNotifications);

export default router; 