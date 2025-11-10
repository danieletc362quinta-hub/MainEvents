import { z } from 'zod';

// Esquema para crear preferencia de pago
export const createMPPaymentSchema = z.object({
  eventId: z.string().min(1, 'El ID del evento es obligatorio'),
  ticketType: z.enum(['general', 'vip', 'early_bird', 'student', 'senior'], {
    errorMap: () => ({ message: 'Tipo de ticket inválido' })
  }),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1').max(10, 'Máximo 10 tickets por compra'),
  customPrice: z.number().optional(),
  discountCode: z.string().optional(),
  currency: z.enum(['ARS', 'USD', 'BRL']).default('ARS'),
  backUrls: z.object({
    success: z.string().url().optional(),
    failure: z.string().url().optional(),
    pending: z.string().url().optional()
  }).optional()
});

// Esquema para confirmar pago
export const confirmMPPaymentSchema = z.object({
  paymentId: z.string().min(1, 'ID de pago es obligatorio'),
  preferenceId: z.string().optional()
});

// Esquema para validar ticket
export const validateMPTicketSchema = z.object({
  ticketId: z.string().min(1, 'ID del ticket es obligatorio'),
  qrCode: z.string().min(1, 'Código QR es obligatorio')
});

// Esquema para reembolso
export const refundMPSchema = z.object({
  paymentId: z.string().min(1, 'ID de pago es obligatorio'),
  amount: z.number().positive().optional(),
  reason: z.string().min(1, 'Razón del reembolso es obligatoria'),
  description: z.string().optional()
});

// Esquema para estadísticas de pagos
export const mpPaymentStatsSchema = z.object({
  eventId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day')
});

// Esquema para webhook de Mercado Pago
export const mpWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string().optional()
  }).optional()
});

// Esquema para obtener tickets del usuario
export const getUserMPTicketsSchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).default('10'),
  status: z.enum(['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded']).optional()
});

// Esquema para buscar pagos
export const searchMPPaymentsSchema = z.object({
  eventId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).default('20')
});

// Esquema para validar disponibilidad de tickets
export const validateMPTicketAvailabilitySchema = z.object({
  eventId: z.string().min(1, 'ID del evento es obligatorio'),
  ticketType: z.enum(['general', 'vip', 'early_bird', 'student', 'senior']),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1')
});

// Función para validar disponibilidad de tickets
export const validateMPTicketAvailability = async (event, ticketType, quantity) => {
  if (!event) {
    throw new Error('Evento no encontrado');
  }

  // Validar que el evento no esté lleno
  if (event.capacidad <= 0) {
    throw new Error('Evento sin capacidad disponible');
  }

  // Validar que la cantidad no exceda la capacidad
  if (quantity > event.capacidad) {
    throw new Error(`Solo quedan ${event.capacidad} lugares disponibles`);
  }

  // Validar que el evento no haya pasado
  const now = new Date();
  if (new Date(event.date) < now) {
    throw new Error('El evento ya ha pasado');
  }

  return {
    available: event.capacidad,
    requested: quantity,
    canPurchase: true
  };
};

// Esquema para crear preferencia de pago con validaciones adicionales
export const createMPPaymentWithValidationSchema = createMPPaymentSchema
  .refine(async (data) => {
    // Aquí podrías agregar validaciones adicionales
    // como verificar que el evento existe, etc.
    return true;
  }, {
    message: 'Error en la validación del evento',
    path: ['eventId']
  });

// Esquema para actualizar estado de pago
export const updateMPPaymentStatusSchema = z.object({
  paymentId: z.string().min(1, 'ID de pago es obligatorio'),
  status: z.enum(['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded']),
  statusDetail: z.string().optional()
});

// Esquema para generar reporte de ventas
export const generateMPSalesReportSchema = z.object({
  eventId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeDetails: z.boolean().default(false)
});

// Esquema para configuración de Mercado Pago
export const mpConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access token es obligatorio'),
  webhookSecret: z.string().optional(),
  sandboxMode: z.boolean().default(false),
  defaultCurrency: z.enum(['ARS', 'USD', 'BRL']).default('ARS'),
  maxInstallments: z.number().min(1).max(12).default(12),
  excludedPaymentTypes: z.array(z.string()).default([])
});

// Esquema para notificaciones de pago
export const mpNotificationSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string().optional(),
    status: z.string().optional(),
    status_detail: z.string().optional(),
    external_reference: z.string().optional()
  }).optional()
}); 