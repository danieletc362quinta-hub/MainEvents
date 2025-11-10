import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'ARS', 'MXN']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'mercadopago', 'bank_transfer', 'cash'],
    required: true
  },
  paymentProvider: {
    type: String,
    enum: ['mercadopago', 'stripe', 'paypal', 'manual'],
    default: 'mercadopago'
  },
  providerTransactionId: String,
  providerPaymentId: String,
  providerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refunds: [{
    refundId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    providerRefundId: String,
    notes: String
  }],
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String,
    sessionId: String,
    notes: String,
    tags: [String]
  },
  billingInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  taxInfo: {
    taxAmount: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    taxId: String
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ event: 1, status: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ providerTransactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Middleware pre-save para generar paymentId
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.paymentId = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  
  // Calcular total de reembolsos
  if (this.isModified('refunds')) {
    const totalRefunded = this.refunds
      .filter(refund => refund.status === 'completed')
      .reduce((sum, refund) => sum + refund.amount, 0);
    
    if (totalRefunded > 0) {
      if (totalRefunded >= this.amount) {
        this.status = 'refunded';
      } else {
        this.status = 'partially_refunded';
      }
    }
  }
  
  next();
});

// Método para procesar reembolso
paymentSchema.methods.processRefund = function(refundData) {
  if (this.status === 'failed' || this.status === 'cancelled') {
    throw new Error('No se puede reembolsar un pago fallido o cancelado');
  }
  
  const totalRefunded = this.refunds
    .filter(refund => refund.status === 'completed')
    .reduce((sum, refund) => sum + refund.amount, 0);
  
  if (totalRefunded + refundData.amount > this.amount) {
    throw new Error('El monto del reembolso excede el monto disponible');
  }
  
  const refund = {
    refundId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
    amount: refundData.amount,
    reason: refundData.reason,
    requestedBy: refundData.requestedBy,
    notes: refundData.notes || ''
  };
  
  this.refunds.push(refund);
  return this.save();
};

// Método para completar reembolso
paymentSchema.methods.completeRefund = function(refundId, processedBy, providerRefundId) {
  const refund = this.refunds.id(refundId);
  if (!refund) {
    throw new Error('Reembolso no encontrado');
  }
  
  if (refund.status !== 'pending' && refund.status !== 'processing') {
    throw new Error('El reembolso ya fue procesado');
  }
  
  refund.status = 'completed';
  refund.processedBy = processedBy;
  refund.processedAt = new Date();
  refund.providerRefundId = providerRefundId;
  
  return this.save();
};

// Método para cancelar reembolso
paymentSchema.methods.cancelRefund = function(refundId, reason) {
  const refund = this.refunds.id(refundId);
  if (!refund) {
    throw new Error('Reembolso no encontrado');
  }
  
  if (refund.status === 'completed') {
    throw new Error('No se puede cancelar un reembolso completado');
  }
  
  refund.status = 'cancelled';
  refund.notes = refund.notes ? `${refund.notes} | Cancelado: ${reason}` : `Cancelado: ${reason}`;
  
  return this.save();
};

// Método estático para obtener estadísticas de pagos
paymentSchema.statics.getPaymentStats = async function(userId, dateRange = {}) {
  const matchQuery = { user: userId };
  
  if (dateRange.start && dateRange.end) {
    matchQuery.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedPayments: {
          $sum: { $cond: [{ $in: ['$status', ['refunded', 'partially_refunded']] }, 1, 0] }
        },
        totalRefunded: {
          $sum: {
            $reduce: {
              input: '$refunds',
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ['$$this.status', 'completed'] },
                  { $add: ['$$value', '$$this.amount'] },
                  '$$value'
                ]
              }
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    completedAmount: 0,
    failedPayments: 0,
    refundedPayments: 0,
    totalRefunded: 0
  };
};

export default mongoose.model('Payment', paymentSchema);




