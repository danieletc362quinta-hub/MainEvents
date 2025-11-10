import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_created',
      'event_updated',
      'event_cancelled',
      'event_reminder',
      'attendance_confirmed',
      'attendance_cancelled',
      'payment_completed',
      'payment_failed',
      'refund_requested',
      'refund_processed',
      'ticket_transferred',
      'ticket_downloaded',
      'new_comment',
      'new_review',
      'system_announcement',
      'security_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'push', 'sms'],
    default: ['in_app']
  }],
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  readAt: Date,
  archivedAt: Date,
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'admin', 'automated'],
      default: 'system'
    },
    category: {
      type: String,
      enum: ['event', 'payment', 'security', 'system', 'social'],
      default: 'system'
    },
    tags: [String],
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'metadata.relatedEntityType'
    },
    relatedEntityType: {
      type: String,
      enum: ['Event', 'Payment', 'Ticket', 'Attendance', 'User']
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1 });

// Middleware pre-save para validaciones
notificationSchema.pre('save', function(next) {
  // Si se marca como leída, actualizar readAt
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Si se marca como archivada, actualizar archivedAt
  if (this.isModified('status') && this.status === 'archived' && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  
  next();
});

// Método para marcar como leída
notificationSchema.methods.markAsRead = function() {
  if (this.status === 'unread') {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Método para archivar
notificationSchema.methods.archive = function() {
  if (this.status !== 'archived') {
    this.status = 'archived';
    this.archivedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Método estático para crear notificación
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  return await notification.save();
};

// Método estático para obtener notificaciones del usuario
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    status = 'unread',
    type,
    priority,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { user: userId };
  
  if (status !== 'all') {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }

  const sort = {};
  sort[sortBy] = sortOrder;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('metadata.relatedEntity');
};

// Método estático para marcar todas como leídas
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, status: 'unread' },
    { 
      status: 'read',
      readAt: new Date()
    }
  );
};

// Método estático para obtener estadísticas de notificaciones
notificationSchema.statics.getNotificationStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] }
        },
        read: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        archived: {
          $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        urgentPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
    highPriority: 0,
    urgentPriority: 0
  };
};

// Método estático para limpiar notificaciones antiguas
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    status: 'archived',
    archivedAt: { $lt: cutoffDate }
  });
};

export default mongoose.model('Notification', notificationSchema);