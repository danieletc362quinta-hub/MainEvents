import { config } from '../config.js';

// Configuración de niveles de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Configuración de colores para consola
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',  // Reset
};

// Configuración de emojis
const EMOJIS = {
  ERROR: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍',
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[config.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;
    this.isDevelopment = config.NODE_ENV === 'development';
  }

  // Método base para logging
  _log(level, message, data = null) {
    if (LOG_LEVELS[level] > this.level) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
      environment: config.NODE_ENV,
      pid: process.pid,
    };

    // Formato para consola en desarrollo
    if (this.isDevelopment) {
      const color = COLORS[level];
      const emoji = EMOJIS[level];
      const reset = COLORS.RESET;
      
      console.log(
        `${color}${emoji} [${level}] ${timestamp}${reset}`,
        `${color}${message}${reset}`,
        data ? `\n${color}Data:${reset} ${JSON.stringify(data, null, 2)}` : ''
      );
    } else {
      // Formato JSON para producción
      console.log(JSON.stringify(logEntry));
    }

    // Aquí podrías agregar logging a archivos o servicios externos
    this._writeToFile(logEntry);
  }

  // Escribir a archivo (implementación básica)
  _writeToFile(logEntry) {
    // En producción, podrías usar winston, pino, o similar
    // Por ahora, solo simulamos la escritura
    if (config.NODE_ENV === 'production') {
      // Implementar rotación de logs aquí
      // fs.appendFileSync(`logs/${logEntry.level}.log`, JSON.stringify(logEntry) + '\n');
    }
  }

  // Métodos de logging por nivel
  error(message, data = null) {
    this._log('ERROR', message, data);
  }

  warn(message, data = null) {
    this._log('WARN', message, data);
  }

  info(message, data = null) {
    this._log('INFO', message, data);
  }

  debug(message, data = null) {
    this._log('DEBUG', message, data);
  }

  // Logging específico para HTTP requests
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        contentLength: res.get('Content-Length') || 0,
      };

      if (res.statusCode >= 400) {
        this.warn(`HTTP ${req.method} ${req.originalUrl}`, logData);
      } else {
        this.info(`HTTP ${req.method} ${req.originalUrl}`, logData);
      }
    });

    next();
  }

  // Logging específico para base de datos
  logDatabase(operation, collection, duration, success = true, error = null) {
    const message = `DB ${operation} on ${collection}`;
    const data = {
      operation,
      collection,
      duration: `${duration}ms`,
      success,
      ...(error && { error: error.message })
    };

    if (success) {
      this.debug(message, data);
    } else {
      this.error(message, data);
    }
  }

  // Logging específico para autenticación
  logAuth(action, userId, success = true, details = null) {
    const message = `Auth ${action}`;
    const data = {
      action,
      userId,
      success,
      ...(details && { details })
    };

    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }

  // Logging específico para eventos
  logEvent(eventType, eventId, userId, details = null) {
    const message = `Event ${eventType}`;
    const data = {
      eventType,
      eventId,
      userId,
      ...(details && { details })
    };

    this.info(message, data);
  }

  // Logging específico para pagos
  logPayment(operation, paymentId, userId, amount, success = true, error = null) {
    const message = `Payment ${operation}`;
    const data = {
      operation,
      paymentId,
      userId,
      amount,
      success,
      ...(error && { error: error.message })
    };

    if (success) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  // Logging específico para performance
  logPerformance(operation, duration, metadata = null) {
    const message = `Performance ${operation}`;
    const data = {
      operation,
      duration: `${duration}ms`,
      ...(metadata && { metadata })
    };

    if (duration > 1000) {
      this.warn(message, data);
    } else {
      this.debug(message, data);
    }
  }

  // Logging específico para errores de validación
  logValidation(field, value, rule, message) {
    const logData = {
      field,
      value: typeof value === 'string' ? value.substring(0, 100) : value,
      rule,
      message
    };

    this.warn('Validation Error', logData);
  }

  // Logging específico para rate limiting
  logRateLimit(ip, endpoint, limit, windowMs) {
    const data = {
      ip,
      endpoint,
      limit,
      windowMs
    };

    this.warn('Rate Limit Exceeded', data);
  }

  // Logging específico para seguridad
  logSecurity(event, ip, userId = null, details = null) {
    const message = `Security ${event}`;
    const data = {
      event,
      ip,
      userId,
      ...(details && { details })
    };

    this.warn(message, data);
  }

  // Método para logging de métricas
  logMetrics(metrics) {
    const data = {
      timestamp: new Date().toISOString(),
      ...metrics
    };

    this.info('Application Metrics', data);
  }

  // Método para logging de health checks
  logHealth(component, status, details = null) {
    const message = `Health Check ${component}`;
    const data = {
      component,
      status,
      ...(details && { details })
    };

    if (status === 'healthy') {
      this.debug(message, data);
    } else {
      this.warn(message, data);
    }
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Middleware para logging de requests
export const requestLogger = (req, res, next) => {
  logger.logRequest(req, res, next);
};

// Función para logging de errores no manejados
export const logUnhandledError = (error, context = {}) => {
  logger.error('Unhandled Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Función para logging de métricas del sistema
export const logSystemMetrics = () => {
  const metrics = {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    pid: process.pid,
  };

  logger.logMetrics(metrics);
}; 