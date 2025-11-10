import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  // Usuario que realizó la acción
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tipo de acción
  action: {
    type: String,
    required: true,
    enum: [
      // Acciones de autenticación
      'LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
      
      // Acciones de eventos
      'EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_DELETE', 'EVENT_PUBLISH', 'EVENT_CANCEL',
      
      // Acciones de pagos
      'PAYMENT_CREATE', 'PAYMENT_CONFIRM', 'PAYMENT_REFUND', 'PAYMENT_FAIL',
      
      // Acciones de tickets
      'TICKET_PURCHASE', 'TICKET_VALIDATE', 'TICKET_TRANSFER', 'TICKET_REFUND',
      
      // Acciones de cupones
      'COUPON_CREATE', 'COUPON_USE', 'COUPON_DEACTIVATE',
      
      // Acciones de usuarios
      'USER_UPDATE', 'USER_DELETE', 'USER_BAN', 'USER_UNBAN', 'ROLE_CHANGE',
      
      // Acciones de sistema
      'SYSTEM_CONFIG', 'BACKUP_CREATE', 'MAINTENANCE_MODE',
      
      // Acciones de contenido
      'CONTENT_CREATE', 'CONTENT_UPDATE', 'CONTENT_DELETE', 'CONTENT_MODERATE',
      
      // Acciones de reportes
      'REPORT_GENERATE', 'REPORT_EXPORT', 'ANALYTICS_VIEW'
    ]
  },
  
  // Recurso afectado
  resource: {
    type: String,
    required: true,
    enum: ['USER', 'EVENT', 'PAYMENT', 'TICKET', 'COUPON', 'SYSTEM', 'CONTENT', 'REPORT']
  },
  
  // ID del recurso afectado
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Datos antes del cambio (para auditoría de cambios)
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Datos después del cambio
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Cambios específicos (diff)
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // IP del usuario
  ipAddress: {
    type: String,
    required: true
  },
  
  // User Agent
  userAgent: {
    type: String,
    required: true
  },
  
  // Método HTTP
  httpMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  
  // URL de la acción
  url: {
    type: String,
    required: true
  },
  
  // Código de respuesta HTTP
  statusCode: {
    type: Number,
    required: true
  },
  
  // Tiempo de respuesta en ms
  responseTime: {
    type: Number,
    required: true
  },
  
  // Metadatos adicionales
  metadata: {
    sessionId: String,
    requestId: String,
    correlationId: String,
    tags: [String],
    notes: String
  },
  
  // Severidad del evento
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  
  // Si la acción fue exitosa
  success: {
    type: Boolean,
    required: true
  },
  
  // Mensaje de error si falló
  errorMessage: {
    type: String,
    default: null
  },
  
  // Stack trace si hay error
  errorStack: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
auditSchema.index({ user: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ resource: 1, resourceId: 1 });
auditSchema.index({ severity: 1, createdAt: -1 });
auditSchema.index({ success: 1, createdAt: -1 });
auditSchema.index({ ipAddress: 1, createdAt: -1 });
auditSchema.index({ createdAt: -1 });

// Métodos estáticos
auditSchema.statics.logAction = async function(data) {
  try {
    const audit = new this(data);
    await audit.save();
    return audit;
  } catch (error) {
    console.error('❌ Error logging audit action:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

auditSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

auditSchema.statics.getResourceHistory = function(resource, resourceId, limit = 50) {
  return this.find({ resource, resourceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

auditSchema.statics.getSecurityEvents = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    createdAt: { $gte: date },
    action: { 
      $in: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'USER_BAN', 'USER_UNBAN'] 
    }
  }).sort({ createdAt: -1 });
};

auditSchema.statics.getFailedActions = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    createdAt: { $gte: date },
    success: false
  }).sort({ createdAt: -1 });
};

auditSchema.statics.getAuditSummary = async function(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const pipeline = [
    { $match: { createdAt: { $gte: date } } },
    {
      $group: {
        _id: {
          action: '$action',
          success: '$success'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        total: { $sum: '$count' },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$_id.success', true] }, '$count', 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$_id.success', false] }, '$count', 0]
          }
        }
      }
    },
    { $sort: { total: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Middleware para limpiar logs antiguos (más de 1 año)
auditSchema.statics.cleanOldLogs = async function() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const result = await this.deleteMany({
    createdAt: { $lt: oneYearAgo },
    severity: { $ne: 'CRITICAL' } // Mantener logs críticos
  });
  
  console.log(`🧹 Cleaned ${result.deletedCount} old audit logs`);
  return result;
};

export default mongoose.model('Audit', auditSchema); 