/**
 * Servicio de Recuperación Automática
 * 
 * Este servicio proporciona:
 * - Recuperación automática de fallos
 * - Reconexión a base de datos
 * - Restart de servicios críticos
 * - Limpieza de recursos
 */

import monitoringService from './monitoring.service.js';

class RecoveryService {
  constructor() {
    this.recoveryStrategies = new Map();
    this.isRecovering = false;
    this.recoveryHistory = [];
    this.maxRecoveryHistory = 50;
  }

  /**
   * Inicializar estrategias de recuperación
   */
  initialize() {
    // Estrategia para fallos de base de datos
    this.recoveryStrategies.set('database', {
      name: 'Database Recovery',
      maxAttempts: 3,
      delay: 2000,
      handler: this.recoverDatabase.bind(this)
    });

    // Estrategia para fallos de memoria
    this.recoveryStrategies.set('memory', {
      name: 'Memory Recovery',
      maxAttempts: 2,
      delay: 1000,
      handler: this.recoverMemory.bind(this)
    });

    // Estrategia para fallos de CPU
    this.recoveryStrategies.set('cpu', {
      name: 'CPU Recovery',
      maxAttempts: 2,
      delay: 1000,
      handler: this.recoverCPU.bind(this)
    });

    // Estrategia para fallos de red
    this.recoveryStrategies.set('network', {
      name: 'Network Recovery',
      maxAttempts: 5,
      delay: 3000,
      handler: this.recoverNetwork.bind(this)
    });

    monitoringService.log('info', 'Recovery service initialized', {
      strategies: Array.from(this.recoveryStrategies.keys())
    });
  }

  /**
   * Intentar recuperación automática
   */
  async attemptRecovery(failureType, error, context = {}) {
    if (this.isRecovering) {
      monitoringService.log('warning', 'Recovery already in progress', {
        failureType,
        currentRecovery: this.isRecovering
      });
      return false;
    }

    const strategy = this.recoveryStrategies.get(failureType);
    if (!strategy) {
      monitoringService.log('error', 'No recovery strategy found', {
        failureType,
        availableStrategies: Array.from(this.recoveryStrategies.keys())
      });
      return false;
    }

    this.isRecovering = true;
    const recoveryId = this.generateRecoveryId();

    monitoringService.log('info', 'Starting recovery process', {
      recoveryId,
      failureType,
      strategy: strategy.name,
      error: error.message,
      context
    });

    try {
      const result = await this.executeRecoveryStrategy(strategy, error, context);
      
      this.recordRecoveryAttempt(recoveryId, failureType, true, result);
      
      monitoringService.log('info', 'Recovery completed successfully', {
        recoveryId,
        failureType,
        result
      });

      return true;
    } catch (recoveryError) {
      this.recordRecoveryAttempt(recoveryId, failureType, false, recoveryError.message);
      
      monitoringService.log('error', 'Recovery failed', {
        recoveryId,
        failureType,
        error: recoveryError.message
      });

      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Ejecutar estrategia de recuperación
   */
  async executeRecoveryStrategy(strategy, error, context) {
    const results = [];
    
    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      try {
        monitoringService.log('info', `Recovery attempt ${attempt}/${strategy.maxAttempts}`, {
          strategy: strategy.name,
          failureType: context.failureType
        });

        const result = await strategy.handler(error, context, attempt);
        results.push({ attempt, success: true, result });

        // Si la recuperación fue exitosa, salir del loop
        if (result.success) {
          return {
            success: true,
            attempts: attempt,
            results
          };
        }

        // Esperar antes del siguiente intento
        if (attempt < strategy.maxAttempts) {
          await this.delay(strategy.delay * attempt);
        }

      } catch (attemptError) {
        results.push({ 
          attempt, 
          success: false, 
          error: attemptError.message 
        });

        monitoringService.log('error', `Recovery attempt ${attempt} failed`, {
          strategy: strategy.name,
          error: attemptError.message
        });

        // Esperar antes del siguiente intento
        if (attempt < strategy.maxAttempts) {
          await this.delay(strategy.delay * attempt);
        }
      }
    }

    return {
      success: false,
      attempts: strategy.maxAttempts,
      results
    };
  }

  /**
   * Recuperación de base de datos
   */
  async recoverDatabase(error, context, attempt) {
    try {
      monitoringService.log('info', 'Attempting database recovery', {
        attempt,
        error: error.message
      });

      // Importar dinámicamente para evitar dependencias circulares
      const mongoose = await import('mongoose');
      
      // Si la conexión está cerrada, intentar reconectar
      if (mongoose.default.connection.readyState === 0) {
        const { connectDB } = await import('../config/database.js');
        await connectDB();
      }

      // Verificar que la conexión esté activa
      if (mongoose.default.connection.readyState === 1) {
        return {
          success: true,
          message: 'Database reconnected successfully',
          connectionState: mongoose.default.connection.readyState
        };
      } else {
        return {
          success: false,
          message: 'Database connection still not active',
          connectionState: mongoose.default.connection.readyState
        };
      }

    } catch (recoveryError) {
      throw new Error(`Database recovery failed: ${recoveryError.message}`);
    }
  }

  /**
   * Recuperación de memoria
   */
  async recoverMemory(error, context, attempt) {
    try {
      monitoringService.log('info', 'Attempting memory recovery', {
        attempt,
        memoryUsage: process.memoryUsage()
      });

      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc();
        monitoringService.log('info', 'Garbage collection forced');
      }

      // Limpiar cachés si existen
      if (global.cache) {
        global.cache.clear();
        monitoringService.log('info', 'Cache cleared');
      }

      // Verificar uso de memoria después de la limpieza
      const memoryUsage = process.memoryUsage();
      const heapPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      return {
        success: heapPercentage < 80, // Considerar exitoso si está por debajo del 80%
        message: `Memory usage after cleanup: ${Math.round(heapPercentage)}%`,
        memoryUsage
      };

    } catch (recoveryError) {
      throw new Error(`Memory recovery failed: ${recoveryError.message}`);
    }
  }

