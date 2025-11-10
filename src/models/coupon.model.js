import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_one_get_one'],
    required: true
  },
  
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Para descuentos porcentuales (0-100)
  maxDiscount: {
    type: Number,
    min: 0,
    default: null
  },
  
  // Para descuentos fijos
  minPurchase: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Fechas de validez
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  // Límites de uso
  maxUses: {
    type: Number,
    min: 1,
    default: null
  },
  
  currentUses: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Uso por usuario
  maxUsesPerUser: {
    type: Number,
    min: 1,
    default: 1
  },
  
  // Usuarios que han usado el cupón
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  
  // Restricciones
  applicableEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  applicableCategories: [{
    type: String,
    enum: ['musical', 'deportivo', 'cultural', 'educativo', 'corporativo', 'publico', 'privado']
  }],
  
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Solo para usuarios nuevos
  newUsersOnly: {
    type: Boolean,
    default: false
  },
  
  // Solo para usuarios con cierta antigüedad
  minUserAge: {
    type: Number, // días desde el registro
    min: 0,
    default: 0
  },
  
  // Estado del cupón
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Creado por
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadatos
  metadata: {
    campaign: String,
    source: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ applicableEvents: 1 });
couponSchema.index({ 'usedBy.user': 1 });

// Métodos del modelo
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Verificar fechas
  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, reason: 'Cupón fuera de fecha de validez' };
  }
  
  // Verificar si está activo
  if (!this.isActive) {
    return { valid: false, reason: 'Cupón inactivo' };
  }
  
  // Verificar límite de usos
  if (this.maxUses && this.currentUses >= this.maxUses) {
    return { valid: false, reason: 'Cupón agotado' };
  }
  
  return { valid: true };
};

couponSchema.methods.canBeUsedBy = function(userId, eventId = null, amount = 0) {
  const validation = this.isValid();
  if (!validation.valid) {
    return validation;
  }
  
  // Verificar si el usuario ya usó el cupón el máximo de veces permitido
  const userUses = this.usedBy.filter(usage => usage.user.toString() === userId.toString()).length;
  if (userUses >= this.maxUsesPerUser) {
    return { valid: false, reason: 'Ya has usado este cupón el máximo de veces permitido' };
  }
  
  // Verificar monto mínimo de compra
  if (amount < this.minPurchase) {
    return { 
      valid: false, 
      reason: `Monto mínimo requerido: $${this.minPurchase}` 
    };
  }
  
  // Verificar eventos aplicables
  if (this.applicableEvents.length > 0 && eventId) {
    if (!this.applicableEvents.includes(eventId)) {
      return { valid: false, reason: 'Cupón no válido para este evento' };
    }
  }
  
  // Verificar usuarios aplicables
  if (this.applicableUsers.length > 0) {
    if (!this.applicableUsers.includes(userId)) {
      return { valid: false, reason: 'Cupón no válido para este usuario' };
    }
  }
  
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function(amount) {
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (amount * this.value) / 100;
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      break;
      
    case 'fixed':
      discount = Math.min(this.value, amount);
      break;
      
    case 'free_shipping':
      // Implementar lógica de envío gratuito
      discount = 0;
      break;
      
    case 'buy_one_get_one':
      // Implementar lógica BOGO
      discount = 0;
      break;
  }
  
  return Math.round(discount * 100) / 100; // Redondear a 2 decimales
};

couponSchema.methods.use = function(userId, orderId) {
  this.currentUses += 1;
  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
    orderId: orderId
  });
  
  return this.save();
};

// Métodos estáticos
couponSchema.statics.findValidCoupon = async function(code, userId, eventId = null, amount = 0) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });
  
  if (!coupon) {
    return null;
  }
  
  const canUse = coupon.canBeUsedBy(userId, eventId, amount);
  if (!canUse.valid) {
    throw new Error(canUse.reason);
  }
  
  return coupon;
};

couponSchema.statics.getActiveCoupons = function() {
  return this.find({
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  }).sort({ createdAt: -1 });
};

// Middleware para validar antes de guardar
couponSchema.pre('save', function(next) {
  // Validar que validUntil sea posterior a validFrom
  if (this.validUntil <= this.validFrom) {
    return next(new Error('La fecha de vencimiento debe ser posterior a la fecha de inicio'));
  }
  
  // Validar que el valor sea positivo
  if (this.value <= 0) {
    return next(new Error('El valor del cupón debe ser positivo'));
  }
  
  // Validar descuento porcentual
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('El descuento porcentual no puede ser mayor al 100%'));
  }
  
  next();
});

export default mongoose.model('Coupon', couponSchema); 