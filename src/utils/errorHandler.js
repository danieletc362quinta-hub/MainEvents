import { logger } from './logger.js';

// Clase base para errores personalizados
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Error operacional vs error de programación
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
export class ValidationError extends AppError {
  constructor(message = 'Error de validación', details = null) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes') {
    super(message, 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Error de base de datos') {
    super(message, 500);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with structured data
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
    errorType: err.constructor.name,
    statusCode: err.statusCode || 500,
  };

  // Log based on error type
  if (err.statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  } else {
    logger.info('Application Error', errorLog);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `El campo ${field} ya existe`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(val => val.message);
    const message = 'Error de validación';
    error = new ValidationError(message, details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AuthenticationError(message);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    const message = 'Error de validación de datos';
    error = new ValidationError(message, details);
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = new RateLimitError('Demasiadas solicitudes, intente más tarde');
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    error = new DatabaseError('Error de conexión con la base de datos');
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  // Response structure
  const response = {
    success: false,
    error: message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      errorType: err.constructor.name,
      timestamp: new Date().toISOString()
    })
  };

  // Add retry-after header for rate limiting
  if (statusCode === 429) {
    res.set('Retry-After', '60');
  }

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error boundary for unhandled errors
export const setupErrorHandling = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Rejection', {
      message: err.message,
      stack: err.stack,
      promise: promise,
      timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => ({
      field: error.path?.join('.') || 'unknown',
      message: error.message,
      value: error.value
    }));
  }
  
  if (typeof errors === 'object') {
    return Object.keys(errors).map(key => ({
      field: key,
      message: errors[key].message,
      value: errors[key].value
    }));
  }
  
  return [{ field: 'unknown', message: 'Error de validación desconocido' }];
}; 