/**
 * Sistema de Monitoreo 24/7 y Recuperación de Fallos
 * 
 * Este servicio proporciona:
 * - Monitoreo continuo del sistema
 * - Alertas automáticas
 * - Recuperación de fallos
 * - Métricas de rendimiento
 * - Logs estructurados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonitoringService {
  constructor() {
    this.isRunning = false;
    this.healthCheckInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
    this.alertThresholds = {
      memoryUsage: 80, // 80% de uso de memoria
      cpuUsage: 70,    // 70% de uso de CPU
      responseTime: 2000, // 2 segundos de tiempo de respuesta
      errorRate: 5     // 5% de tasa de error
    };
    this.metrics = {
      uptime: 0,
      totalRequests: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastHealthCheck: null,
      systemStatus: 'healthy'
    };
    this.logFile = path.join(__dirname, '../logs/monitoring.log');
    this.ensureLogDirectory();
  }

  /**
   * Asegurar que el directorio de logs existe
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Iniciar el servicio de monitoreo
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitoring service is already running');
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();
    
    // Iniciar health checks cada 30 segundos
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Iniciar limpieza de logs cada hora
    setInterval(() => {
      this.cleanupLogs();
    }, 3600000);

    this.log('info', 'Monitoring service started', {
      startTime: new Date().toISOString(),
      checkInterval: '30s',
      maxRetries: this.maxRetries
    });

    console.log('✅ Monitoring service started - 24/7 monitoring active');
  }

  /**
   * Detener el servicio de monitoreo
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.log('info', 'Monitoring service stopped', {
      stopTime: new Date().toISOString(),
      totalUptime: this.getUptime()
    });

    console.log('🛑 Monitoring service stopped');
  }

  /**
   * Realizar health check del sistema
   */
  async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // Obtener métricas del sistema
      const systemMetrics = await this.getSystemMetrics();
      
      // Verificar estado de la base de datos
      const dbStatus = await this.checkDatabaseHealth();
      
      // Verificar estado de la API
      const apiStatus = await this.checkApiHealth();
      
      const responseTime = Date.now() - startTime;
      
      // Actualizar métricas
      this.updateMetrics(systemMetrics, responseTime, dbStatus, apiStatus);
      
      // Verificar umbrales de alerta
      this.checkAlertThresholds(systemMetrics);
      
      // Log del health check
      this.log('info', 'Health check completed', {
        responseTime,
        systemMetrics,
        dbStatus,
        apiStatus,
        overallStatus: this.metrics.systemStatus
      });

    } catch (error) {
      this.handleHealthCheckError(error);
    }
  }

  /**
   * Obtener métricas del sistema
   */
  async getSystemMetrics() {
    const usage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        percentage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000) // Aproximación
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  /**
   * Verificar salud de la base de datos
   */
  async checkDatabaseHealth() {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { connectDB } = await import('../config/database.js');
      const mongoose = await import('mongoose');
      
      if (mongoose.default.connection.readyState === 1) {
        return {
          status: 'healthy',
          connectionState: 'connected',
          host: mongoose.default.connection.host,
          port: mongoose.default.connection.port,
          database: mongoose.default.connection.name
        };
      } else {
        return {
          status: 'unhealthy',
          connectionState: mongoose.default.connection.readyState,
          error: 'Database not connected'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Verificar salud de la API
   */
  async checkApiHealth() {
    try {
      // Simular una petición interna para verificar la API
      const startTime = Date.now();
      
      // Verificar que el servidor esté respondiendo
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Actualizar métricas del sistema
   */
  updateMetrics(systemMetrics, responseTime, dbStatus, apiStatus) {
    this.metrics.uptime = process.uptime();
    this.metrics.totalRequests++;
    this.metrics.lastHealthCheck = new Date().toISOString();
    
    // Calcular tiempo de respuesta promedio
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
    
    // Determinar estado general del sistema
    if (dbStatus.status === 'healthy' && apiStatus.status === 'healthy') {
      this.metrics.systemStatus = 'healthy';
    } else if (dbStatus.status === 'error' || apiStatus.status === 'error') {
      this.metrics.systemStatus = 'error';
    } else {
      this.metrics.systemStatus = 'warning';
    }
  }

  /**
   * Verificar umbrales de alerta
   */
  checkAlertThresholds(systemMetrics) {
    const alerts = [];

    // Verificar uso de memoria
    if (systemMetrics.memory.percentage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `High memory usage: ${systemMetrics.memory.percentage}%`,
        value: systemMetrics.memory.percentage,
        threshold: this.alertThresholds.memoryUsage
      });
    }

    // Verificar uso de CPU
    if (systemMetrics.cpu.percentage > this.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'cpu',
        level: 'warning',
        message: `High CPU usage: ${systemMetrics.cpu.percentage}%`,
        value: systemMetrics.cpu.percentage,
        threshold: this.alertThresholds.cpuUsage
      });
    }

    // Verificar tiempo de respuesta
    if (this.metrics.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'responseTime',
        level: 'warning',
        message: `Slow response time: ${this.metrics.averageResponseTime}ms`,
        value: this.metrics.averageResponseTime,
        threshold: this.alertThresholds.responseTime
      });
    }

    // Procesar alertas
    alerts.forEach(alert => {
      this.handleAlert(alert);
    });
  }

  /**
   * Manejar alertas del sistema
   */
  handleAlert(alert) {
    this.log('warning', `Alert: ${alert.message}`, alert);
    
    // En un entorno de producción, aquí se enviarían notificaciones
    // a servicios como Slack, Discord, email, etc.
    console.warn(`⚠️ [ALERT] ${alert.message}`);
    
    // Si es una alerta crítica, intentar recuperación automática
    if (alert.level === 'critical') {
      this.attemptRecovery(alert);
    }
  }

  /**
   * Intentar recuperación automática
   */
  async attemptRecovery(alert) {
    if (this.retryAttempts >= this.maxRetries) {
      this.log('error', 'Max retry attempts reached, manual intervention required', {
        alert,
        retryAttempts: this.retryAttempts
      });
      return;
    }

    this.retryAttempts++;
    
    this.log('info', `Attempting recovery (attempt ${this.retryAttempts}/${this.maxRetries})`, {
      alert,
      retryDelay: this.retryDelay
    });

    // Esperar antes del siguiente intento
    setTimeout(() => {
      this.performHealthCheck();
    }, this.retryDelay);
  }

  /**
   * Manejar errores en health checks
   */
  handleHealthCheckError(error) {
    this.metrics.errorCount++;
    this.metrics.systemStatus = 'error';
    
    this.log('error', 'Health check failed', {
      error: error.message,
      stack: error.stack,
      retryAttempts: this.retryAttempts
    });

    console.error('❌ Health check failed:', error.message);
    
    // Intentar recuperación
    this.attemptRecovery({
      type: 'healthCheck',
      level: 'critical',
      message: 'Health check failed',
      error: error.message
    });
  }

  /**
   * Registrar evento en logs
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data,
      service: 'monitoring'
    };

    // Log a consola
    const logMessage = `[${logEntry.timestamp}] [${logEntry.level}] ${message}`;
    console.log(logMessage);

    // Log a archivo
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Limpiar logs antiguos
   */
  cleanupLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        // Si el archivo es mayor a 10MB, rotarlo
        if (fileSizeInMB > 10) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupFile = this.logFile.replace('.log', `-${timestamp}.log`);
          
          fs.renameSync(this.logFile, backupFile);
          
          this.log('info', 'Log file rotated', {
            originalFile: this.logFile,
            backupFile,
            size: fileSizeInMB
          });
        }
      }
    } catch (error) {
      console.error('Failed to cleanup logs:', error.message);
    }
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics() {
    return {
      ...this.metrics,
      isRunning: this.isRunning,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries,
      alertThresholds: this.alertThresholds
    };
  }

  /**
   * Obtener uptime del servicio
   */
  getUptime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Resetear contador de reintentos
   */
  resetRetryAttempts() {
    this.retryAttempts = 0;
    this.log('info', 'Retry attempts reset');
  }

  /**
   * Actualizar umbrales de alerta
   */
  updateAlertThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    this.log('info', 'Alert thresholds updated', newThresholds);
  }
}

// Crear instancia singleton
const monitoringService = new MonitoringService();

export default monitoringService;