import { z } from "zod";

export const createReviewSchema = z.object({
  event: z.string({ required_error: "El ID del evento es obligatorio" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID de evento inválido" }),
  rating: z.number({ required_error: "La calificación es obligatoria" })
    .min(1, { message: "La calificación mínima es 1" })
    .max(5, { message: "La calificación máxima es 5" }),
  title: z.string()
    .max(100, { message: "El título no puede exceder 100 caracteres" })
    .trim()
    .optional(),
  comment: z.string({ required_error: "El comentario es obligatorio" })
    .min(10, { message: "El comentario debe tener al menos 10 caracteres" })
    .max(1000, { message: "El comentario no puede exceder 1000 caracteres" })
    .trim(),
  categories: z.object({
    organization: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    value: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    experience: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    service: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional()
  }).optional()
});

export const updateReviewSchema = z.object({
  rating: z.number()
    .min(1, { message: "La calificación mínima es 1" })
    .max(5, { message: "La calificación máxima es 5" })
    .optional(),
  title: z.string()
    .max(100, { message: "El título no puede exceder 100 caracteres" })
    .trim()
    .optional(),
  comment: z.string()
    .min(10, { message: "El comentario debe tener al menos 10 caracteres" })
    .max(1000, { message: "El comentario no puede exceder 1000 caracteres" })
    .trim()
    .optional(),
  categories: z.object({
    organization: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    value: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    experience: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional(),
    service: z.number()
      .min(1, { message: "La calificación mínima es 1" })
      .max(5, { message: "La calificación máxima es 5" })
      .optional()
  }).optional()
});

export const helpfulReviewSchema = z.object({
  reviewId: z.string({ required_error: "El ID del review es obligatorio" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID de review inválido" }),
  helpful: z.boolean({ required_error: "Debe indicar si fue útil o no" })
}); 