import { z } from 'zod';

// Esquema para crear un cupón
export const createCouponSchema = z.object({
  code: z.string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El código solo puede contener letras mayúsculas y números'),
  
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'buy_one_get_one']),
  
  value: z.number()
    .positive('El valor debe ser positivo')
    .refine(val => {
      if (val > 100) return false;
      return true;
    }, 'El porcentaje no puede exceder 100%'),
  
  maxDiscount: z.number()
    .positive('El descuento máximo debe ser positivo')
    .optional(),
  
  minPurchase: z.number()
    .min(0, 'La compra mínima no puede ser negativa')
    .optional(),
  
  validFrom: z.string()
    .datetime('Formato de fecha inválido')
    .optional(),
  
  validUntil: z.string()
    .datetime('Formato de fecha inválido')
    .refine(date => new Date(date) > new Date(), {
      message: 'La fecha de expiración debe ser futura'
    }),
  
  maxUses: z.number()
    .int('El número máximo de usos debe ser un entero')
    .positive('El número máximo de usos debe ser positivo')
    .optional(),
  
  maxUsesPerUser: z.number()
    .int('El número máximo de usos por usuario debe ser un entero')
    .positive('El número máximo de usos por usuario debe ser positivo')
    .optional(),
  
  applicableEvents: z.array(z.string())
    .optional(),
  
  applicableCategories: z.array(z.enum([
    'publico',
    'privado', 
    'corporativo',
    'musical',
    'deportivo',
    'educativo',
    'cultural'
  ]))
  .optional(),
  
  applicableUsers: z.array(z.string())
    .optional(),
  
  isActive: z.boolean()
    .default(true),
  
  restrictions: z.object({
    firstTimeOnly: z.boolean().default(false),
    newUsersOnly: z.boolean().default(false),
    excludeDiscountedItems: z.boolean().default(false),
    minimumItems: z.number().int().positive().optional(),
    maximumItems: z.number().int().positive().optional()
  })
  .optional()
});

// Esquema para validar un cupón
export const validateCouponSchema = z.object({
  code: z.string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres'),
  
  eventId: z.string()
    .min(24, 'ID de evento inválido')
    .max(24, 'ID de evento inválido'),
  
  amount: z.number()
    .positive('El monto debe ser positivo')
});

// Esquema para actualizar un cupón
export const updateCouponSchema = createCouponSchema.partial().extend({
  id: z.string()
    .min(24, 'ID de cupón inválido')
    .max(24, 'ID de cupón inválido')
});

// Esquema para buscar cupones
export const searchCouponsSchema = z.object({
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'buy_one_get_one']).optional(),
  isActive: z.boolean().optional(),
  category: z.enum([
    'publico',
    'privado', 
    'corporativo',
    'musical',
    'deportivo',
    'educativo',
    'cultural'
  ]).optional(),
  minValue: z.number().positive().optional(),
  maxValue: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
}); 