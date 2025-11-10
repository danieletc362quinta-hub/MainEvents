import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import User from '../models/user.model.js';
import Event from '../models/events.model.js';
import Supplier from '../models/supplier.model.js';

// Validaciones de autenticación
export const authValidations = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido')
      .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('El email ya está registrado');
        }
        return true;
      }),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
    
    body('phone')
      .optional()
      .isMobilePhone('es-ES')
      .withMessage('Número de teléfono inválido'),
    
    body('role')
      .optional()
      .isIn(['user', 'supplier'])
      .withMessage('Rol inválido')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      })
  ]
};

// Validaciones de eventos
export const eventValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El título debe tener entre 3 y 100 caracteres')
      .escape(),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('La descripción debe tener entre 10 y 1000 caracteres')
      .escape(),
    
    body('date')
      .isISO8601()
      .withMessage('Fecha inválida')
      .custom((value) => {
        const eventDate = new Date(value);
        const now = new Date();
        const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        
        if (eventDate <= now) {
          throw new Error('La fecha del evento debe ser futura');
        }
        
        if (eventDate > oneYearFromNow) {
          throw new Error('La fecha del evento no puede ser más de un año en el futuro');
        }
        
        return true;
      }),
    
    body('time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora inválida (formato: HH:MM)'),
    
    body('location')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('La ubicación debe tener entre 3 y 200 caracteres')
      .escape(),
    
    body('price')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('El precio debe ser un número entre 0 y 100,000'),
    
    body('capacity')
      .isInt({ min: 1, max: 10000 })
      .withMessage('La capacidad debe ser un número entre 1 y 10,000'),
    
    body('category')
      .isIn(['concierto', 'conferencia', 'workshop', 'deporte', 'arte', 'tecnologia', 'negocios', 'otro'])
      .withMessage('Categoría inválida'),
    
    body('image')
      .optional()
      .isURL()
      .withMessage('URL de imagen inválida'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Los tags deben ser un array')
      .custom((tags) => {
        if (tags && tags.length > 10) {
          throw new Error('Máximo 10 tags permitidos');
        }
        if (tags) {
          for (const tag of tags) {
            if (typeof tag !== 'string' || tag.length > 20) {
              throw new Error('Cada tag debe ser una cadena de máximo 20 caracteres');
            }
          }
        }
        return true;
      })
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('ID de evento inválido'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El título debe tener entre 3 y 100 caracteres')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('La descripción debe tener entre 10 y 1000 caracteres')
      .escape(),
    
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Fecha inválida')
      .custom((value) => {
        if (value) {
          const eventDate = new Date(value);
          const now = new Date();
          if (eventDate <= now) {
            throw new Error('La fecha del evento debe ser futura');
          }
        }
        return true;
      }),
    
    body('price')
      .optional()
      .isFloat({ min: 0, max: 100000 })
      .withMessage('El precio debe ser un número entre 0 y 100,000'),
    
    body('capacity')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('La capacidad debe ser un número entre 1 y 10,000')
  ],

  getById: [
    param('id')
      .isMongoId()
      .withMessage('ID de evento inválido')
  ]
};

// Validaciones de proveedores
export const supplierValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .escape(),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La descripción debe tener entre 10 y 500 caracteres')
      .escape(),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido')
      .custom(async (email) => {
        const existingSupplier = await Supplier.findOne({ email });
        if (existingSupplier) {
          throw new Error('El email ya está registrado');
        }
        return true;
      }),
    
    body('phone')
      .isMobilePhone('es-ES')
      .withMessage('Número de teléfono inválido'),
    
    body('address')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('La dirección debe tener entre 5 y 200 caracteres')
      .escape(),
    
    body('services')
      .isArray({ min: 1, max: 10 })
      .withMessage('Debe especificar entre 1 y 10 servicios')
      .custom((services) => {
        for (const service of services) {
          if (typeof service !== 'string' || service.length > 50) {
            throw new Error('Cada servicio debe ser una cadena de máximo 50 caracteres');
          }
        }
        return true;
      }),
    
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('La calificación debe ser un número entre 0 y 5'),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('URL del sitio web inválida'),
    
    body('socialMedia')
      .optional()
      .isObject()
      .withMessage('Las redes sociales deben ser un objeto')
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('ID de proveedor inválido'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La descripción debe tener entre 10 y 500 caracteres')
      .escape(),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    
    body('phone')
      .optional()
      .isMobilePhone('es-ES')
      .withMessage('Número de teléfono inválido')
  ]
};

