/**
 * Middleware de Auditoría Mejorado
 * Registra todas las operaciones relevantes de los usuarios en la base de datos
 */

import Audit from '../models/audit.model.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware para registrar operaciones de auditoría
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.includeActions - Acciones a incluir en la auditoría
 * @param {Array} options.excludeActions - Acciones a excluir de la auditoría
 * @param {Boolean} options.includeBody - Si incluir el cuerpo de la petición
 * @param {Boolean} options.includeHeaders - Si incluir los headers
 * @param {Number} options.maxBodySize - Tamaño máximo del cuerpo a registrar
 */
export const auditMiddleware = (options = {}) => {
  const {
    includeActions = ['*'], // Por defecto incluir todas las acciones
    excludeActions = [],
    includeBody = false,
    includeHeaders = false,
    maxBodySize = 1000 // 1KB máximo
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Agregar ID de petición para rastreo
    req.requestId = requestId;
    
    // Determinar si esta acción debe ser auditada
    const action = getActionFromRoute(req.method, req.route?.path || req.path);
    const shouldAudit = shouldAuditAction(action, includeActions, excludeActions);
    
    if (!shouldAudit) {
      return next();
    }

    // Capturar datos de la petición
    const auditData = {
      requestId,
      action,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      userId: req.user?.id || null,
      sessionId: req.sessionID || null,
      headers: includeHeaders ? sanitizeHeaders(req.headers) : {},
      body: includeBody ? sanitizeBody(req.body, maxBodySize) : {},
      timestamp: new Date(),
      severity: determineSeverity(action, req),
      metadata: {
        correlationId: req.get('X-Correlation-ID') || uuidv4(),
        referer: req.get('Referer'),
        origin: req.get('Origin'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        acceptLanguage: req.get('Accept-Language'),
        acceptEncoding: req.get('Accept-Encoding')
      }
    };

    // Interceptar la respuesta para capturar el código de estado
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      captureResponseData(this, auditData, startTime);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      captureResponseData(this, auditData, startTime);
      return originalJson.call(this, data);
    };

    // Manejar errores
    const originalNext = next;
    next = function(error) {
      if (error) {
        captureErrorData(auditData, error, startTime);
        logAuditEvent(auditData);
      }
      return originalNext.call(this, error);
    };

    // Continuar con el siguiente middleware
    next();
  };
};

/**
 * Captura datos de la respuesta
 */
function captureResponseData(res, auditData, startTime) {
  auditData.statusCode = res.statusCode;
  auditData.responseTime = Date.now() - startTime;
  auditData.success = res.statusCode < 400;
  auditData.responseSize = res.get('Content-Length') || 0;
  
  // Log del evento de auditoría
  logAuditEvent(auditData);
}

/**
 * Captura datos de error
 */
function captureErrorData(auditData, error, startTime) {
  auditData.statusCode = error.status || 500;
  auditData.responseTime = Date.now() - startTime;
  auditData.success = false;
  auditData.errorMessage = error.message;
  auditData.errorStack = error.stack;
  auditData.severity = 'HIGH';
}

/**
 * Determina la acción basada en la ruta y método HTTP
 */
function getActionFromRoute(method, path) {
  const routeMap = {
    'POST': {
      '/api/register': 'USER_REGISTER',
      '/api/login': 'USER_LOGIN',
      '/api/events': 'EVENT_CREATE',
      '/api/payments': 'PAYMENT_CREATE',
      '/api/tickets': 'TICKET_PURCHASE',
      '/api/coupons': 'COUPON_CREATE'
    },
    'PUT': {
      '/api/events': 'EVENT_UPDATE',
      '/api/users': 'USER_UPDATE',
      '/api/tickets': 'TICKET_UPDATE'
    },
    'DELETE': {
      '/api/events': 'EVENT_DELETE',
      '/api/users': 'USER_DELETE',
      '/api/tickets': 'TICKET_CANCEL'
    },
    'GET': {
      '/api/events': 'EVENT_VIEW',
      '/api/users': 'USER_VIEW',
      '/api/dashboard': 'DASHBOARD_ACCESS',
      '/api/payments': 'PAYMENT_VIEW'
    }
  };

  // Buscar coincidencia exacta
  if (routeMap[method] && routeMap[method][path]) {
    return routeMap[method][path];
  }

  // Buscar coincidencia por patrón
  for (const [route, action] of Object.entries(routeMap[method] || {})) {
    if (path.startsWith(route)) {
      return action;
    }
  }

  // Acción genérica basada en el método
  const genericActions = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': 'VIEW',
    'PATCH': 'UPDATE'
  };

  return genericActions[method] || 'UNKNOWN';
}

/**
 * Determina si una acción debe ser auditada
 */
function shouldAuditAction(action, includeActions, excludeActions) {
  // Si hay exclusiones específicas, verificar primero
  if (excludeActions.includes(action) || excludeActions.includes('*')) {
    return false;
  }

  // Si se incluyen todas las acciones
  if (includeActions.includes('*')) {
    return true;
  }

  // Verificar si la acción está en la lista de inclusión
  return includeActions.includes(action);
}

