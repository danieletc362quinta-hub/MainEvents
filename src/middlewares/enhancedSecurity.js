import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import encryptionService from '../utils/encryption.js';

// Rate limiting avanzado
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Demasiadas solicitudes') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiting específico para autenticación
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos por IP
  'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.'
);

// Rate limiting para APIs públicas
export const publicApiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  1000, // 1000 requests por IP
  'Límite de API excedido. Intenta nuevamente más tarde.'
);

// Rate limiting para operaciones sensibles
export const sensitiveOperationRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hora
  10, // 10 operaciones por IP
  'Demasiadas operaciones sensibles. Intenta nuevamente en 1 hora.'
);

// Configuración de Helmet mejorada
export const enhancedHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Middleware de validación de entrada mejorado
export const validateInput = (validations) => {
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
          method: req.method
        });
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
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

// Validaciones comunes
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
    
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  phone: body('phone')
    .optional()
    .isMobilePhone('es-ES')
    .withMessage('Número de teléfono inválido'),
    
  eventTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres')
    .escape(),
    
  eventDescription: body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres')
    .escape(),
    
  eventDate: body('date')
    .isISO8601()
    .withMessage('Fecha inválida')
    .custom((value) => {
      const eventDate = new Date(value);
      const now = new Date();
      if (eventDate <= now) {
        throw new Error('La fecha del evento debe ser futura');
      }
      return true;
    }),
    
  eventPrice: body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
    
  eventCapacity: body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('La capacidad debe ser un número entre 1 y 10000')
};

// Middleware de sanitización de datos
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitizar query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitizar params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función para sanitizar objetos recursivamente
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

// Función para sanitizar strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .substring(0, 10000); // Limitar longitud
};

// Middleware de encriptación de datos sensibles
export const encryptSensitiveData = (fields = []) => {
  return (req, res, next) => {
    try {
      if (req.body) {
        for (const field of fields) {
          if (req.body[field]) {
            req.body[field] = encryptionService.encrypt(req.body[field]);
          }
        }
      }
      next();
    } catch (error) {
      logger.error('Encryption error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware de desencriptación de datos sensibles
export const decryptSensitiveData = (fields = []) => {
  return (req, res, next) => {
    try {
      if (req.body) {
        for (const field of fields) {
          if (req.body[field]) {
            req.body[field] = encryptionService.decrypt(req.body[field]);
          }
        }
      }
      next();
    } catch (error) {
      logger.error('Decryption error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware de validación de archivos
export const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles = 5
  } = options;
  
  return (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }
      
      // Verificar número de archivos
      if (req.files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Máximo ${maxFiles} archivos permitidos`
        });
      }
      
      // Verificar cada archivo
      for (const file of req.files) {
        // Verificar tamaño
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `El archivo ${file.originalname} excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`
          });
        }
        
        // Verificar tipo MIME
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `Tipo de archivo no permitido: ${file.mimetype}`
          });
        }
        
        // Verificar extensión
        const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          return res.status(400).json({
            success: false,
            message: `Extensión de archivo no permitida: ${fileExtension}`
          });
        }
      }
      
      next();
    } catch (error) {
      logger.error('File validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware de detección de ataques
export const detectAttacks = (req, res, next) => {
  try {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi
    ];
    
    const checkString = (str) => {
      if (typeof str !== 'string') return false;
      return suspiciousPatterns.some(pattern => pattern.test(str));
    };
    
    const checkObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return false;
      
      for (const [key, value] of Object.entries(obj)) {
        if (checkString(key) || checkString(value) || checkObject(value)) {
          return true;
        }
      }
      return false;
    };
    
    // Verificar body, query y params
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
      logger.warn('Suspicious activity detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      return res.status(400).json({
        success: false,
        message: 'Actividad sospechosa detectada'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Attack detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware de logging de seguridad
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log solo para operaciones sensibles o errores
    if (req.path.includes('/auth') || 
        req.path.includes('/admin') || 
        res.statusCode >= 400) {
      
      logger.info('Security event:', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'anonymous'
      });
    }
  });
  
  next();
};

// Middleware de validación de CSRF
export const csrfProtection = (req, res, next) => {
  // Verificar token CSRF para operaciones que modifican datos
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      logger.warn('CSRF token validation failed:', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Token CSRF inválido'
      });
    }
  }
  
  next();
};

export default {
  createRateLimit,
  authRateLimit,
  publicApiRateLimit,
  sensitiveOperationRateLimit,
  enhancedHelmet,
  validateInput,
  commonValidations,
  sanitizeInput,
  encryptSensitiveData,
  decryptSensitiveData,
  validateFileUpload,
  detectAttacks,
  securityLogger,
  csrfProtection
};
