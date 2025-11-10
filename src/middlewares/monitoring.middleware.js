/**
 * Middleware de Monitoreo para Express
 * 
 * Este middleware proporciona:
 * - Monitoreo de requests en tiempo real
 * - Métricas de rendimiento
 * - Detección de errores
 * - Logs estructurados
 */

import monitoringService from '../services/monitoring.service.js';

class MonitoringMiddleware {
  constructor() {
    this.requestCounts = new Map();
    this.responseTimes = [];
    this.errorCounts = new Map();
    this.maxResponseTimeHistory = 100; // Mantener solo los últimos 100 tiempos
  }

  /**
   * Middleware principal de monitoreo
   */
  monitor() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      // Agregar request ID a la request
      req.requestId = requestId;
      
      // Incrementar contador de requests
      this.incrementRequestCount(req.method, req.path);
      
      // Interceptar el evento 'finish' para medir tiempo de respuesta
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // Registrar métricas
        this.recordResponseTime(responseTime);
        this.recordStatusCode(statusCode);
        
        // Log de la request
        this.logRequest(req, res, responseTime);
        
        // Verificar si es un error
        if (statusCode >= 400) {
          this.recordError(req, res, statusCode);
        }
      });

      // Interceptar errores no manejados
      res.on('error', (error) => {
        this.recordError(req, res, 500, error);
      });

      next();
    };
  }

  /**
   * Middleware de health check
   */
  healthCheck() {
    return (req, res, next) => {
      if (req.path === '/health' || req.path === '/api/health') {
        const metrics = monitoringService.getMetrics();
        const systemMetrics = this.getSystemMetrics();
        
        const healthData = {
          status: metrics.systemStatus,
          timestamp: new Date().toISOString(),
          uptime: metrics.uptime,
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          metrics: {
            ...metrics,
            ...systemMetrics
          }
        };

        // Determinar código de estado HTTP
        let statusCode = 200;
        if (metrics.systemStatus === 'error') {
          statusCode = 503; // Service Unavailable
        } else if (metrics.systemStatus === 'warning') {
          statusCode = 200; // OK pero con advertencias
        }

        res.status(statusCode).json(healthData);
        return;
      }
      
      next();
    };
  }

  /**
   * Middleware de métricas en tiempo real
   */
  metrics() {
    return (req, res, next) => {
      if (req.path === '/metrics' || req.path === '/api/metrics') {
        const metrics = this.getAllMetrics();
        res.json(metrics);
        return;
      }
      
      next();
    };
  }

  /**
   * Generar ID único para cada request
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Incrementar contador de requests por método y ruta
   */
  incrementRequestCount(method, path) {
    const key = `${method} ${path}`;
    const current = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, current + 1);
  }

  /**
   * Registrar tiempo de respuesta
   */
  recordResponseTime(responseTime) {
    this.responseTimes.push(responseTime);
    
    // Mantener solo los últimos N tiempos
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }
  }

  /**
   * Registrar código de estado
   */
  recordStatusCode(statusCode) {
    const key = `status_${statusCode}`;
    const current = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, current + 1);
  }

  /**
   * Registrar error
   */
  recordError(req, res, statusCode, error = null) {
    const errorData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    };

    // Log del error
    monitoringService.log('error', `Request error: ${req.method} ${req.path}`, errorData);
    
    // Incrementar contador de errores
    const key = `error_${statusCode}`;
    const current = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, current + 1);
  }

  /**
   * Log de request
   */
  logRequest(req, res, responseTime) {
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    };

    // Solo log requests con errores o tiempos altos en producción
    if (process.env.NODE_ENV === 'production') {
      if (res.statusCode >= 400 || responseTime > 1000) {
        monitoringService.log('info', `Request: ${req.method} ${req.path}`, logData);
      }
    } else {
      // En desarrollo, log todas las requests
      monitoringService.log('info', `Request: ${req.method} ${req.path}`, logData);
    }
  }

  /**
   * Obtener métricas del sistema
   */
  getSystemMetrics() {
    const usage = process.memoryUsage();
    
    return {
      memory: {
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
      },
      requests: {
        total: Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0),
        byMethod: Object.fromEntries(this.requestCounts),
        averageResponseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate()
      },
      errors: Object.fromEntries(this.errorCounts)
    };
  }

  /**
   * Obtener todas las métricas
   */
  getAllMetrics() {
    return {
      ...monitoringService.getMetrics(),
      ...this.getSystemMetrics(),
      requestCounts: Object.fromEntries(this.requestCounts),
      errorCounts: Object.fromEntries(this.errorCounts),
      responseTimes: {
        current: this.responseTimes,
        average: this.getAverageResponseTime(),
        min: Math.min(...this.responseTimes),
        max: Math.max(...this.responseTimes)
      }
    };
  }

  /**
   * Calcular tiempo de respuesta promedio
   */
  getAverageResponseTime() {
    if (this.responseTimes.length === 0) return 0;
    return Math.round(
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    );
  }

  /**
   * Calcular tasa de error
   */
  getErrorRate() {
    const totalRequests = Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0);
    const totalErrors = Array.from(this.errorCounts.entries())
      .filter(([key]) => key.startsWith('error_') || key.startsWith('status_4') || key.startsWith('status_5'))
      .reduce((sum, [, count]) => sum + count, 0);
    
    if (totalRequests === 0) return 0;
    return Math.round((totalErrors / totalRequests) * 100);
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.requestCounts.clear();
    this.responseTimes.length = 0;
    this.errorCounts.clear();
    monitoringService.log('info', 'Metrics reset');
  }

  /**
   * Obtener estadísticas de requests por ruta
   */
  getRequestStats() {
    const stats = {};
    
    for (const [key, count] of this.requestCounts) {
      const [method, path] = key.split(' ');
      if (!stats[path]) {
        stats[path] = {};
      }
      stats[path][method] = count;
    }
    
    return stats;
  }
}

// Crear instancia singleton
const monitoringMiddleware = new MonitoringMiddleware();

export default monitoringMiddleware;