// Validaciones de participantes
export const participantValidations = {
  register: [
    body('eventId')
      .isMongoId()
      .withMessage('ID de evento inválido')
      .custom(async (eventId) => {
        const event = await Event.findById(eventId);
        if (!event) {
          throw new Error('Evento no encontrado');
        }
        if (event.date < new Date()) {
          throw new Error('No se puede registrar en eventos pasados');
        }
        return true;
      }),
    
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .escape(),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    
    body('phone')
      .isMobilePhone('es-ES')
      .withMessage('Número de teléfono inválido'),
    
    body('dietaryRequirements')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Los requisitos dietéticos no pueden exceder 200 caracteres')
      .escape(),
    
    body('emergencyContact')
      .optional()
      .isObject()
      .withMessage('El contacto de emergencia debe ser un objeto')
      .custom((contact) => {
        if (contact) {
          if (!contact.name || !contact.phone) {
            throw new Error('El contacto de emergencia debe incluir nombre y teléfono');
          }
          if (contact.name.length > 50) {
            throw new Error('El nombre del contacto de emergencia no puede exceder 50 caracteres');
          }
          if (!/^[0-9+\-\s()]+$/.test(contact.phone)) {
            throw new Error('Número de teléfono del contacto de emergencia inválido');
          }
        }
        return true;
      })
  ]
};

// Validaciones de pagos
export const paymentValidations = {
  process: [
    body('eventId')
      .isMongoId()
      .withMessage('ID de evento inválido'),
    
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('El monto debe ser mayor a 0'),
    
    body('currency')
      .isIn(['USD', 'EUR', 'ARS'])
      .withMessage('Moneda inválida'),
    
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'])
      .withMessage('Método de pago inválido'),
    
    body('cardDetails')
      .optional()
      .isObject()
      .withMessage('Los detalles de la tarjeta deben ser un objeto')
      .custom((cardDetails) => {
        if (cardDetails) {
          if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
            throw new Error('Los detalles de la tarjeta deben incluir número, fecha de vencimiento y CVV');
          }
          if (!/^[0-9]{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
            throw new Error('Número de tarjeta inválido');
          }
          if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardDetails.expiryDate)) {
            throw new Error('Fecha de vencimiento inválida (formato: MM/YY)');
          }
          if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
            throw new Error('CVV inválido');
          }
        }
        return true;
      })
  ]
};

// Validaciones de consultas
export const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número mayor a 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
    
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'title', 'date', 'price', 'rating'])
      .withMessage('Campo de ordenamiento inválido'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Orden inválido (debe ser asc o desc')
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('La consulta de búsqueda debe tener entre 1 y 100 caracteres')
      .escape(),
    
    query('category')
      .optional()
      .isIn(['concierto', 'conferencia', 'workshop', 'deporte', 'arte', 'tecnologia', 'negocios', 'otro'])
      .withMessage('Categoría inválida'),
    
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Precio mínimo inválido'),
    
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Precio máximo inválido'),
    
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin inválida')
      .custom((value, { req }) => {
        if (value && req.query.dateFrom) {
          const dateFrom = new Date(req.query.dateFrom);
          const dateTo = new Date(value);
          if (dateTo <= dateFrom) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
        }
        return true;
      })
  ]
};

// Middleware de validación genérico
export const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Ejecutar validaciones
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Verificar errores
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation errors:', {
          errors: errors.array(),
          ip: req.ip,
          path: req.path,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params
        });
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
          }))
        });
      }
      
      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Validación de archivos
export const fileValidations = {
  image: (req, res, next) => {
    if (!req.file) {
      return next();
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WebP'
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
      });
    }
    
    next();
  }
};

export default {
  authValidations,
  eventValidations,
  supplierValidations,
  participantValidations,
  paymentValidations,
  queryValidations,
  fileValidations,
  validate
};
