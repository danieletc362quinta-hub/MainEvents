import Ticket from '../models/ticket.model.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import { logger } from '../utils/logger.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import emailService from '../services/email.service.js';

// Obtener tickets del usuario
export const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'name date location image')
      .populate('originalUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    logger.error('Error getting user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets'
    });
  }
};

// Obtener ticket por ID
export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'name date location image description')
      .populate('user', 'name email')
      .populate('originalUser', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error getting ticket by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ticket'
    });
  }
};

// Transferir ticket
export const transferTicket = async (req, res) => {
  try {
    const { ticketId, email, reason } = req.body;
    const currentUserId = req.user._id;

    // Buscar el ticket
    const ticket = await Ticket.findOne({ ticketId, user: currentUserId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado o no tienes permisos'
      });
    }

    // Buscar el usuario destinatario
    const recipientUser = await User.findOne({ email });
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario destinatario no encontrado'
      });
    }

    // Validar que no sea el mismo usuario
    if (recipientUser._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes transferir el ticket a ti mismo'
      });
    }

    // Transferir el ticket
    await ticket.transferTicket(recipientUser._id, reason);

    // Enviar notificación por email
    try {
      await emailService.sendEmail(recipientUser.email, 'Ticket Transferido - MainEvents', 'ticket-transferred', {
        recipientName: recipientUser.name,
        senderName: req.user.name,
        eventName: ticket.event.name,
        ticketId: ticket.ticketId,
        reason: reason || 'Sin razón especificada'
      });
    } catch (emailError) {
      logger.warn('Error sending transfer notification email:', emailError);
    }

    logger.info('Ticket transferred successfully', {
      ticketId,
      fromUser: currentUserId,
      toUser: recipientUser._id
    });

    res.json({
      success: true,
      message: 'Ticket transferido exitosamente',
      data: {
        ticketId: ticket.ticketId,
        newOwner: recipientUser.name,
        transferredAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error transferring ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al transferir ticket'
    });
  }
};

// Descargar ticket en PDF
export const downloadTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    // Buscar el ticket
    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'name date location image description')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    // Verificar permisos (usuario actual o propietario original)
    const hasPermission = ticket.user._id.toString() === userId.toString() || 
                         ticket.originalUser.toString() === userId.toString();
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar este ticket'
      });
    }

    // Validar ticket
    const validation = ticket.validateTicket();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Ticket no válido: ${validation.reason}`
      });
    }

    // Registrar descarga
    ticket.downloadHistory.push({
      downloadedAt: new Date(),
      downloadedBy: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    await ticket.save();

    // Generar PDF
    const pdfBuffer = await generatePDF({
      ticketId: ticket.ticketId,
      eventName: ticket.event.name,
      eventDate: ticket.event.date,
      eventLocation: ticket.event.location,
      userName: ticket.user.name,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      price: ticket.price,
      qrCode: ticket.qrCode,
      status: ticket.status
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Ticket downloaded successfully', {
      ticketId,
      userId,
      ip: req.ip
    });
  } catch (error) {
    logger.error('Error downloading ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF del ticket'
    });
  }
};

// Validar ticket (para check-in)
export const validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'name date location')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    const validation = ticket.validateTicket();
    
    res.json({
      success: true,
      data: {
        ticket,
        validation
      }
    });
  } catch (error) {
    logger.error('Error validating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar ticket'
    });
  }
};

// Check-in de ticket
export const checkInTicket = async (req, res) => {
  try {
    const { ticketId, location, deviceInfo } = req.body;
    const checkInBy = req.user._id;

    const ticket = await Ticket.findOne({ ticketId })
      .populate('event', 'name date location')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    // Validar ticket
    const validation = ticket.validateTicket();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Ticket no válido: ${validation.reason}`
      });
    }

    // Realizar check-in
    await ticket.checkIn({
      checkedInBy: checkInBy,
      location: location || 'Entrada principal',
      deviceInfo: deviceInfo || req.get('User-Agent')
    });

    logger.info('Ticket checked in successfully', {
      ticketId,
      userId: ticket.user._id,
      checkedInBy,
      location
    });

    res.json({
      success: true,
      message: 'Check-in realizado exitosamente',
      data: {
        ticketId: ticket.ticketId,
        eventName: ticket.event.name,
        userName: ticket.user.name,
        checkedInAt: ticket.checkInData.checkedInAt
      }
    });
  } catch (error) {
    logger.error('Error checking in ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al realizar check-in'
    });
  }
};

// Obtener estadísticas de tickets
export const getTicketStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Ticket.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          confirmedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          usedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
          },
          transferredTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'transferred'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTickets: 0,
      totalAmount: 0,
      confirmedTickets: 0,
      usedTickets: 0,
      transferredTickets: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error getting ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

