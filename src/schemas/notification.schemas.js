import { z } from 'zod';

export const notificationSchemas = {
  // Esquema para crear notificación
  createNotification: z.object({
    userId: z.string()
      .min(1, 'ID del usuario es requerido')
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario inválido'),
    type: z.enum([
      'event_created',
      'event_updated',
      'event_cancelled',
      'event_reminder',
      'attendance_confirmed',
      'attendance_cancelled',
      'payment_completed',
      'payment_failed',
      'refund_requested',
      'refund_processed',
      'ticket_transferred',
      'ticket_downloaded',
      'new_comment',
      'new_review',
      'system_announcement',
      'security_alert'
    ]),
    title: z.string()
      .min(1, 'El título es requerido')
      .max(200, 'El título no puede exceder 200 caracteres'),
    message: z.string()
      .min(1, 'El mensaje es requerido')
      .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
    data: z.object({}).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
      .default('medium'),
    channels: z.array(z.enum(['in_app', 'email', 'push', 'sms']))
      .default(['in_app']),
    scheduledFor: z.string()
      .datetime('Formato de fecha inválido')
      .optional()
  }),

  // Esquema para enviar anuncio del sistema
  sendSystemAnnouncement: z.object({
    title: z.string()
      .min(1, 'El título es requerido')
      .max(200, 'El título no puede exceder 200 caracteres'),
    message: z.string()
      .min(1, 'El mensaje es requerido')
      .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
    targetUsers: z.array(z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario inválido'))
      .optional()
  }),

  // Esquema para consultas de notificaciones
  getNotificationsQuery: z.object({
    status: z.enum(['unread', 'read', 'archived', 'all'])
      .default('unread'),
    type: z.enum([
      'event_created',
      'event_updated',
      'event_cancelled',
      'event_reminder',
      'attendance_confirmed',
      'attendance_cancelled',
      'payment_completed',
      'payment_failed',
      'refund_requested',
      'refund_processed',
      'ticket_transferred',
      'ticket_downloaded',
      'new_comment',
      'new_review',
      'system_announcement',
      'security_alert'
    ]).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
      .optional(),
    page: z.string()
      .regex(/^\d+$/, 'Página debe ser un número')
      .transform(Number)
      .refine(n => n > 0, 'Página debe ser mayor a 0')
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Límite debe ser un número')
      .transform(Number)
      .refine(n => n > 0 && n <= 100, 'Límite debe estar entre 1 y 100')
      .optional()
      .default('20')
  }),

  // Esquema para actualizar notificación
  updateNotification: z.object({
    status: z.enum(['unread', 'read', 'archived'])
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
      .optional(),
    title: z.string()
      .max(200, 'El título no puede exceder 200 caracteres')
      .optional(),
    message: z.string()
      .max(1000, 'El mensaje no puede exceder 1000 caracteres')
      .optional()
  }),

  // Esquema para limpiar notificaciones
  cleanupNotifications: z.object({
    daysOld: z.string()
      .regex(/^\d+$/, 'Días debe ser un número')
      .transform(Number)
      .refine(n => n > 0 && n <= 365, 'Días debe estar entre 1 y 365')
      .optional()
      .default('30')
  })
};




