import monitoringService from '../services/monitoring.service.js';
import { logger } from '../utils/logger.js';

// Obtener estado de salud del sistema
export const getHealthStatus = async (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    
    res.json({
      success: true,
      data: {
        status: metrics.status,
        uptime: metrics.uptime,
        responseTime: metrics.responseTime,
        memoryUsage: metrics.memoryUsage,
        lastCheck: metrics.lastCheck,
        isRunning: metrics.isRunning
      }
    });
  } catch (error) {
    logger.error('Error getting health status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener métricas detalladas del sistema
export const getDetailedMetrics = async (req, res) => {
  try {
    const stats = await monitoringService.getDetailedStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting detailed metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de rendimiento
export const getPerformanceStats = async (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    
    res.json({
      success: true,
      data: {
        system: {
          uptime: metrics.uptime,
          responseTime: metrics.responseTime,
          memoryUsage: metrics.memoryUsage,
          cpuUsage: metrics.cpuUsage,
          status: metrics.status,
          lastCheck: metrics.lastCheck
        },
        monitoring: {
          isRunning: metrics.isRunning,
          nextCheck: metrics.nextCheck
        }
      }
    });
  } catch (error) {
    logger.error('Error getting performance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Iniciar monitoreo
export const startMonitoring = async (req, res) => {
  try {
    monitoringService.start();
    
    logger.info('Monitoreo iniciado manualmente');
    
    res.json({
      success: true,
      message: 'Monitoreo iniciado exitosamente'
    });
  } catch (error) {
    logger.error('Error starting monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Detener monitoreo
export const stopMonitoring = async (req, res) => {
  try {
    monitoringService.stop();
    
    logger.info('Monitoreo detenido manualmente');
    
    res.json({
      success: true,
      message: 'Monitoreo detenido exitosamente'
    });
  } catch (error) {
    logger.error('Error stopping monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estado de la base de datos
export const getDatabaseStatus = async (req, res) => {
  try {
    const dbStatus = await monitoringService.checkDatabaseConnection();
    
    res.json({
      success: true,
      data: dbStatus
    });
  } catch (error) {
    logger.error('Error getting database status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estado de servicios
export const getServicesStatus = async (req, res) => {
  try {
    const servicesStatus = await monitoringService.checkServicesStatus();
    
    res.json({
      success: true,
      data: servicesStatus
    });
  } catch (error) {
    logger.error('Error getting services status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener alertas del sistema
export const getSystemAlerts = async (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    const alerts = [];

    // Verificar alertas de memoria
    if (metrics.memoryUsage.percentage > 80) {
      alerts.push({
        type: 'warning',
        message: `Alto uso de memoria: ${metrics.memoryUsage.percentage}%`,
        timestamp: new Date()
      });
    }

    // Verificar alertas de tiempo de respuesta
    if (metrics.responseTime > 3000) {
      alerts.push({
        type: 'warning',
        message: `Tiempo de respuesta lento: ${metrics.responseTime}ms`,
        timestamp: new Date()
      });
    }

    // Verificar alertas de estado del sistema
    if (metrics.status === 'unhealthy') {
      alerts.push({
        type: 'error',
        message: 'Sistema no saludable',
        timestamp: new Date()
      });
    }

    // Verificar alertas de conexión a la base de datos
    if (metrics.databaseConnections === 0) {
      alerts.push({
        type: 'error',
        message: 'Sin conexiones a la base de datos',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        lastCheck: metrics.lastCheck
      }
    });
  } catch (error) {
    logger.error('Error getting system alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de métricas (simulado)
export const getMetricsHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    // En una implementación real, esto vendría de una base de datos de métricas
    // Por ahora, simulamos datos históricos
    const history = [];
    const now = new Date();
    const interval = 5 * 60 * 1000; // 5 minutos
    
    for (let i = 0; i < (hours * 12); i++) {
      const timestamp = new Date(now.getTime() - (i * interval));
      const metrics = monitoringService.getMetrics();
      
      history.push({
        timestamp,
        status: metrics.status,
        responseTime: metrics.responseTime + Math.random() * 100,
        memoryUsage: metrics.memoryUsage.percentage + Math.random() * 10,
        uptime: metrics.uptime - (i * 5 * 60) // Simular decremento de uptime
      });
    }

    res.json({
      success: true,
      data: {
        history: history.reverse(),
        period: `${hours} horas`,
        interval: '5 minutos'
      }
    });
  } catch (error) {
    logger.error('Error getting metrics history:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de alertas
export const getAlertHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = monitoringService.getAlertHistory(limit);
    
    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    logger.error('Error getting alert history:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de alertas
export const getAlertStats = async (req, res) => {
  try {
    const stats = monitoringService.getAlertStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Configurar umbrales de alerta
export const setAlertThresholds = async (req, res) => {
  try {
    const { thresholds } = req.body;
    
    if (!thresholds || typeof thresholds !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Umbrales de alerta inválidos'
      });
    }

    monitoringService.setAlertThresholds(thresholds);
    
    res.json({
      success: true,
      message: 'Umbrales de alerta actualizados correctamente'
    });
  } catch (error) {
    logger.error('Error setting alert thresholds:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Configurar recuperación automática
export const setAutoRecovery = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Valor de recuperación automática inválido'
      });
    }

    monitoringService.setAutoRecovery(enabled);
    
    res.json({
      success: true,
      message: `Recuperación automática ${enabled ? 'habilitada' : 'deshabilitada'} correctamente`
    });
  } catch (error) {
    logger.error('Error setting auto recovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};