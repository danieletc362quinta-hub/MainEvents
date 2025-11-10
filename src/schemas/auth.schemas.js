import { z } from "zod";

const ROLE_VALUES = ["admin", "user", "proveedor"];
const SERVICIOS_VALUES = [
  "dj", "comida", "musica", "luz", "sonido", "decoracion", "fotografia", "video", "otro"
];

// Función para sanitizar strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios
};

export const registerSchema = z.object({
  name: z.string()
    .max(50, { message: "El nombre no puede exceder 50 caracteres" })
    .transform(sanitizeString)
    .optional(),
  email: z.string({ required_error: "El email es obligatorio" })
    .email({ message: "El email no es válido" })
    .toLowerCase()
    .trim()
    .max(100, { message: "El email no puede exceder 100 caracteres" })
    .refine((val) => !val.includes('..') && !val.includes('--'), {
      message: "El email contiene caracteres inválidos"
    }),
    
  password: z.string({ required_error: "La contraseña es obligatoria" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(128, { message: "La contraseña no puede exceder 128 caracteres" }),
  role: z.enum(ROLE_VALUES, { 
    required_error: "El rol es obligatorio", 
    invalid_type_error: "Rol no válido" 
  }).default("user"),
  servicios: z.array(z.enum(SERVICIOS_VALUES, { 
    invalid_type_error: "Servicio no válido" 
  })).optional().refine((val) => {
    if (val && val.length > 0) return true;
    return true; // Allow empty array
  }, { message: "Debe seleccionar al menos un servicio si es proveedor" }),
  descripcion: z.string()
    .max(500, { message: "La descripción no puede exceder 500 caracteres" })
    .optional()
    .transform(sanitizeString),
  contacto: z.string()
    .max(100, { message: "El contacto no puede exceder 100 caracteres" })
    .optional()
    .transform(sanitizeString)
}).refine((data) => {
  // If role is proveedor, servicios and descripcion are required
  if (data.role === 'proveedor') {
    if (!data.servicios || data.servicios.length === 0) {
      return false;
    }
    if (!data.descripcion || data.descripcion.trim().length === 0) {
      return false;
    }
  }
  return true;
}, {
  message: "Los proveedores deben especificar servicios y descripción",
  path: ["servicios"]
});

export const loginSchema = z.object({
  email: z.string({ required_error: "El email es obligatorio" })
    .email({ message: "El email no es válido" })
    .toLowerCase()
    .trim()
    .max(100, { message: "El email no puede exceder 100 caracteres" })
    .refine((val) => !val.includes('..') && !val.includes('--'), {
      message: "El email contiene caracteres inválidos"
    }),
  password: z.string({ required_error: "La contraseña es obligatoria" })
    .min(1, { message: "La contraseña es obligatoria" })
    .max(128, { message: "La contraseña no puede exceder 128 caracteres" })
});

// Schema para actualización de perfil
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede exceder 50 caracteres" })
    .transform(sanitizeString)
    .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), {
      message: "El nombre solo puede contener letras y espacios"
    })
    .optional(),
  email: z.string()
    .email({ message: "El email no es válido" })
    .toLowerCase()
    .trim()
    .max(100, { message: "El email no puede exceder 100 caracteres" })
    .refine((val) => !val.includes('..') && !val.includes('--'), {
      message: "El email contiene caracteres inválidos"
    })
    .optional(),
  phone: z.string()
    .max(20, { message: "El teléfono no puede exceder 20 caracteres" })
    .transform(sanitizeString)
    .optional(),
  location: z.string()
    .max(100, { message: "La ubicación no puede exceder 100 caracteres" })
    .transform(sanitizeString)
    .optional(),
  bio: z.string()
    .max(500, { message: "La biografía no puede exceder 500 caracteres" })
    .transform(sanitizeString)
    .optional(),
  descripcion: z.string()
    .max(500, { message: "La descripción no puede exceder 500 caracteres" })
    .transform(sanitizeString)
    .optional(),
  contacto: z.string()
    .max(100, { message: "El contacto no puede exceder 100 caracteres" })
    .transform(sanitizeString)
    .optional(),
  servicios: z.array(z.enum(SERVICIOS_VALUES, { 
    invalid_type_error: "Servicio no válido" 
  })).optional()
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: "La contraseña actual es obligatoria" })
    .min(1, { message: "La contraseña actual es obligatoria" }),
  newPassword: z.string({ required_error: "La nueva contraseña es obligatoria" })
    .min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres" })
    .max(128, { message: "La nueva contraseña no puede exceder 128 caracteres" }),
  confirmPassword: z.string({ required_error: "La confirmación de contraseña es obligatoria" })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});