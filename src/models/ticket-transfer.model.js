import mongoose from 'mongoose';

const ticketTransferSchema = new mongoose.Schema({
  // Ticket original
  originalTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MercadoPagoPayment',
    required: true
  },
  
  // Usuario que transfiere (vendedor)
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Usuario que recibe (comprador)
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Estado de la transferencia
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Precio de transferencia (si es venta)
  transferPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Comisión de la plataforma
  platformFee: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Tipo de transferencia
  transferType: {
    type: String,
    enum: ['gift', 'sale', 'exchange'],
    required: true
  },
  
  // Fecha de expiración de la oferta
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Mensaje del vendedor
  sellerMessage: {
    type: String,
    maxlength: 500,
    default: null
  },
  
  // Mensaje del comprador
  buyerMessage: {
    type: String,
    maxlength: 500,
    default: null
  },
  
  // Razón del rechazo (si aplica)
  rejectionReason: {
    type: String,
    maxlength: 200,
    default: null
  },
  
  // Historial de la transferencia
  history: [{
    action: {
      type: String,
      enum: ['created', 'accepted', 'rejected', 'cancelled', 'expired', 'paid']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Información de pago (si es venta)
  payment: {
    paymentId: String,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  
  // Metadatos
  metadata: {
    transferReason: String,
    tags: [String],
    isUrgent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Índices
ticketTransferSchema.index({ originalTicket: 1 });
ticketTransferSchema.index({ fromUser: 1, status: 1 });
ticketTransferSchema.index({ toUser: 1, status: 1 });
ticketTransferSchema.index({ status: 1, expiresAt: 1 });
ticketTransferSchema.index({ createdAt: -1 });

// Métodos del modelo
ticketTransferSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

ticketTransferSchema.methods.canBeAccepted = function() {
  return this.status === 'pending' && !this.isExpired();
};

ticketTransferSchema.methods.canBeCancelled = function(userId) {
  return this.status === 'pending' && 
         (this.fromUser.toString() === userId.toString() || this.toUser.toString() === userId.toString());
};

ticketTransferSchema.methods.addHistoryEntry = function(action, userId, notes = null) {
  this.history.push({
    action,
    user: userId,
    notes,
    timestamp: new Date()
  });
};

ticketTransferSchema.methods.accept = async function(userId, message = null) {
  if (!this.canBeAccepted()) {
    throw new Error('La transferencia no puede ser aceptada');
  }
  
  if (this.toUser.toString() !== userId.toString()) {
    throw new Error('Solo el destinatario puede aceptar la transferencia');
  }
  
  this.status = 'accepted';
  this.buyerMessage = message;
  this.addHistoryEntry('accepted', userId, message);
  
  return this.save();
};

ticketTransferSchema.methods.reject = async function(userId, reason = null) {
  if (!this.canBeAccepted()) {
    throw new Error('La transferencia no puede ser rechazada');
  }
  
  if (this.toUser.toString() !== userId.toString()) {
    throw new Error('Solo el destinatario puede rechazar la transferencia');
  }
  
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.addHistoryEntry('rejected', userId, reason);
  
  return this.save();
};

ticketTransferSchema.methods.cancel = async function(userId) {
  if (!this.canBeCancelled(userId)) {
    throw new Error('La transferencia no puede ser cancelada');
  }
  
  this.status = 'cancelled';
  this.addHistoryEntry('cancelled', userId);
  
  return this.save();
};

// Métodos estáticos
ticketTransferSchema.statics.createTransfer = async function(data) {
  const transfer = new this({
    ...data,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días por defecto
  });
  
  transfer.addHistoryEntry('created', data.fromUser);
  
  return transfer.save();
};

ticketTransferSchema.statics.getPendingTransfers = function(userId) {
  return this.find({
    $or: [
      { fromUser: userId, status: 'pending' },
      { toUser: userId, status: 'pending' }
    ]
  })
  .populate('originalTicket')
  .populate('fromUser', 'name email')
  .populate('toUser', 'name email')
  .sort({ createdAt: -1 });
};

ticketTransferSchema.statics.getTransferHistory = function(userId, limit = 20) {
  return this.find({
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ]
  })
  .populate('originalTicket')
  .populate('fromUser', 'name email')
  .populate('toUser', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

ticketTransferSchema.statics.getAvailableTickets = function(eventId, limit = 20) {
  return this.find({
    status: 'pending',
    'originalTicket.event': eventId
  })
  .populate('originalTicket')
  .populate('fromUser', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Middleware para verificar expiración
ticketTransferSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'pending') {
    this.status = 'expired';
    this.addHistoryEntry('expired', null, 'Transferencia expirada automáticamente');
  }
  next();
});

// Tarea programada para expirar transferencias
ticketTransferSchema.statics.expireOldTransfers = async function() {
  const result = await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' },
      $push: {
        history: {
          action: 'expired',
          timestamp: new Date(),
          notes: 'Transferencia expirada automáticamente'
        }
      }
    }
  );
  
  if (result.modifiedCount > 0) {
    console.log(`⏰ Expired ${result.modifiedCount} ticket transfers`);
  }
  
  return result;
};

export default mongoose.model('TicketTransfer', ticketTransferSchema); 