import { z } from "zod";

const EVENT_TYPES = ['publico', 'privado', 'corporativo', 'musical', 'deportivo', 'educativo', 'cultural'];
const EVENT_STATES = ['activo', 'cancelado', 'completado', 'pendiente'];
const VISIBILITY_TYPES = ['publico', 'privado'];

export const createEventSchema = z.object({
  name: z.string({ required_error: "El nombre del evento es obligatorio" })
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" })
    .trim(),
  description: z.string({ required_error: "La descripción es obligatoria" })
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(1000, { message: "La descripción no puede exceder 1000 caracteres" })
    .trim(),
  date: z.string({ required_error: "La fecha es obligatoria" })
    .min(10, { message: "La fecha debe tener al menos 10 caracteres" }),
  endDate: z.string()
    .optional(),
  duration: z.number()
    .min(15, { message: "La duración mínima es 15 minutos" })
    .max(1440, { message: "La duración máxima es 24 horas (1440 minutos)" })
    .optional(),
  location: z.string({ required_error: "La ubicación es obligatoria" })
    .min(5, { message: "La ubicación debe tener al menos 5 caracteres" })
    .max(200, { message: "La ubicación no puede exceder 200 caracteres" })
    .trim(),
  image: z.string({ required_error: "La imagen es obligatoria" })
    .min(1, { message: "La imagen no puede estar vacía" })
    .trim(),
  organizer: z.string()
    .min(2, { message: "El organizador debe tener al menos 2 caracteres" })
    .max(100, { message: "El organizador no puede exceder 100 caracteres" })
    .trim()
    .optional(),
  type: z.enum(EVENT_TYPES, { 
    required_error: "El tipo de evento es obligatorio",
    invalid_type_error: "Tipo de evento no válido"
  }).default("publico"),
  estado: z.enum(EVENT_STATES, {
    invalid_type_error: "Estado no válido"
  }).default("activo"),
  capacidad: z.number({ required_error: "La capacidad es obligatoria" })
    .min(1, { message: "La capacidad mínima es 1" })
    .max(10000, { message: "La capacidad máxima es 10,000" }),
  price: z.number({ required_error: "El precio es obligatorio" })
    .min(0, { message: "El precio no puede ser negativo" })
    .max(10000, { message: "El precio máximo es $10,000" }),
  tags: z.array(z.string()
    .min(1, { message: "Las etiquetas no pueden estar vacías" })
    .max(20, { message: "Las etiquetas no pueden exceder 20 caracteres" }))
    .max(10, { message: "Máximo 10 etiquetas" })
    .optional(),
  category: z.string()
    .max(50, { message: "La categoría no puede exceder 50 caracteres" })
    .optional(),
  visibility: z.enum(VISIBILITY_TYPES, {
    invalid_type_error: "Tipo de visibilidad no válido"
  }).default("publico"),
  urlStreaming: z.string()
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  // If endDate is provided, it must be after start date
  if (data.endDate && data.date) {
    return new Date(data.endDate) > new Date(data.date);
  }
  return true;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"]
});

export const updateEventSchema = z.object({
  name: z.string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" })
    .trim()
    .optional(),
  description: z.string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(1000, { message: "La descripción no puede exceder 1000 caracteres" })
    .trim()
    .optional(),
  date: z.string()
    .min(10, { message: "La fecha debe tener al menos 10 caracteres" })
    .optional(),
  endDate: z.string()
    .optional(),
  duration: z.number()
    .min(15, { message: "La duración mínima es 15 minutos" })
    .max(1440, { message: "La duración máxima es 24 horas (1440 minutos)" })
    .optional(),
  location: z.string()
    .min(5, { message: "La ubicación debe tener al menos 5 caracteres" })
    .max(200, { message: "La ubicación no puede exceder 200 caracteres" })
    .trim()
    .optional(),
  image: z.string()
    .min(1, { message: "La imagen no puede estar vacía" })
    .trim()
    .optional(),
  organizer: z.string()
    .min(2, { message: "El organizador debe tener al menos 2 caracteres" })
    .max(100, { message: "El organizador no puede exceder 100 caracteres" })
    .trim()
    .optional(),
  type: z.enum(EVENT_TYPES, { 
    invalid_type_error: "Tipo de evento no válido"
  }).optional(),
  estado: z.enum(EVENT_STATES, {
    invalid_type_error: "Estado no válido"
  }).optional(),
  capacidad: z.number()
    .min(1, { message: "La capacidad mínima es 1" })
    .max(10000, { message: "La capacidad máxima es 10,000" })
    .optional(),
  price: z.number()
    .min(0, { message: "El precio no puede ser negativo" })
    .max(10000, { message: "El precio máximo es $10,000" })
    .optional(),
  tags: z.array(z.string()
    .min(1, { message: "Las etiquetas no pueden estar vacías" })
    .max(20, { message: "Las etiquetas no pueden exceder 20 caracteres" }))
    .max(10, { message: "Máximo 10 etiquetas" })
    .optional(),
  category: z.string()
    .max(50, { message: "La categoría no puede exceder 50 caracteres" })
    .optional(),
  visibility: z.enum(VISIBILITY_TYPES, {
    invalid_type_error: "Tipo de visibilidad no válido"
  }).optional(),
  urlStreaming: z.string()
    .optional()
    .or(z.literal(""))
});

export const attendEventSchema = z.object({
  quantity: z.number({ required_error: "La cantidad es obligatoria" })
    .min(1, { message: "La cantidad mínima es 1" })
    .max(50, { message: "La cantidad máxima es 50" })
});

export const commentEventSchema = z.object({
  text: z.string({ required_error: "El comentario es obligatorio" })
    .min(1, { message: "El comentario no puede estar vacío" })
    .max(500, { message: "El comentario no puede exceder 500 caracteres" })
    .trim()
});

export const favoriteEventSchema = z.object({
  eventId: z.string({ required_error: "El ID del evento es obligatorio" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID de evento inválido" })
});
