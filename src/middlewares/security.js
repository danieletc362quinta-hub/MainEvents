import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// Middleware para sanitización de datos
export const sanitizeInput = (req, res, next) => {
  try {
    // Función para sanitizar strings
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    };

    // Función para sanitizar objetos recursivamente
    const sanitizeObject = (obj) => {
      if (obj === null || obj === undefined) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      
      return sanitizeString(obj);
    };

    // Sanitizar body, query y params
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Error sanitizing input:', error);
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos'
    });
  }
};

// Middleware para validación de headers de seguridad
export const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.mercadopago.com; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

// Middleware para logging de seguridad
export const securityLogging = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Interceptar respuesta para logging
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log de eventos de seguridad
    if (res.statusCode >= 400) {
      logger.warn('Security event detected', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log de requests sospechosos
    if (responseTime > 10000) { // Más de 10 segundos
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para validación de IP
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('Unauthorized IP access attempt', {
        ip: clientIP,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }
    
    next();
  };
};

// Middleware para validación de rate limiting avanzado
export const advancedRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 100,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Limpiar requests antiguos
    for (const [ip, data] of requests.entries()) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(ip);
      }
    }
    
    const clientData = requests.get(key) || { count: 0, firstRequest: now };
    
    if (now - clientData.firstRequest > windowMs) {
      clientData.count = 0;
      clientData.firstRequest = now;
    }
    
    clientData.count++;
    requests.set(key, clientData);
    
    if (clientData.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip: key,
        count: clientData.count,
        maxRequests,
        timestamp: new Date().toISOString()
      });
      
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    next();
  };
};

// Middleware para validación de datos sensibles
export const sensitiveDataProtection = (req, res, next) => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
  
  const checkSensitiveData = (obj, path = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          logger.warn('Sensitive data detected in request', {
            field: currentPath,
            ip: req.ip,
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString()
          });
        }
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkSensitiveData(obj[key], currentPath);
        }
      }
    }
  };
  
  if (req.body) {
    checkSensitiveData(req.body);
  }
  
  next();
};

// Middleware para validación de tamaño de payload
export const payloadSizeLimit = (maxSize = 1024 * 1024) => { // 1MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Payload size limit exceeded', {
        contentLength,
        maxSize,
        ip: req.ip,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      return res.status(413).json({
        success: false,
        message: 'Payload demasiado grande'
      });
    }
    
    next();
  };
};

// Middleware para validación de tipos de archivo
export const fileTypeValidation = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }
    
    const files = req.files || [req.file];
    const allowedMimeTypes = allowedTypes.length > 0 ? allowedTypes : [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];
    
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        logger.warn('Invalid file type uploaded', {
          filename: file.originalname,
          mimetype: file.mimetype,
          allowedTypes: allowedMimeTypes,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });
        
        return res.status(400).json({
          success: false,
          message: 'Tipo de archivo no permitido'
        });
      }
    }
    
    next();
  };
};

// Middleware para validación de origen de la request
export const originValidation = (allowedOrigins = []) => {
  return (req, res, next) => {
    if (allowedOrigins.length === 0) {
      return next();
    }
    
    const origin = req.get('origin') || req.get('referer');
    
    if (!origin || !allowedOrigins.some(allowed => origin.includes(allowed))) {
      logger.warn('Unauthorized origin', {
        origin,
        allowedOrigins,
        ip: req.ip,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        message: 'Origen no autorizado'
      });
    }
    
    next();
  };
};

// Función para generar token CSRF
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware para validación CSRF
export const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  const token = req.get('X-CSRF-Token') || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      success: false,
      message: 'Token CSRF inválido'
    });
  }
  
  next();
};
