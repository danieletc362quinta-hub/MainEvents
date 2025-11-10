import { z } from 'zod';

// Esquema para crear/actualizar proveedor
export const supplierSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
    .trim(),
  
  services: z.array(z.enum([
    'dj', 'musica', 'iluminacion', 'sonido', 'catering', 
    'decoracion', 'fotografia', 'video', 'animacion', 
    'seguridad', 'transporte', 'alquiler', 'otros'
  ]))
    .min(1, 'Debe seleccionar al menos un servicio'),
  
  description: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder los 500 caracteres')
    .trim(),
  
  contact: z.string()
    .min(1, 'El contacto es obligatorio')
    .max(200, 'El contacto no puede exceder los 200 caracteres')
    .trim(),
  
  address: z.object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
    country: z.string().trim().default('Argentina')
  }).optional(),
  
  portfolio: z.array(z.object({
    title: z.string().min(1, 'El título es obligatorio').trim(),
    description: z.string().trim().optional(),
    imageUrl: z.string().url('URL de imagen inválida'),
    eventType: z.string().min(1, 'El tipo de evento es obligatorio').trim(),
    date: z.string().datetime('Fecha inválida')
  })).optional(),
  
  availability: z.object({
    isAvailable: z.boolean().default(true),
    schedule: z.array(z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      startTime: z.string().optional(),
      endTime: z.string().optional()
    })).optional(),
    blackoutDates: z.array(z.string().datetime()).optional()
  }).optional(),
  
  pricing: z.object({
    basePrice: z.number()
      .min(0, 'El precio base no puede ser negativo')
      .max(1000000, 'El precio base es demasiado alto'),
    currency: z.string().default('ARS'),
    pricingType: z.enum(['hourly', 'daily', 'event', 'package']).default('event'),
    packages: z.array(z.object({
      name: z.string().min(1, 'El nombre del paquete es obligatorio').trim(),
      description: z.string().trim().optional(),
      price: z.number().min(0, 'El precio no puede ser negativo'),
      includes: z.array(z.string()).optional()
    })).optional()
  }).optional(),
  
  socialMedia: z.object({
    website: z.string().url('URL de sitio web inválida').optional(),
    instagram: z.string().trim().optional(),
    facebook: z.string().trim().optional(),
    twitter: z.string().trim().optional(),
    linkedin: z.string().trim().optional()
  }).optional(),
  
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional()
});

// Esquema para reseña
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  
  comment: z.string()
    .max(500, 'El comentario no puede exceder los 500 caracteres')
    .trim()
    .optional()
});

// Esquema para actualizar disponibilidad
export const availabilitySchema = z.object({
  isAvailable: z.boolean(),
  schedule: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: z.string().optional(),
    endTime: z.string().optional()
  })).optional(),
  blackoutDates: z.array(z.string().datetime()).optional()
});

// Middleware de validación para proveedor
export const validateSupplier = (req, res, next) => {
  try {
    const validatedData = supplierSchema.parse(req.body);
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

// Middleware de validación para reseña
export const validateReview = (req, res, next) => {
  try {
    const validatedData = reviewSchema.parse(req.body);
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

// Middleware de validación para disponibilidad
export const validateAvailability = (req, res, next) => {
  try {
    const validatedData = availabilitySchema.parse(req.body);
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
