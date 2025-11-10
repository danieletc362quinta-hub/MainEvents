import MercadoPagoPayment from '../models/mercadopago.model.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import EmailService from '../services/email.service.js';
import {
  createPaymentPreference,
  processWebhook,
  getPaymentInfo,
  refundPayment as refundPaymentMP,
  generateTicketId,
  generateQRCode,
  validateTicket as validateTicketQR,
  formatPriceForMP,
  formatPriceForDisplay,
  createMPItems,
  createPayer,
  validatePaymentStatus,
  TICKET_TYPES,
  DEFAULT_PRICES
} from '../config/mercadopago.js';

// Crear preferencia de pago
export const createMPPayment = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, currency, customPrice, discountCode, backUrls } = req.body;
    const userId = req.user.userId;

    // Validar que el evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Validar disponibilidad de tickets
    const availability = await MercadoPagoPayment.validateTicketAvailability(eventId, ticketType, quantity);
    if (!availability.canPurchase) {
      return res.status(400).json({ 
        error: 'No hay suficientes tickets disponibles',
        available: availability.available,
        requested: availability.requested
      });
    }

    // Obtener información del usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular precio
    const basePrice = customPrice || DEFAULT_PRICES[ticketType] || 25000;
    const totalAmount = basePrice * quantity;

    // Generar ID único para el ticket
    const ticketId = generateTicketId();
    const qrCode = generateQRCode(ticketId, eventId, userId);

    // Crear referencia externa
    const externalReference = `TKT-${eventId}-${userId}-${Date.now()}`;

    // Crear items para Mercado Pago
    const items = createMPItems(event, ticketType, quantity, customPrice);
    const payer = createPayer(user);

    // URLs de retorno
    const defaultBackUrls = {
      success: `${process.env.FRONTEND_URL}/payment/success?reference=${externalReference}`,
      failure: `${process.env.FRONTEND_URL}/payment/failure?reference=${externalReference}`,
      pending: `${process.env.FRONTEND_URL}/payment/pending?reference=${externalReference}`
    };

    // Crear preferencia de pago
    const preference = await createPaymentPreference({
      items,
      payer,
      external_reference: externalReference,
      notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      back_urls: backUrls || defaultBackUrls,
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });

    // Guardar información del pago en la base de datos
    const payment = new MercadoPagoPayment({
      user: userId,
      event: eventId,
      mpPreferenceId: preference.id,
      mpExternalReference: externalReference,
      amount: totalAmount,
      currency: currency || 'ARS',
      status: 'pending',
      ticket: {
        ticketId,
        qrCode
      },
      metadata: {
        ticketType,
        quantity,
        discountCode,
        customPrice
      },
      backUrls: backUrls || defaultBackUrls
    });

    await payment.save();

    res.json({
      message: 'Preferencia de pago creada exitosamente',
      preference: {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      },
      payment: {
        id: payment._id,
        ticketId,
        amount: formatPriceForDisplay(totalAmount, currency || 'ARS'),
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Error creating MP payment:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
};

// Confirmar pago (para desarrollo/testing)
export const confirmMPPayment = async (req, res) => {
  try {
    const { paymentId, preferenceId } = req.body;
    const userId = req.user.userId;

    // Obtener información del pago desde Mercado Pago
    const mpPayment = await getPaymentInfo(paymentId);
    
    // Buscar el pago en nuestra base de datos
    const payment = await MercadoPagoPayment.findByMPPaymentId(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el pago pertenece al usuario
    if (payment.user.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para confirmar este pago' });
    }

    // Actualizar estado del pago
    const statusValidation = validatePaymentStatus(mpPayment);
    await payment.updateStatus(statusValidation.status, mpPayment.status_detail);

    // Si el pago fue aprobado, actualizar información adicional
    if (statusValidation.status === 'approved') {
      payment.mpData.paymentMethod = mpPayment.payment_method?.type || null;
      payment.mpData.installments = mpPayment.installments || 1;
      payment.mpData.transactionAmount = mpPayment.transaction_amount;
      payment.mpData.transactionDetails = {
        paymentMethodId: mpPayment.payment_method?.id,
        paymentTypeId: mpPayment.payment_type_id,
        installments: mpPayment.installments
      };
      await payment.save();
    }

    res.json({
      message: 'Pago confirmado exitosamente',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: formatPriceForDisplay(payment.amount, payment.currency),
        ticketId: payment.ticket.ticketId
      }
    });

  } catch (error) {
    console.error('Error confirming MP payment:', error);
    res.status(500).json({ error: 'Error al confirmar pago' });
  }
};

// Webhook de Mercado Pago
export const mpWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Procesar webhook
    const processedWebhook = await processWebhook(webhookData);
    
    if (processedWebhook.type === 'payment') {
      const paymentId = processedWebhook.data.id;
      
      // Obtener información del pago desde Mercado Pago
      const mpPayment = await getPaymentInfo(paymentId);
      
      // Buscar el pago en nuestra base de datos
      const payment = await MercadoPagoPayment.findByMPPaymentId(paymentId);
      
      if (payment) {
        // Actualizar estado del pago
        const statusValidation = validatePaymentStatus(mpPayment);
        await payment.updateStatus(statusValidation.status, mpPayment.status_detail);
        
        // Si el pago fue aprobado, actualizar información adicional
        if (statusValidation.status === 'approved') {
          payment.mpData.paymentMethod = mpPayment.payment_method?.type || null;
          payment.mpData.installments = mpPayment.installments || 1;
          payment.mpData.transactionAmount = mpPayment.transaction_amount;
          payment.mpData.transactionDetails = {
            paymentMethodId: mpPayment.payment_method?.id,
            paymentTypeId: mpPayment.payment_type_id,
            installments: mpPayment.installments
          };
          await payment.save();
          
          // Enviar email de confirmación de ticket
          try {
            const user = await User.findById(payment.user);
            const event = await Event.findById(payment.event);
            
            if (user && event) {
              await EmailService.sendTicketConfirmation(user.email, {
                eventName: event.name,
                eventDate: event.date,
                eventLocation: event.location,
                ticketId: payment.ticket.ticketId,
                amount: formatPriceForDisplay(payment.amount, payment.currency),
                qrCode: payment.ticket.qrCode,
                ticketType: payment.metadata.ticketType,
                quantity: payment.metadata.quantity
              });
              console.log(`✅ Email de confirmación de ticket enviado a ${user.email}`);
            }
          } catch (emailError) {
            console.error('❌ Error al enviar email de confirmación de ticket:', emailError);
            // No fallar el proceso si el email falla
          }
          
          console.log(`✅ Pago aprobado: ${paymentId} - Ticket: ${payment.ticket.ticketId}`);
        }
      }
    }
    
    res.status(200).json({ message: 'Webhook procesado exitosamente' });
    
  } catch (error) {
    console.error('Error processing MP webhook:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

// Validar ticket (endpoint para organizadores)
export const validateMPTicket = async (req, res) => {
  try {
    const { ticketId, qrCode } = req.body;
    const validatorId = req.user.userId;

    // Buscar el ticket
    const payment = await MercadoPagoPayment.findByTicketId(ticketId);
    if (!payment) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Validar que el pago fue exitoso
    if (payment.status !== 'approved') {
      return res.status(400).json({ 
        error: 'Ticket no válido - pago pendiente',
        status: payment.status 
      });
    }

    // Validar que el ticket no ha sido usado
    if (!payment.ticket.isValid) {
      return res.status(400).json({ 
        error: 'Ticket ya ha sido usado',
        usedAt: payment.ticket.usedAt,
        usedBy: payment.ticket.usedBy
      });
    }

    // Validar código QR
    const qrValidation = validateTicketQR(qrCode);
    if (!qrValidation.isValid) {
      return res.status(400).json({ error: 'Código QR inválido' });
    }

    // Marcar ticket como usado
    await payment.useTicket(validatorId);

    // Obtener información del evento
    const event = await Event.findById(payment.event);
    const user = await User.findById(payment.user);

    res.json({
      message: 'Ticket validado exitosamente',
      ticket: {
        id: payment._id,
        ticketId: payment.ticket.ticketId,
        event: {
          name: event?.name,
          date: event?.date,
          location: event?.location
        },
        user: {
          name: user?.name,
          email: user?.email
        },
        ticketType: payment.metadata.ticketType,
        validatedAt: payment.ticket.usedAt,
        validatedBy: validatorId
      }
    });

  } catch (error) {
    console.error('Error validating MP ticket:', error);
    res.status(500).json({ error: 'Error al validar ticket' });
  }
};

// Obtener tickets del usuario
export const getUserMPTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const payments = await MercadoPagoPayment.find(query)
      .populate('event', 'name date location image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await MercadoPagoPayment.countDocuments(query);

    res.json({
      tickets: payments.map(payment => ({
        id: payment._id,
        ticketId: payment.ticket.ticketId,
        qrCode: payment.ticket.qrCode,
        status: payment.status,
        ticketStatus: payment.ticketStatus,
        event: payment.event,
        ticketType: payment.metadata.ticketType,
        quantity: payment.metadata.quantity,
        amount: formatPriceForDisplay(payment.amount, payment.currency),
        purchasedAt: payment.createdAt,
        usedAt: payment.ticket.usedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting user MP tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

// Obtener estadísticas de pagos (para organizadores/admins)
export const getMPPaymentStats = async (req, res) => {
  try {
    const { eventId, startDate, endDate, groupBy = 'day' } = req.query;
    const userId = req.user.userId;

    // Verificar permisos
    const user = await User.findById(userId);
    if (!['admin', 'organizer'].includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para ver estadísticas' });
    }

    const query = {};
    if (eventId) query.event = eventId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Solo pagos aprobados para estadísticas
    query.status = 'approved';

    const stats = await MercadoPagoPayment.getStats(query);
    const recentPayments = await MercadoPagoPayment.getPaymentsByStatus('approved', 10);

    res.json({
      stats: {
        totalRevenue: formatPriceForDisplay(stats.totalAmount, 'ARS'),
        totalTickets: stats.totalTickets,
        totalPayments: stats.totalPayments,
        averageTicketPrice: stats.totalTickets > 0 ? formatPriceForDisplay(stats.avgTicketPrice, 'ARS') : 0
      },
      recentPayments: recentPayments.map(payment => ({
        id: payment._id,
        ticketId: payment.ticket.ticketId,
        amount: formatPriceForDisplay(payment.amount, payment.currency),
        user: payment.user,
        event: payment.event,
        createdAt: payment.createdAt
      }))
    });

  } catch (error) {
    console.error('Error getting MP payment stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Reembolsar pago
export const refundMPPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason, description } = req.body;
    const userId = req.user.userId;

    // Verificar permisos
    const user = await User.findById(userId);
    if (!['admin', 'organizer'].includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar reembolsos' });
    }

    const payment = await MercadoPagoPayment.findByMPPaymentId(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el pago fue exitoso
    if (payment.status !== 'approved') {
      return res.status(400).json({ error: 'Solo se pueden reembolsar pagos aprobados' });
    }

    // Verificar que no ha sido reembolsado
    if (payment.mpData.refunded) {
      return res.status(400).json({ error: 'Pago ya ha sido reembolsado' });
    }

    // Procesar reembolso en Mercado Pago
    const refundAmount = amount || payment.amount;
    const mpRefund = await refundPaymentMP(paymentId, refundAmount);

    // Actualizar pago en nuestra base de datos
    await payment.processRefund(refundAmount);

    res.json({
      message: 'Reembolso procesado exitosamente',
      refund: {
        id: mpRefund.id,
        amount: formatPriceForDisplay(refundAmount, payment.currency),
        reason,
        description,
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error processing MP refund:', error);
    res.status(500).json({ error: 'Error al procesar reembolso' });
  }
};

// Buscar pagos
export const searchMPPayments = async (req, res) => {
  try {
    const { eventId, userId, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.userId;

    // Verificar permisos
    const user = await User.findById(currentUserId);
    if (!['admin', 'organizer'].includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para buscar pagos' });
    }

    const query = {};
    if (eventId) query.event = eventId;
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await MercadoPagoPayment.find(query)
      .populate('user', 'name email')
      .populate('event', 'name date location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await MercadoPagoPayment.countDocuments(query);

    res.json({
      payments: payments.map(payment => ({
        id: payment._id,
        mpPaymentId: payment.mpPaymentId,
        ticketId: payment.ticket.ticketId,
        status: payment.status,
        amount: formatPriceForDisplay(payment.amount, payment.currency),
        user: payment.user,
        event: payment.event,
        ticketType: payment.metadata.ticketType,
        quantity: payment.metadata.quantity,
        createdAt: payment.createdAt,
        usedAt: payment.ticket.usedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error searching MP payments:', error);
    res.status(500).json({ error: 'Error al buscar pagos' });
  }
};

// Obtener información de un pago específico
export const getMPPaymentInfo = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;

    const payment = await MercadoPagoPayment.findById(paymentId)
      .populate('user', 'name email')
      .populate('event', 'name date location image');

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar permisos
    const user = await User.findById(userId);
    if (payment.user._id.toString() !== userId && !['admin', 'organizer'].includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para ver este pago' });
    }

    res.json({
      payment: {
        id: payment._id,
        mpPaymentId: payment.mpPaymentId,
        ticketId: payment.ticket.ticketId,
        qrCode: payment.ticket.qrCode,
        status: payment.status,
        statusDetail: payment.statusDetail,
        amount: formatPriceForDisplay(payment.amount, payment.currency),
        user: payment.user,
        event: payment.event,
        ticketType: payment.metadata.ticketType,
        quantity: payment.metadata.quantity,
        ticketStatus: payment.ticketStatus,
        mpData: payment.mpData,
        createdAt: payment.createdAt,
        usedAt: payment.ticket.usedAt
      }
    });

  } catch (error) {
    console.error('Error getting MP payment info:', error);
    res.status(500).json({ error: 'Error al obtener información del pago' });
  }
}; 