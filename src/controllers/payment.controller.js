import Payment from '../models/payment.model.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import Attendance from '../models/attendance.model.js';
import Ticket from '../models/ticket.model.js';
import { logger } from '../utils/logger.js';
import emailService from '../services/email.service.js';

// Obtener pagos del usuario
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('event', 'name date location image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
};

// Obtener pago por ID
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findOne({ 
      paymentId, 
      user: userId 
    })
      .populate('event', 'name date location image description')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error getting payment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago'
    });
  }
};

// Crear solicitud de reembolso
export const requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findOne({ 
      paymentId, 
      user: userId 
    }).populate('event', 'name date location');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reembolsar pagos completados'
      });
    }

    // Verificar que el evento no haya pasado (política de reembolso)
    const eventDate = new Date(payment.event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden solicitar reembolsos con menos de 24 horas de anticipación al evento'
      });
    }

    const refundAmount = amount || payment.amount;

    // Procesar reembolso
    await payment.processRefund({
      amount: refundAmount,
      reason: reason || 'Solicitud de reembolso',
      requestedBy: userId,
      notes: `Reembolso solicitado por el usuario`
    });

    // Enviar notificación por email
    try {
      const user = await User.findById(userId);
      await emailService.sendEmail(user.email, 'Solicitud de Reembolso - MainEvents', 'refund-requested', {
        userName: user.name,
        eventName: payment.event.name,
        paymentId: payment.paymentId,
        refundAmount: refundAmount,
        reason: reason || 'Solicitud de reembolso'
      });
    } catch (emailError) {
      logger.warn('Error sending refund notification email:', emailError);
    }

    logger.info('Refund requested successfully', {
      paymentId,
      userId,
      refundAmount,
      reason
    });

    res.json({
      success: true,
      message: 'Solicitud de reembolso enviada exitosamente',
      data: {
        paymentId: payment.paymentId,
        refundAmount,
        status: 'pending',
        requestedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error requesting refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al solicitar reembolso'
    });
  }
};

// Obtener reembolsos del usuario
export const getUserRefunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ 
      user: userId,
      'refunds.0': { $exists: true }
    })
      .populate('event', 'name date location image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filtrar reembolsos por estado si se especifica
    let filteredPayments = payments;
    if (status) {
      filteredPayments = payments.map(payment => {
        const filteredRefunds = payment.refunds.filter(refund => refund.status === status);
        return {
          ...payment.toObject(),
          refunds: filteredRefunds
        };
      }).filter(payment => payment.refunds.length > 0);
    }

    res.json({
      success: true,
      data: filteredPayments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(payments.length / limit),
        total: payments.length
      }
    });
  } catch (error) {
    logger.error('Error getting user refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reembolsos'
    });
  }
};

// Obtener estadísticas de pagos
export const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;

    const stats = await Payment.getPaymentStats(userId, dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de pagos'
    });
  }
};

// Procesar pago (para integración con MercadoPago)
export const processPayment = async (req, res) => {
  try {
    const { eventId, amount, paymentMethod, billingInfo } = req.body;
    const userId = req.user._id;

    // Verificar que el evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Crear registro de pago
    const payment = new Payment({
      user: userId,
      event: eventId,
      amount: amount || event.price || 0,
      paymentMethod,
      billingInfo,
      metadata: {
        source: 'web',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referer')
      }
    });

    await payment.save();

    // Aquí integrarías con MercadoPago o el proveedor de pagos
    // Por ahora, simularemos un pago exitoso
    payment.status = 'completed';
    payment.providerTransactionId = `TXN-${Date.now()}`;
    payment.providerPaymentId = `PAY-${Date.now()}`;
    await payment.save();

    // Crear registro de asistencia
    const attendance = new Attendance({
      event: eventId,
      user: userId,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    await attendance.save();

    // Crear ticket
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      originalUser: userId,
      ticketType: 'general',
      quantity: 1,
      price: payment.amount,
      totalAmount: payment.amount,
      paymentId: payment.paymentId,
      status: 'confirmed'
    });

    await ticket.save();

    logger.info('Payment processed successfully', {
      paymentId: payment.paymentId,
      eventId,
      userId,
      amount: payment.amount
    });

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        attendanceId: attendance._id,
        ticketId: ticket.ticketId
      }
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar pago'
    });
  }
};

// Obtener pagos de un evento (para organizadores)
export const getEventPayments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Verificar que el usuario es organizador del evento
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (event.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver los pagos de este evento'
      });
    }

    const payments = await Payment.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .flatMap(p => p.refunds)
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    res.json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          totalRevenue,
          totalRefunded,
          netRevenue: totalRevenue - totalRefunded
        }
      }
    });
  } catch (error) {
    logger.error('Error getting event payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos del evento'
    });
  }
};