/**
 * Determina la severidad del evento
 */
function determineSeverity(action, req) {
  const highSeverityActions = [
    'USER_LOGIN', 'USER_REGISTER', 'USER_DELETE',
    'PAYMENT_CREATE', 'PAYMENT_REFUND',
    'EVENT_DELETE', 'TICKET_CANCEL'
  ];

  const mediumSeverityActions = [
    'EVENT_CREATE', 'EVENT_UPDATE',
    'USER_UPDATE', 'TICKET_PURCHASE',
    'DASHBOARD_ACCESS'
  ];

  if (highSeverityActions.includes(action)) {
    return 'HIGH';
  }

  if (mediumSeverityActions.includes(action)) {
    return 'MEDIUM';
  }

  // Verificar si es una operación de administración
  if (req.user?.role === 'admin' || req.path.includes('/admin')) {
    return 'HIGH';
  }

  return 'LOW';
}

/**
 * Obtiene la IP del cliente
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown';
}

/**
 * Sanitiza headers sensibles
 */
function sanitizeHeaders(headers) {
  const sensitiveHeaders = [
    'authorization', 'cookie', 'x-api-key', 'x-auth-token',
    'x-csrf-token', 'x-session-id', 'x-access-token'
  ];

  const sanitized = { ...headers };
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitiza el cuerpo de la petición
 */
function sanitizeBody(body, maxSize) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth',
    'creditCard', 'cvv', 'ssn', 'socialSecurity'
  ];

  const sanitized = { ...body };
  
  // Sanitizar campos sensibles
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Limitar tamaño
  const bodyString = JSON.stringify(sanitized);
  if (bodyString.length > maxSize) {
    return {
      ...sanitized,
      _truncated: true,
      _originalSize: bodyString.length
    };
  }

  return sanitized;
}

/**
 * Registra el evento de auditoría en la base de datos
 */
async function logAuditEvent(auditData) {
  try {
    // Crear registro de auditoría
    const auditRecord = new Audit({
      user: auditData.userId,
      action: auditData.action,
      resource: getResourceFromAction(auditData.action),
      resourceId: auditData.params.id || auditData.body.id || null,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      httpMethod: auditData.method,
      url: auditData.url,
      statusCode: auditData.statusCode,
      responseTime: auditData.responseTime,
      success: auditData.success,
      errorMessage: auditData.errorMessage,
      errorStack: auditData.errorStack,
      severity: auditData.severity,
      metadata: {
        requestId: auditData.requestId,
        sessionId: auditData.sessionId,
        correlationId: auditData.metadata.correlationId,
        tags: [auditData.action, auditData.method],
        notes: `Request processed in ${auditData.responseTime}ms`
      },
      before: null, // Se puede implementar para operaciones de actualización
      after: auditData.body,
      changes: [] // Se puede implementar para operaciones de actualización
    });

    await auditRecord.save();
    
    // Log adicional para debugging
    console.log(`📝 Audit logged: ${auditData.action} - ${auditData.statusCode} - ${auditData.responseTime}ms`);
    
  } catch (error) {
    console.error('❌ Error logging audit event:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Obtiene el recurso basado en la acción
 */
function getResourceFromAction(action) {
  const resourceMap = {
    'USER_REGISTER': 'USER',
    'USER_LOGIN': 'USER',
    'USER_UPDATE': 'USER',
    'USER_DELETE': 'USER',
    'EVENT_CREATE': 'EVENT',
    'EVENT_UPDATE': 'EVENT',
    'EVENT_DELETE': 'EVENT',
    'EVENT_VIEW': 'EVENT',
    'PAYMENT_CREATE': 'PAYMENT',
    'PAYMENT_REFUND': 'PAYMENT',
    'TICKET_PURCHASE': 'TICKET',
    'TICKET_CANCEL': 'TICKET',
    'TICKET_UPDATE': 'TICKET',
    'COUPON_CREATE': 'COUPON',
    'DASHBOARD_ACCESS': 'SYSTEM'
  };

  return resourceMap[action] || 'SYSTEM';
}

/**
 * Middleware específico para operaciones críticas
 */
export const criticalAuditMiddleware = auditMiddleware({
  includeActions: ['USER_LOGIN', 'USER_REGISTER', 'PAYMENT_CREATE', 'EVENT_DELETE'],
  includeBody: true,
  includeHeaders: true
});

/**
 * Middleware para operaciones de sistema
 */
export const systemAuditMiddleware = auditMiddleware({
  includeActions: ['DASHBOARD_ACCESS', 'SYSTEM_CONFIG', 'BACKUP_CREATE'],
  includeBody: false,
  includeHeaders: false
});

/**
 * Middleware para operaciones de usuario
 */
export const userAuditMiddleware = auditMiddleware({
  includeActions: ['USER_*', 'EVENT_*', 'TICKET_*'],
  excludeActions: ['USER_VIEW', 'EVENT_VIEW'],
  includeBody: true,
  includeHeaders: false
});

export default auditMiddleware;
