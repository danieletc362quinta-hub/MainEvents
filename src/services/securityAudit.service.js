import { logger } from '../utils/logger.js';
import Audit from '../models/audit.model.js';
import User from '../models/user.model.js';
import Event from '../models/events.model.js';

class SecurityAuditService {
  constructor() {
    this.suspiciousActivities = new Map();
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();
    this.securityThresholds = {
      maxFailedAttempts: 5,
      maxSuspiciousActivities: 3,
      blockDuration: 15 * 60 * 1000, // 15 minutos
      alertThreshold: 10
    };
  }

  // Registrar evento de seguridad
  async logSecurityEvent(eventData) {
    try {
      const {
        type,
        severity = 'medium',
        userId = null,
        ipAddress,
        userAgent,
        description,
        metadata = {},
        resource = null,
        resourceId = null
      } = eventData;

      // Crear entrada de auditoría
      const auditEntry = await Audit.create({
        user: userId,
        action: `SECURITY_${type.toUpperCase()}`,
        resource: resource || 'SECURITY',
        resourceId: resourceId,
        before: null,
        after: metadata,
        ipAddress,
        userAgent,
        httpMethod: 'SECURITY',
        url: '/security-audit',
        statusCode: 200,
        responseTime: 0,
        success: true,
        severity: this.mapSeverity(severity),
        category: 'SECURITY',
        tags: [type, severity]
      });

      // Procesar según el tipo de evento
      await this.processSecurityEvent(type, severity, ipAddress, userId, metadata);

      logger.info(`Security event logged: ${type}`, {
        auditId: auditEntry._id,
        type,
        severity,
        ipAddress,
        userId
      });

      return auditEntry;
    } catch (error) {
      logger.error('Error logging security event:', error);
      throw error;
    }
  }

  // Procesar evento de seguridad
  async processSecurityEvent(type, severity, ipAddress, userId, metadata) {
    switch (type) {
      case 'LOGIN_FAILED':
        await this.handleFailedLogin(ipAddress, userId, metadata);
        break;
      case 'SUSPICIOUS_ACTIVITY':
        await this.handleSuspiciousActivity(ipAddress, userId, metadata);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        await this.handleRateLimitExceeded(ipAddress, metadata);
        break;
      case 'UNAUTHORIZED_ACCESS':
        await this.handleUnauthorizedAccess(ipAddress, userId, metadata);
        break;
      case 'DATA_BREACH_ATTEMPT':
        await this.handleDataBreachAttempt(ipAddress, userId, metadata);
        break;
      case 'MALICIOUS_FILE_UPLOAD':
        await this.handleMaliciousFileUpload(ipAddress, userId, metadata);
        break;
      default:
        logger.warn(`Unknown security event type: ${type}`);
    }
  }

  // Manejar intentos de login fallidos
  async handleFailedLogin(ipAddress, userId, metadata) {
    const key = `failed_login_${ipAddress}`;
    const attempts = this.failedAttempts.get(key) || 0;
    const newAttempts = attempts + 1;

    this.failedAttempts.set(key, newAttempts);

    // Si excede el límite, bloquear IP temporalmente
    if (newAttempts >= this.securityThresholds.maxFailedAttempts) {
      await this.blockIP(ipAddress, 'Excessive failed login attempts');
      
      // Notificar administradores
      await this.notifyAdmins('IP_BLOCKED', {
        ipAddress,
        reason: 'Excessive failed login attempts',
        attempts: newAttempts,
        userId
      });
    }

    // Limpiar después del tiempo de bloqueo
    setTimeout(() => {
      this.failedAttempts.delete(key);
    }, this.securityThresholds.blockDuration);
  }

  // Manejar actividad sospechosa
  async handleSuspiciousActivity(ipAddress, userId, metadata) {
    const key = `suspicious_${ipAddress}`;
    const activities = this.suspiciousActivities.get(key) || [];
    activities.push({
      timestamp: new Date(),
      userId,
      metadata
    });

    this.suspiciousActivities.set(key, activities);

    // Si excede el límite, bloquear IP
    if (activities.length >= this.securityThresholds.maxSuspiciousActivities) {
      await this.blockIP(ipAddress, 'Suspicious activity pattern detected');
      
      await this.notifyAdmins('SUSPICIOUS_ACTIVITY', {
        ipAddress,
        activities: activities.length,
        userId,
        metadata
      });
    }

    // Limpiar actividades antiguas
    const cutoff = new Date(Date.now() - this.securityThresholds.blockDuration);
    const recentActivities = activities.filter(activity => activity.timestamp > cutoff);
    this.suspiciousActivities.set(key, recentActivities);
  }

