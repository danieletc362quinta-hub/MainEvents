import mongoose from 'mongoose';

const mercadopagoPaymentSchema = new mongoose.Schema({
  // Información básica del pago
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Información de Mercado Pago
  mpPaymentId: {
    type: String,
    required: true
  },
  mpPreferenceId: {
    type: String,
    required: true
  },
  mpExternalReference: {
    type: String,
    required: true
  },
  
  // Información del pago
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ARS',
    enum: ['ARS', 'USD', 'BRL']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusDetail: {
    type: String,
    default: 'pending'
  },
  
  // Información del ticket
  ticket: {
    ticketId: {
      type: String,
      required: true
    },
    qrCode: {
      type: String,
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  
  // Metadatos
  metadata: {
    ticketType: {
      type: String,
      required: true,
      enum: ['general', 'vip', 'early_bird', 'student', 'senior']
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    discountCode: String,
    discountAmount: Number,
    customPrice: Number
  },
  
  // Información de Mercado Pago
  mpData: {
    paymentMethod: {
      type: String,
      default: null
    },
    installments: {
      type: Number,
      default: 1
    },
    transactionAmount: {
      type: Number,
      default: null
    },
    transactionDetails: {
      type: Object,
      default: {}
    },
    refunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  
  // URLs de retorno
  backUrls: {
    success: String,
    failure: String,
    pending: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
mercadopagoPaymentSchema.index({ user: 1, createdAt: -1 });
mercadopagoPaymentSchema.index({ event: 1, status: 1 });
mercadopagoPaymentSchema.index({ mpPaymentId: 1 });
mercadopagoPaymentSchema.index({ 'ticket.ticketId': 1 });
mercadopagoPaymentSchema.index({ status: 1, createdAt: -1 });

// Método para buscar por ID de ticket
mercadopagoPaymentSchema.statics.findByTicketId = function(ticketId) {
  return this.findOne({ 'ticket.ticketId': ticketId });
};

// Método para buscar por ID de pago de Mercado Pago
mercadopagoPaymentSchema.statics.findByMPPaymentId = function(mpPaymentId) {
  return this.findOne({ mpPaymentId });
};

// Método para buscar por referencia externa
mercadopagoPaymentSchema.statics.findByExternalReference = function(externalReference) {
  return this.findOne({ mpExternalReference: externalReference });
};

// Método para marcar ticket como usado
mercadopagoPaymentSchema.methods.useTicket = async function(validatorId) {
  this.ticket.isValid = false;
  this.ticket.usedAt = new Date();
  this.ticket.usedBy = validatorId;
  this.updatedAt = new Date();
  return await this.save();
};

// Método para actualizar estado del pago
mercadopagoPaymentSchema.methods.updateStatus = async function(status, statusDetail = null) {
  this.status = status;
  if (statusDetail) {
    this.statusDetail = statusDetail;
  }
  this.updatedAt = new Date();
  return await this.save();
};

// Método para procesar reembolso
mercadopagoPaymentSchema.methods.processRefund = async function(amount) {
  this.mpData.refunded = true;
  this.mpData.refundAmount = amount || this.amount;
  this.status = 'refunded';
  this.updatedAt = new Date();
  return await this.save();
};

// Método para obtener estadísticas
mercadopagoPaymentSchema.statics.getStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalTickets: { $sum: '$metadata.quantity' },
        avgTicketPrice: { $avg: { $divide: ['$amount', '$metadata.quantity'] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    totalTickets: 0,
    avgTicketPrice: 0
  };
};

// Método para obtener pagos por estado
mercadopagoPaymentSchema.statics.getPaymentsByStatus = async function(status, limit = 10) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('event', 'name date location')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Método para validar disponibilidad de tickets
mercadopagoPaymentSchema.statics.validateTicketAvailability = async function(eventId, ticketType, quantity) {
  const event = await mongoose.model('Event').findById(eventId);
  if (!event) {
    throw new Error('Evento no encontrado');
  }
  
  // Contar tickets vendidos de este tipo
  const soldTickets = await this.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        'metadata.ticketType': ticketType,
        status: { $in: ['approved', 'in_process'] }
      }
    },
    {
      $group: {
        _id: null,
        totalSold: { $sum: '$metadata.quantity' }
      }
    }
  ]);
  
  const totalSold = soldTickets[0]?.totalSold || 0;
  const available = event.capacidad - totalSold;
  
  return {
    available,
    requested: quantity,
    canPurchase: available >= quantity,
    eventCapacity: event.capacidad,
    soldTickets: totalSold
  };
};

// Método virtual para obtener el estado del ticket
mercadopagoPaymentSchema.virtual('ticketStatus').get(function() {
  if (this.status !== 'approved') {
    return 'payment_pending';
  }
  if (!this.ticket.isValid) {
    return 'used';
  }
  return 'valid';
});

// Configurar virtuals en JSON
mercadopagoPaymentSchema.set('toJSON', { virtuals: true });
mercadopagoPaymentSchema.set('toObject', { virtuals: true });

const MercadoPagoPayment = mongoose.model('MercadoPagoPayment', mercadopagoPaymentSchema);

export default MercadoPagoPayment; 