  /**
   * Recuperación de CPU
   */
  async recoverCPU(error, context, attempt) {
    try {
      monitoringService.log('info', 'Attempting CPU recovery', {
        attempt,
        cpuUsage: process.cpuUsage()
      });

      // Reducir la carga de trabajo temporalmente
      // Pausar operaciones no críticas
      if (global.backgroundTasks) {
        global.backgroundTasks.pause();
        monitoringService.log('info', 'Background tasks paused');
      }

      // Esperar un poco para que el CPU se recupere
      await this.delay(2000);

      // Reanudar operaciones
      if (global.backgroundTasks) {
        global.backgroundTasks.resume();
        monitoringService.log('info', 'Background tasks resumed');
      }

      return {
        success: true,
        message: 'CPU recovery completed - background tasks paused and resumed'
      };

    } catch (recoveryError) {
      throw new Error(`CPU recovery failed: ${recoveryError.message}`);
    }
  }

  /**
   * Recuperación de red
   */
  async recoverNetwork(error, context, attempt) {
    try {
      monitoringService.log('info', 'Attempting network recovery', {
        attempt,
        error: error.message
      });

      // Verificar conectividad básica
      const networkCheck = await this.checkNetworkConnectivity();
      
      if (networkCheck.success) {
        return {
          success: true,
          message: 'Network connectivity restored',
          details: networkCheck
        };
      } else {
        return {
          success: false,
          message: 'Network connectivity still not available',
          details: networkCheck
        };
      }

    } catch (recoveryError) {
      throw new Error(`Network recovery failed: ${recoveryError.message}`);
    }
  }

  /**
   * Verificar conectividad de red
   */
  async checkNetworkConnectivity() {
    try {
      // Intentar hacer una petición simple
      const response = await fetch('http://localhost:4000/health', {
        method: 'GET',
        timeout: 5000
      });

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Network connectivity OK' : 'Network connectivity failed'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Network connectivity check failed'
      };
    }
  }

  /**
   * Generar ID único para recuperación
   */
  generateRecoveryId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registrar intento de recuperación
   */
  recordRecoveryAttempt(recoveryId, failureType, success, result) {
    const attempt = {
      id: recoveryId,
      failureType,
      success,
      result,
      timestamp: new Date().toISOString()
    };

    this.recoveryHistory.push(attempt);

    // Mantener solo los últimos N intentos
    if (this.recoveryHistory.length > this.maxRecoveryHistory) {
      this.recoveryHistory.shift();
    }
  }

  /**
   * Obtener historial de recuperación
   */
  getRecoveryHistory() {
    return {
      total: this.recoveryHistory.length,
      successful: this.recoveryHistory.filter(a => a.success).length,
      failed: this.recoveryHistory.filter(a => !a.success).length,
      recent: this.recoveryHistory.slice(-10) // Últimos 10 intentos
    };
  }

  /**
   * Obtener estadísticas de recuperación
   */
  getRecoveryStats() {
    const stats = {};
    
    for (const attempt of this.recoveryHistory) {
      if (!stats[attempt.failureType]) {
        stats[attempt.failureType] = {
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      
      stats[attempt.failureType].total++;
      if (attempt.success) {
        stats[attempt.failureType].successful++;
      } else {
        stats[attempt.failureType].failed++;
      }
    }

    return stats;
  }

  /**
   * Limpiar historial de recuperación
   */
  clearRecoveryHistory() {
    this.recoveryHistory.length = 0;
    monitoringService.log('info', 'Recovery history cleared');
  }

  /**
   * Función de delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verificar si está en proceso de recuperación
   */
  isRecoveryInProgress() {
    return this.isRecovering;
  }

  /**
   * Obtener estado del servicio de recuperación
   */
  getStatus() {
    return {
      isRecovering: this.isRecovering,
      strategies: Array.from(this.recoveryStrategies.keys()),
      history: this.getRecoveryHistory(),
      stats: this.getRecoveryStats()
    };
  }
}

// Crear instancia singleton
const recoveryService = new RecoveryService();

export default recoveryService;

