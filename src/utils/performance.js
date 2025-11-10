import { logger } from './logger.js';

// Clase para monitoreo de rendimiento
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.activeTimers = new Map();
  }

  // Iniciar medición de tiempo
  startTimer(name, metadata = {}) {
    const timerId = `${name}_${Date.now()}_${Math.random()}`;
    this.activeTimers.set(timerId, {
      name,
      startTime: process.hrtime.bigint(),
      metadata
    });
    return timerId;
  }

  // Finalizar medición de tiempo
  endTimer(timerId) {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      logger.warn(`Timer ${timerId} not found`);
      return null;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - timer.startTime) / 1000000; // Convertir a milisegundos

    // Guardar métrica
    if (!this.metrics.has(timer.name)) {
      this.metrics.set(timer.name, []);
    }
    
    const metric = {
      duration,
      timestamp: new Date(),
      metadata: timer.metadata
    };
    
    this.metrics.get(timer.name).push(metric);
    this.activeTimers.delete(timerId);

    // Log de rendimiento si es lento
    if (duration > 1000) { // Más de 1 segundo
      logger.warn('Slow operation detected', {
        operation: timer.name,
        duration: `${duration.toFixed(2)}ms`,
        metadata: timer.metadata
      });
    }

    return metric;
  }

  // Obtener estadísticas de una operación
  getStats(operationName) {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const sorted = durations.sort((a, b) => a - b);

    return {
      count: metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // Obtener todas las estadísticas
  getAllStats() {
    const stats = {};
    for (const [operationName] of this.metrics) {
      stats[operationName] = this.getStats(operationName);
    }
    return stats;
  }

  // Limpiar métricas antiguas (más de 1 hora)
  cleanOldMetrics() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [operationName, metrics] of this.metrics) {
      const filtered = metrics.filter(m => m.timestamp > oneHourAgo);
      if (filtered.length === 0) {
        this.metrics.delete(operationName);
      } else {
        this.metrics.set(operationName, filtered);
      }
    }
  }

  // Middleware para medir tiempo de respuesta de rutas
  measureRoute(routeName) {
    return (req, res, next) => {
      const timerId = this.startTimer(`route_${routeName}`, {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      res.on('finish', () => {
        this.endTimer(timerId);
      });

      next();
    };
  }

  // Medir operaciones de base de datos
  measureDatabase(operationName) {
    return async (operation) => {
      const timerId = this.startTimer(`db_${operationName}`, {
        operation: operationName
      });

      try {
        const result = await operation();
        this.endTimer(timerId);
        return result;
      } catch (error) {
        this.endTimer(timerId);
        throw error;
      }
    };
  }

  // Medir operaciones de API externa
  measureExternalAPI(apiName) {
    return async (apiCall) => {
      const timerId = this.startTimer(`api_${apiName}`, {
        api: apiName
      });

      try {
        const result = await apiCall();
        this.endTimer(timerId);
        return result;
      } catch (error) {
        this.endTimer(timerId);
        throw error;
      }
    };
  }
}

// Instancia singleton
const performanceMonitor = new PerformanceMonitor();

// Limpiar métricas cada hora
setInterval(() => {
  performanceMonitor.cleanOldMetrics();
}, 60 * 60 * 1000);

// Funciones de utilidad
export const startTimer = (name, metadata) => performanceMonitor.startTimer(name, metadata);
export const endTimer = (timerId) => performanceMonitor.endTimer(timerId);
export const getStats = (operationName) => performanceMonitor.getStats(operationName);
export const getAllStats = () => performanceMonitor.getAllStats();
export const measureRoute = (routeName) => performanceMonitor.measureRoute(routeName);
export const measureDatabase = (operationName) => performanceMonitor.measureDatabase(operationName);
export const measureExternalAPI = (apiName) => performanceMonitor.measureExternalAPI(apiName);

// Middleware para medir memoria
export const memoryMiddleware = (req, res, next) => {
  const memBefore = process.memoryUsage();
  
  res.on('finish', () => {
    const memAfter = process.memoryUsage();
    const memDiff = {
      rss: memAfter.rss - memBefore.rss,
      heapUsed: memAfter.heapUsed - memBefore.heapUsed,
      heapTotal: memAfter.heapTotal - memBefore.heapTotal,
      external: memAfter.external - memBefore.external
    };

    // Log si hay un uso significativo de memoria
    if (memDiff.heapUsed > 10 * 1024 * 1024) { // Más de 10MB
      logger.warn('High memory usage detected', {
        url: req.originalUrl,
        method: req.method,
        memoryDiff: memDiff
      });
    }
  });

  next();
};

// Función para obtener estadísticas del sistema
export const getSystemStats = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) // MB
    },
    cpu: {
      user: cpuUsage.user / 1000000, // segundos
      system: cpuUsage.system / 1000000 // segundos
    },
    uptime: process.uptime(),
    performance: performanceMonitor.getAllStats()
  };
};

export default performanceMonitor;