  // Manejar exceso de rate limit
  async handleRateLimitExceeded(ipAddress, metadata) {
    await this.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'high',
      ipAddress,
      description: 'Rate limit exceeded',
      metadata
    });

    // Bloquear IP temporalmente
    await this.blockIP(ipAddress, 'Rate limit exceeded');
  }

  // Manejar acceso no autorizado
  async handleUnauthorizedAccess(ipAddress, userId, metadata) {
    await this.logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'high',
      userId,
      ipAddress,
      description: 'Unauthorized access attempt',
      metadata
    });

    // Si es un usuario registrado, revisar su cuenta
    if (userId) {
      await this.reviewUserAccount(userId, 'Unauthorized access attempt');
    }
  }

  // Manejar intento de brecha de datos
  async handleDataBreachAttempt(ipAddress, userId, metadata) {
    await this.logSecurityEvent({
      type: 'DATA_BREACH_ATTEMPT',
      severity: 'critical',
      userId,
      ipAddress,
      description: 'Data breach attempt detected',
      metadata
    });

    // Bloquear IP inmediatamente
    await this.blockIP(ipAddress, 'Data breach attempt');
    
    // Notificar inmediatamente a administradores
    await this.notifyAdmins('DATA_BREACH_ATTEMPT', {
      ipAddress,
      userId,
      metadata,
      urgent: true
    });
  }

  // Manejar subida de archivo malicioso
  async handleMaliciousFileUpload(ipAddress, userId, metadata) {
    await this.logSecurityEvent({
      type: 'MALICIOUS_FILE_UPLOAD',
      severity: 'high',
      userId,
      ipAddress,
      description: 'Malicious file upload attempt',
      metadata
    });

    // Bloquear IP
    await this.blockIP(ipAddress, 'Malicious file upload');
  }

  // Bloquear IP
  async blockIP(ipAddress, reason) {
    this.blockedIPs.add(ipAddress);
    
    await this.logSecurityEvent({
      type: 'IP_BLOCKED',
      severity: 'high',
      ipAddress,
      description: `IP blocked: ${reason}`,
      metadata: { reason, blockedAt: new Date() }
    });

    // Desbloquear después del tiempo de bloqueo
    setTimeout(() => {
      this.blockedIPs.delete(ipAddress);
      logger.info(`IP unblocked: ${ipAddress}`);
    }, this.securityThresholds.blockDuration);

    logger.warn(`IP blocked: ${ipAddress} - ${reason}`);
  }

  // Verificar si una IP está bloqueada
  isIPBlocked(ipAddress) {
    return this.blockedIPs.has(ipAddress);
  }

  // Revisar cuenta de usuario
  async reviewUserAccount(userId, reason) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Marcar cuenta para revisión
      user.securityFlags = user.securityFlags || [];
      user.securityFlags.push({
        type: 'REVIEW_REQUIRED',
        reason,
        timestamp: new Date(),
        reviewed: false
      });

      await user.save();

      await this.logSecurityEvent({
        type: 'USER_ACCOUNT_REVIEW',
        severity: 'medium',
        userId,
        description: `User account flagged for review: ${reason}`,
        metadata: { reason }
      });

      logger.info(`User account flagged for review: ${userId} - ${reason}`);
    } catch (error) {
      logger.error('Error reviewing user account:', error);
    }
  }

  // Notificar administradores
  async notifyAdmins(type, data) {
    try {
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        // Aquí se podría integrar con sistemas de notificación
        // como email, Slack, Discord, etc.
        logger.warn(`Security alert for admin ${admin.email}:`, {
          type,
          data,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Error notifying admins:', error);
    }
  }

  // Mapear severidad
  mapSeverity(severity) {
    const severityMap = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'critical': 'CRITICAL'
    };
    return severityMap[severity] || 'MEDIUM';
  }

  // Obtener estadísticas de seguridad
  async getSecurityStats(timeframe = '24h') {
    try {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const securityEvents = await Audit.find({
        category: 'SECURITY',
        createdAt: { $gte: startDate }
      });

      const stats = {
        totalEvents: securityEvents.length,
        byType: {},
        bySeverity: {},
        blockedIPs: this.blockedIPs.size,
        failedAttempts: this.failedAttempts.size,
        suspiciousActivities: this.suspiciousActivities.size
      };

      // Agrupar por tipo
      securityEvents.forEach(event => {
        const type = event.action.replace('SECURITY_', '');
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting security stats:', error);
      throw error;
    }
  }

  // Obtener eventos de seguridad recientes
  async getRecentSecurityEvents(limit = 50) {
    try {
      return await Audit.find({
        category: 'SECURITY'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email role');
    } catch (error) {
      logger.error('Error getting recent security events:', error);
      throw error;
    }
  }

  // Limpiar datos antiguos
  async cleanupOldData() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días
      
      const result = await Audit.deleteMany({
        category: 'SECURITY',
        createdAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} old security events`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old security data:', error);
      throw error;
    }
  }
}

// Instancia singleton
const securityAuditService = new SecurityAuditService();

export default securityAuditService;
