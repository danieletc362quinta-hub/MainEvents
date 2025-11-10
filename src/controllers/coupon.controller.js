import Coupon from '../models/coupon.model.js';
import { createCouponSchema, validateCouponSchema } from '../schemas/coupon.schemas.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';

// Crear un nuevo cupón
export const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user.id
    };

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser
      }
    });
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Validar un cupón
export const validateCoupon = async (req, res) => {
  try {
    const { error, value } = validateSchema(validateCouponSchema, req.body);
    if (error) {
      return res.status(400).json({ error: 'Datos inválidos', details: error });
    }

    const { code, eventId, amount } = value;

    try {
      const coupon = await Coupon.findValidCoupon(code, req.user.id, eventId, amount);
      
      if (!coupon) {
        return res.status(404).json({
          error: 'Cupón no encontrado o no válido'
        });
      }

      const discount = coupon.calculateDiscount(amount);
      const finalAmount = amount - discount;

      res.json({
        success: true,
        message: 'Cupón válido',
        coupon: {
          id: coupon._id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          maxDiscount: coupon.maxDiscount
        },
        discount,
        originalAmount: amount,
        finalAmount
      });
    } catch (validationError) {
      res.status(400).json({
        error: 'Cupón no válido',
        message: validationError.message
      });
    }
  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener todos los cupones activos
export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getActiveCoupons();
    
    res.json({
      success: true,
      message: 'Cupones activos obtenidos',
      coupons: coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        currentUses: coupon.currentUses,
        maxUses: coupon.maxUses
      }))
    });
  } catch (error) {
    console.error('❌ Error getting active coupons:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener cupones por usuario
export const getUserCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      $or: [
        { applicableUsers: req.user.id },
        { applicableUsers: { $size: 0 } } // Cupones para todos los usuarios
      ],
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Cupones del usuario obtenidos',
      coupons: coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        validUntil: coupon.validUntil,
        minPurchase: coupon.minPurchase,
        applicableCategories: coupon.applicableCategories
      }))
    });
  } catch (error) {
    console.error('❌ Error getting user coupons:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener estadísticas de cupones
export const getCouponStats = async (req, res) => {
  try {
    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $lte: ['$validFrom', new Date()] },
                    { $gte: ['$validUntil', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalUses: { $sum: '$currentUses' },
          expiredCoupons: {
            $sum: {
              $cond: [
                { $lt: ['$validUntil', new Date()] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const typeStats = await Coupon.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUses: { $sum: '$currentUses' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Estadísticas de cupones obtenidas',
      stats: stats[0] || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUses: 0,
        expiredCoupons: 0
      },
      typeStats
    });
  } catch (error) {
    console.error('❌ Error getting coupon stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Desactivar un cupón
export const deactivateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        error: 'Cupón no encontrado'
      });
    }

    // Solo el creador o un admin puede desactivar el cupón
    if (coupon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para desactivar este cupón'
      });
    }

    coupon.isActive = false;
    await coupon.save();

    res.json({
      success: true,
      message: 'Cupón desactivado exitosamente',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        isActive: coupon.isActive
      }
    });
  } catch (error) {
    console.error('❌ Error deactivating coupon:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener historial de uso de un cupón
export const getCouponUsageHistory = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId)
      .populate('usedBy.user', 'name email')
      .populate('usedBy.orderId', 'amount status');

    if (!coupon) {
      return res.status(404).json({
        error: 'Cupón no encontrado'
      });
    }

    // Solo el creador o un admin puede ver el historial
    if (coupon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'No tienes permisos para ver este historial'
      });
    }

    res.json({
      success: true,
      message: 'Historial de uso obtenido',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        currentUses: coupon.currentUses,
        maxUses: coupon.maxUses
      },
      usageHistory: coupon.usedBy.map(usage => ({
        user: usage.user,
        order: usage.orderId,
        usedAt: usage.usedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error getting coupon usage history:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}; 