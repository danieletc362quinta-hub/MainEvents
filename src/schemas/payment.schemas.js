import { z } from 'zod';

export const paymentSchemas = {
  // Esquema para procesar pago
  processPayment: z.object({
    eventId: z.string()
      .min(1, 'ID del evento es requerido')
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de evento inválido'),
    amount: z.number()
      .min(0, 'El monto no puede ser negativo')
      .optional(),
    paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'mercadopago', 'bank_transfer', 'cash'])
      .default('mercadopago'),
    billingInfo: z.object({
      name: z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
      email: z.string()
        .email('Email inválido'),
      phone: z.string()
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .optional(),
      address: z.object({
        street: z.string()
          .max(200, 'La dirección no puede exceder 200 caracteres')
          .optional(),
        city: z.string()
          .max(100, 'La ciudad no puede exceder 100 caracteres')
          .optional(),
        state: z.string()
          .max(100, 'El estado no puede exceder 100 caracteres')
          .optional(),
        zipCode: z.string()
          .max(20, 'El código postal no puede exceder 20 caracteres')
          .optional(),
        country: z.string()
          .max(100, 'El país no puede exceder 100 caracteres')
          .optional()
      }).optional()
    }).optional()
  }),

  // Esquema para solicitar reembolso
  requestRefund: z.object({
    amount: z.number()
      .min(0.01, 'El monto debe ser mayor a 0')
      .optional(),
    reason: z.string()
      .min(1, 'La razón del reembolso es requerida')
      .max(500, 'La razón no puede exceder 500 caracteres')
  }),

  // Esquema para consultas de pagos
  getPaymentsQuery: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
      .optional(),
    paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'mercadopago', 'bank_transfer', 'cash'])
      .optional(),
    startDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
      .optional(),
    endDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
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

  // Esquema para consultas de reembolsos
  getRefundsQuery: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
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

  // Esquema para actualizar pago (admin)
  updatePayment: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
      .optional(),
    providerTransactionId: z.string()
      .max(100, 'ID de transacción no puede exceder 100 caracteres')
      .optional(),
    providerPaymentId: z.string()
      .max(100, 'ID de pago no puede exceder 100 caracteres')
      .optional(),
    notes: z.string()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional()
  }),

  // Esquema para procesar reembolso (admin)
  processRefund: z.object({
    refundId: z.string()
      .min(1, 'ID del reembolso es requerido'),
    status: z.enum(['processing', 'completed', 'failed', 'cancelled']),
    providerRefundId: z.string()
      .max(100, 'ID de reembolso del proveedor no puede exceder 100 caracteres')
      .optional(),
    notes: z.string()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional()
  })
};

