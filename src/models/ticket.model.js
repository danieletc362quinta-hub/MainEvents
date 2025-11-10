import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    type: String,
    enum: ['general', 'vip', 'premium', 'student', 'early_bird'],
    default: 'general'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'used', 'cancelled', 'transferred', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  transferHistory: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferredAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  checkInData: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: String,
    deviceInfo: String
  },
  downloadHistory: [{
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    downloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String
  }],
  metadata: {
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ 'checkInData.checkedIn': 1 });

// Middleware pre-save para generar ticketId y QR
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generar ticketId único
    if (!this.ticketId) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      this.ticketId = `TK-${timestamp}-${random}`.toUpperCase();
    }
    
    // Generar QR code (simplificado)
    if (!this.qrCode) {
      this.qrCode = `QR-${this.ticketId}-${this.event}`;
    }
    
    // Calcular fecha de expiración (30 días después del evento)
    if (this.event) {
      const eventDoc = await mongoose.model('Event').findById(this.event);
      if (eventDoc && eventDoc.date) {
        const eventDate = new Date(eventDoc.date);
        this.metadata.expiresAt = new Date(eventDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      }
    }
  }
  next();
});

// Método para validar ticket
ticketSchema.methods.validateTicket = function() {
  const now = new Date();
  
  // Verificar si el ticket ha expirado
  if (this.metadata.expiresAt && now > this.metadata.expiresAt) {
    return { valid: false, reason: 'Ticket expirado' };
  }
  
  // Verificar estado
  if (this.status === 'cancelled') {
    return { valid: false, reason: 'Ticket cancelado' };
  }
  
  if (this.status === 'refunded') {
    return { valid: false, reason: 'Ticket reembolsado' };
  }
  
  if (this.status === 'used') {
    return { valid: false, reason: 'Ticket ya utilizado' };
  }
  
  return { valid: true };
};

// Método para transferir ticket
ticketSchema.methods.transferTicket = function(newUserId, reason = 'Transferencia de ticket') {
  if (this.status !== 'confirmed') {
    throw new Error('Solo se pueden transferir tickets confirmados');
  }
  
  // Agregar al historial de transferencias
  this.transferHistory.push({
    fromUser: this.user,
    toUser: newUserId,
    reason
  });
  
  // Actualizar usuario actual
  this.user = newUserId;
  
  return this.save();
};

// Método para check-in
ticketSchema.methods.checkIn = function(checkInData) {
  if (this.checkInData.checkedIn) {
    throw new Error('Ticket ya utilizado');
  }
  
  this.checkInData = {
    ...this.checkInData,
    checkedIn: true,
    checkedInAt: new Date(),
    ...checkInData
  };
  
  this.status = 'used';
  return this.save();
};

export default mongoose.model('Ticket', ticketSchema);




