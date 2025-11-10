import { z } from 'zod';

// Esquema para datos de registro
const registrationDataSchema = z.object({
  firstName: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .trim(),
  
  lastName: z.string()
    .min(1, 'El apellido es obligatorio')
    .max(50, 'El apellido no puede exceder los 50 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
    .trim(),
  
  dateOfBirth: z.string()
    .datetime('Fecha de nacimiento inválida')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Fecha de nacimiento inválida'),
  
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .default('prefer_not_to_say'),
  
  emergencyContact: z.object({
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    relationship: z.string().trim().optional()
  }).optional(),
  
  specialRequirements: z.object({
    dietary: z.string().trim().optional(),
    mobility: z.string().trim().optional(),
    medical: z.string().trim().optional(),
    other: z.string().trim().optional()
  }).optional()
});

// Esquema para ticket
const ticketSchema = z.object({
  type: z.enum(['general', 'vip', 'premium', 'student', 'senior', 'group']),
  quantity: z.number()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(10, 'La cantidad máxima es 10'),
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(100000, 'El precio es demasiado alto')
});

// Esquema para pago
const paymentSchema = z.object({
  method: z.enum(['mercadopago', 'transfer', 'cash', 'card']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  transactionId: z.string().trim().optional(),
  paymentDate: z.string().datetime().optional(),
  refundDate: z.string().datetime().optional(),
  refundAmount: z.number().min(0).optional()
});

// Esquema principal para registro de participante
export const participantSchema = z.object({
  eventId: z.string()
    .min(1, 'El ID del evento es obligatorio')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de evento inválido'),
  
  registrationData: registrationDataSchema,
  
  ticket: ticketSchema,
  
  payment: paymentSchema,
  
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true)
  }).optional()
});

// Esquema para feedback
export const feedbackSchema = z.object({
  rating: z.number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  
  comment: z.string()
    .max(500, 'El comentario no puede exceder los 500 caracteres')
    .trim()
    .optional()
});

// Esquema para cancelación
export const cancellationSchema = z.object({
  reason: z.string()
    .max(200, 'La razón no puede exceder los 200 caracteres')
    .trim()
    .optional()
});

// Esquema para check-in
export const checkInSchema = z.object({
  location: z.string()
    .min(1, 'La ubicación es obligatoria')
    .max(100, 'La ubicación no puede exceder los 100 caracteres')
    .trim()
});

// Middleware de validación para participante
export const validateParticipant = (req, res, next) => {
  try {
    const validatedData = participantSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

// Middleware de validación para feedback
export const validateFeedback = (req, res, next) => {
  try {
    const validatedData = feedbackSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

// Middleware de validación para cancelación
export const validateCancellation = (req, res, next) => {
  try {
    const validatedData = cancellationSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

// Middleware de validación para check-in
export const validateCheckIn = (req, res, next) => {
  try {
    const validatedData = checkInSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};
