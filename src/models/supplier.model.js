import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del proveedor es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
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
  services: [{
    type: String,
    required: true,
    enum: [
      'dj', 'musica', 'iluminacion', 'sonido', 'catering', 
      'decoracion', 'fotografia', 'video', 'animacion', 
      'seguridad', 'transporte', 'alquiler', 'otros'
    ]
  }],
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  contact: {
    type: String,
    required: [true, 'El contacto es obligatorio'],
    trim: true,
    maxlength: [200, 'El contacto no puede exceder los 200 caracteres']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Argentina' }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, default: Date.now }
  }],
  portfolio: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    eventType: { type: String, required: true },
    date: { type: Date, required: true }
  }],
  availability: {
    isAvailable: { type: Boolean, default: true },
    schedule: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: { type: String },
      endTime: { type: String }
    }],
    blackoutDates: [{ type: Date }]
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'ARS' },
    pricingType: { 
      type: String, 
      enum: ['hourly', 'daily', 'event', 'package'], 
      default: 'event' 
    },
    packages: [{
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true, min: 0 },
      includes: [{ type: String }]
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    documents: [{
      type: { type: String, enum: ['id', 'business_license', 'insurance', 'other'] },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  socialMedia: {
    website: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String }
  },
  statistics: {
    totalEvents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // en horas
    completionRate: { type: Number, default: 0 } // porcentaje
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
supplierSchema.index({ name: 'text', description: 'text', services: 'text' });
supplierSchema.index({ status: 1, 'availability.isAvailable': 1 });
supplierSchema.index({ 'rating.average': -1 });
supplierSchema.index({ services: 1 });
supplierSchema.index({ createdBy: 1 });

// Virtual para calcular el rating promedio
supplierSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Middleware para actualizar estadísticas antes de guardar
supplierSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating.average = this.averageRating;
    this.rating.count = this.reviews.length;
  }
  this.lastActive = new Date();
  next();
});

// Método para agregar una reseña
supplierSchema.methods.addReview = function(userId, rating, comment) {
  // Verificar si el usuario ya dejó una reseña
  const existingReview = this.reviews.find(review => review.user.toString() === userId.toString());
  if (existingReview) {
    throw new Error('Ya has dejado una reseña para este proveedor');
  }
  
  this.reviews.push({
    user: userId,
    rating,
    comment,
    date: new Date()
  });
  
  return this.save();
};

// Método para actualizar disponibilidad
supplierSchema.methods.updateAvailability = function(isAvailable, schedule = [], blackoutDates = []) {
  this.availability.isAvailable = isAvailable;
  this.availability.schedule = schedule;
  this.availability.blackoutDates = blackoutDates;
  return this.save();
};

// Método para verificar disponibilidad en una fecha específica
supplierSchema.methods.isAvailableOnDate = function(date) {
  if (!this.availability.isAvailable) return false;
  
  const checkDate = new Date(date);
  const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Verificar si está en fechas bloqueadas
  const isBlackedOut = this.availability.blackoutDates.some(blackoutDate => 
    new Date(blackoutDate).toDateString() === checkDate.toDateString()
  );
  
  if (isBlackedOut) return false;
  
  // Verificar horario de disponibilidad
  const daySchedule = this.availability.schedule.find(s => s.day === dayOfWeek);
  if (!daySchedule) return false;
  
  return true;
};

// Método estático para buscar proveedores por servicios
supplierSchema.statics.findByServices = function(services, options = {}) {
  const query = {
    status: 'active',
    'availability.isAvailable': true,
    services: { $in: services }
  };
  
  return this.find(query, null, options);
};

// Método estático para obtener proveedores mejor calificados
supplierSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit);
};

export default mongoose.model('Supplier', supplierSchema);
