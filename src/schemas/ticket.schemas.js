import { z } from 'zod';

export const ticketSchemas = {
  // Esquema para transferir ticket
  transferTicket: z.object({
    ticketId: z.string()
      .min(1, 'ID del ticket es requerido')
      .regex(/^TK-[A-Z0-9-]+$/, 'Formato de ID de ticket inválido'),
    email: z.string()
      .email('Email inválido')
      .min(1, 'Email es requerido'),
    reason: z.string()
      .max(200, 'La razón no puede exceder 200 caracteres')
      .optional()
  }),

  // Esquema para validar ticket
  validateTicket: z.object({
    ticketId: z.string()
      .min(1, 'ID del ticket es requerido')
      .regex(/^TK-[A-Z0-9-]+$/, 'Formato de ID de ticket inválido')
  }),

  // Esquema para check-in de ticket
  checkInTicket: z.object({
    ticketId: z.string()
      .min(1, 'ID del ticket es requerido')
      .regex(/^TK-[A-Z0-9-]+$/, 'Formato de ID de ticket inválido'),
    location: z.string()
      .max(100, 'La ubicación no puede exceder 100 caracteres')
      .optional(),
    deviceInfo: z.string()
      .max(200, 'La información del dispositivo no puede exceder 200 caracteres')
      .optional()
  }),

  // Esquema para crear ticket (usado internamente)
  createTicket: z.object({
    event: z.string()
      .min(1, 'ID del evento es requerido')
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de evento inválido'),
    user: z.string()
      .min(1, 'ID del usuario es requerido')
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario inválido'),
    ticketType: z.enum(['general', 'vip', 'premium', 'student', 'early_bird'])
      .default('general'),
    quantity: z.number()
      .int('La cantidad debe ser un número entero')
      .min(1, 'La cantidad debe ser al menos 1')
      .max(10, 'La cantidad no puede exceder 10'),
    price: z.number()
      .min(0, 'El precio no puede ser negativo')
      .max(10000, 'El precio no puede exceder $10,000'),
    totalAmount: z.number()
      .min(0, 'El monto total no puede ser negativo'),
    paymentId: z.string()
      .min(1, 'ID de pago es requerido')
  }),

  // Esquema para actualizar ticket
  updateTicket: z.object({
    status: z.enum(['pending', 'confirmed', 'used', 'cancelled', 'transferred', 'refunded'])
      .optional(),
    notes: z.string()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional(),
    tags: z.array(z.string())
      .max(5, 'No se pueden agregar más de 5 etiquetas')
      .optional()
  }),

  // Esquema para consultas de tickets
  getTicketsQuery: z.object({
    status: z.enum(['pending', 'confirmed', 'used', 'cancelled', 'transferred', 'refunded'])
      .optional(),
    event: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de evento inválido')
      .optional(),
    ticketType: z.enum(['general', 'vip', 'premium', 'student', 'early_bird'])
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
  })
};

