import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'attended', 'no_show', 'cancelled'],
    default: 'registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  confirmationDate: Date,
  attendanceDate: Date,
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
    deviceInfo: String,
    ipAddress: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String,
    notes: String,
    tags: [String]
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
attendanceSchema.index({ event: 1, user: 1 }, { unique: true });
attendanceSchema.index({ event: 1, status: 1 });
attendanceSchema.index({ user: 1, status: 1 });
attendanceSchema.index({ 'checkInData.checkedIn': 1 });

// Middleware pre-save para validaciones
attendanceSchema.pre('save', async function(next) {
  // Verificar que el usuario no esté ya registrado en el evento
  if (this.isNew) {
    const existingAttendance = await mongoose.model('Attendance').findOne({
      event: this.event,
      user: this.user
    });
    
    if (existingAttendance) {
      return next(new Error('El usuario ya está registrado en este evento'));
    }
    
    // Verificar capacidad del evento
    const event = await mongoose.model('Event').findById(this.event);
    if (event) {
      const currentAttendees = await mongoose.model('Attendance').countDocuments({
        event: this.event,
        status: { $in: ['registered', 'confirmed', 'attended'] }
      });
      
      if (currentAttendees >= event.capacidad) {
        return next(new Error('El evento ha alcanzado su capacidad máxima'));
      }
    }
  }
  
  // Actualizar fechas según el estado
  if (this.isModified('status')) {
    switch (this.status) {
      case 'confirmed':
        this.confirmationDate = new Date();
        break;
      case 'attended':
        this.attendanceDate = new Date();
        break;
    }
  }
  
  next();
});

// Método para confirmar asistencia
attendanceSchema.methods.confirmAttendance = function() {
  if (this.status !== 'registered') {
    throw new Error('Solo se pueden confirmar registros pendientes');
  }
  
  this.status = 'confirmed';
  this.confirmationDate = new Date();
  return this.save();
};

// Método para realizar check-in
attendanceSchema.methods.checkIn = function(checkInData) {
  if (this.status !== 'confirmed') {
    throw new Error('Solo se puede hacer check-in a asistencias confirmadas');
  }
  
  if (this.checkInData.checkedIn) {
    throw new Error('Ya se realizó check-in para esta asistencia');
  }
  
  this.status = 'attended';
  this.attendanceDate = new Date();
  this.checkInData = {
    ...this.checkInData,
    checkedIn: true,
    checkedInAt: new Date(),
    ...checkInData
  };
  
  return this.save();
};

// Método para cancelar asistencia
attendanceSchema.methods.cancelAttendance = function(reason = 'Cancelación de asistencia') {
  if (this.status === 'attended') {
    throw new Error('No se puede cancelar una asistencia ya completada');
  }
  
  this.status = 'cancelled';
  this.metadata.notes = reason;
  return this.save();
};

// Método para marcar como no-show
attendanceSchema.methods.markNoShow = function() {
  if (this.status !== 'confirmed') {
    throw new Error('Solo se pueden marcar como no-show asistencias confirmadas');
  }
  
  this.status = 'no_show';
  return this.save();
};

// Método estático para obtener estadísticas de un evento
attendanceSchema.statics.getEventStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    registered: 0,
    confirmed: 0,
    attended: 0,
    no_show: 0,
    cancelled: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

export default mongoose.model('Attendance', attendanceSchema);




