import { z } from 'zod';

export const attendanceSchemas = {
  // Esquema para registrar asistencia
  registerAttendance: z.object({
    paymentId: z.string()
      .min(1, 'ID de pago es requerido si hay costo')
      .optional(),
    amount: z.number()
      .min(0, 'El monto no puede ser negativo')
      .optional(),
    source: z.enum(['web', 'mobile', 'api', 'admin'])
      .default('web')
  }),

  // Esquema para check-in
  checkInAttendance: z.object({
    location: z.string()
      .max(100, 'La ubicación no puede exceder 100 caracteres')
      .optional(),
    deviceInfo: z.string()
      .max(200, 'La información del dispositivo no puede exceder 200 caracteres')
      .optional()
  }),

  // Esquema para cancelar asistencia
  cancelAttendance: z.object({
    reason: z.string()
      .max(500, 'La razón no puede exceder 500 caracteres')
      .optional()
  }),

  // Esquema para consultas de asistencias
  getAttendancesQuery: z.object({
    status: z.enum(['registered', 'confirmed', 'attended', 'no_show', 'cancelled'])
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
      .default('10')
  }),

  // Esquema para feedback de asistencia
  submitFeedback: z.object({
    rating: z.number()
      .min(1, 'La calificación debe ser al menos 1')
      .max(5, 'La calificación no puede exceder 5'),
    comment: z.string()
      .max(1000, 'El comentario no puede exceder 1000 caracteres')
      .optional(),
    isPublic: z.boolean()
      .default(true)
  })
};

