import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'El evento es obligatorio']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  registrationData: {
    firstName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      maxlength: [50, 'El apellido no puede exceder los 50 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    specialRequirements: {
      dietary: { type: String, trim: true },
      mobility: { type: String, trim: true },
      medical: { type: String, trim: true },
      other: { type: String, trim: true }
    }
  },
  ticket: {
    type: {
      type: String,
      required: [true, 'El tipo de entrada es obligatorio'],
      enum: ['general', 'vip', 'premium', 'student', 'senior', 'group']
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
      max: [10, 'La cantidad máxima es 10']
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    totalPrice: {
      type: Number,
      required: [true, 'El precio total es obligatorio'],
      min: [0, 'El precio total no puede ser negativo']
    },
    ticketNumber: {
      type: String,
      required: true
    },
    qrCode: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['mercadopago', 'transfer', 'cash', 'card'],
      required: [true, 'El método de pago es obligatorio']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: { type: String },
    paymentDate: { type: Date },
    refundDate: { type: Date },
    refundAmount: { type: Number, min: 0 }
  },
  checkInData: {
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
    checkInLocation: { type: String },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    submittedAt: { type: Date }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  metadata: {
    source: { type: String, default: 'web' }, // web, mobile, api
    userAgent: { type: String },
    ipAddress: { type: String },
    referrer: { type: String }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
participantSchema.index({ event: 1, user: 1 }, { unique: true });
participantSchema.index({ event: 1, status: 1 });
participantSchema.index({ user: 1, status: 1 });
participantSchema.index({ 'ticket.ticketNumber': 1 }, { unique: true });
participantSchema.index({ 'payment.status': 1 });
participantSchema.index({ registrationDate: -1 });

// Virtual para nombre completo
participantSchema.virtual('fullName').get(function() {
  return `${this.registrationData.firstName} ${this.registrationData.lastName}`;
});

// Virtual para edad
participantSchema.virtual('age').get(function() {
  if (!this.registrationData.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.registrationData.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Middleware para generar número de ticket y QR code
participantSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generar número de ticket único
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.ticket.ticketNumber = `TKT-${timestamp}-${random}`.toUpperCase();
    
    // Generar QR code (en producción usar una librería como qrcode)
    this.ticket.qrCode = `QR-${this.ticket.ticketNumber}`;
    
    // Calcular precio total
    this.ticket.totalPrice = this.ticket.price * this.ticket.quantity;
  }
  
  this.lastUpdated = new Date();
  next();
});

// Método para confirmar participación
participantSchema.methods.confirm = function() {
  if (this.status === 'cancelled') {
    throw new Error('No se puede confirmar una participación cancelada');
  }
  
  this.status = 'confirmed';
  this.lastUpdated = new Date();
  return this.save();
};

// Método para cancelar participación
participantSchema.methods.cancel = function(reason = '') {
  if (this.status === 'attended') {
    throw new Error('No se puede cancelar una participación ya asistida');
  }
  
  this.status = 'cancelled';
  this.lastUpdated = new Date();
  
  // Si ya se pagó, procesar reembolso
  if (this.payment.status === 'completed') {
    this.payment.status = 'refunded';
    this.payment.refundDate = new Date();
    this.payment.refundAmount = this.ticket.totalPrice;
  }
  
  return this.save();
};

// Método para registrar asistencia
participantSchema.methods.checkIn = function(location, checkedInBy) {
  if (this.status !== 'confirmed') {
    throw new Error('Solo se puede registrar asistencia de participantes confirmados');
  }
  
    this.checkInData.checkedIn = true;
    this.checkInData.checkInTime = new Date();
    this.checkInData.checkInLocation = location;
    this.checkInData.checkedInBy = checkedInBy;
  this.status = 'attended';
  this.lastUpdated = new Date();
  
  return this.save();
};

// Método para marcar como no asistió
participantSchema.methods.markAsNoShow = function() {
  if (this.status !== 'confirmed') {
    throw new Error('Solo se puede marcar como no asistió a participantes confirmados');
  }
  
  this.status = 'no_show';
  this.lastUpdated = new Date();
  return this.save();
};

// Método para enviar feedback
participantSchema.methods.submitFeedback = function(rating, comment) {
  if (this.status !== 'attended') {
    throw new Error('Solo los participantes que asistieron pueden enviar feedback');
  }
  
  this.feedback.rating = rating;
  this.feedback.comment = comment;
  this.feedback.submittedAt = new Date();
  this.lastUpdated = new Date();
  
  return this.save();
};

// Método estático para obtener estadísticas de un evento
participantSchema.statics.getEventStats = function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$ticket.totalPrice' }
      }
    }
  ]);
};

// Método estático para obtener participantes por evento
participantSchema.statics.getByEvent = function(eventId, options = {}) {
  const query = { event: eventId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('event', 'name date location')
    .sort({ registrationDate: -1 });
};

// Método estático para obtener participantes por usuario
participantSchema.statics.getByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('event', 'name date location image')
    .sort({ registrationDate: -1 });
};

export default mongoose.model('Participant', participantSchema);
