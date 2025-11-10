import monitoringService from '../services/monitoring.service.js';
import { logger } from '../utils/logger.js';

// Middleware para verificación de salud en cada request
export const healthCheckMiddleware = async (req, res, next) => {
  try {
    // Solo verificar en rutas críticas
    const criticalRoutes = ['/api/events', '/api/auth', '/api/payments'];
    const isCriticalRoute = criticalRoutes.some(route => req.path.startsWith(route));
    
    if (!isCriticalRoute) {
      return next();
    }

    const metrics = monitoringService.getMetrics();
    
    // Si el sistema está marcado como no saludable, devolver error
    if (metrics.status === 'unhealthy') {
      logger.warn(`Health check failed for route: ${req.path}`);
      return res.status(503).json({
        success: false,
        message: 'Servicio temporalmente no disponible',
        status: 'unhealthy',
        retryAfter: 30 // segundos
      });
    }

    // Si el sistema está degradado, agregar headers de advertencia
    if (metrics.status === 'degraded') {
      res.set('X-System-Status', 'degraded');
      res.set('X-System-Warning', 'Algunos servicios pueden estar experimentando problemas');
    }

    // Agregar headers de información del sistema
    res.set('X-System-Status', metrics.status);
    res.set('X-Response-Time', metrics.responseTime.toString());
    res.set('X-Memory-Usage', metrics.memoryUsage.percentage.toString());

    next();
  } catch (error) {
    logger.error('Error in health check middleware:', error);
    next(); // Continuar con el request aunque falle el health check
  }
};

// Middleware para verificación de disponibilidad 24/7
export const availabilityCheckMiddleware = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();
  
  // Verificar si estamos en horario de mantenimiento (2-4 AM)
  if (hour >= 2 && hour < 4) {
    // Verificar si hay mantenimiento programado
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    if (maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: 'Sistema en mantenimiento programado',
        maintenance: {
          startTime: '02:00',
          endTime: '04:00',
          estimatedCompletion: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
        }
      });
    }
  }

  next();
};

// Middleware para logging de disponibilidad
export const availabilityLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const status = res.statusCode;
    
    // Log solo para errores del servidor
    if (status >= 500) {
      logger.error(`Server error on ${req.method} ${req.path}: ${status} (${responseTime}ms)`);
    }
    
    // Log para requests lentos
    if (responseTime > 5000) {
      logger.warn(`Slow request: ${req.method} ${req.path} (${responseTime}ms)`);
    }
  });

  next();
};

// Middleware para verificación de recursos del sistema
export const resourceCheckMiddleware = (req, res, next) => {
  const memoryUsage = process.memoryUsage();
  const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  // Si el uso de memoria es muy alto, rechazar requests no críticos
  if (memoryPercentage > 95) {
    const criticalRoutes = ['/api/auth/login', '/api/health'];
    const isCriticalRoute = criticalRoutes.some(route => req.path.startsWith(route));
    
    if (!isCriticalRoute) {
      return res.status(503).json({
        success: false,
        message: 'Sistema temporalmente sobrecargado',
        retryAfter: 60
      });
    }
  }

  next();
};
