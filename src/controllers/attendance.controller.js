import Attendance from '../models/attendance.model.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import Ticket from '../models/ticket.model.js';
import { logger } from '../utils/logger.js';
import emailService from '../services/email.service.js';

// Registrar asistencia a un evento
export const registerAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { paymentId, amount, source = 'web' } = req.body;

    // Verificar que el evento existe y está activo
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (event.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        message: 'El evento no está disponible para registro'
      });
    }

    // Verificar que el evento no haya pasado
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'El evento ya ha pasado'
      });
    }

    // Crear registro de asistencia
    const attendance = new Attendance({
      event: eventId,
      user: userId,
      paymentId,
      amount: amount || event.price || 0,
      metadata: {
        source,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referer')
      }
    });

    await attendance.save();

    // Crear ticket si el pago fue exitoso
    if (paymentId && amount > 0) {
      const ticket = new Ticket({
        event: eventId,
        user: userId,
        originalUser: userId,
        ticketType: 'general',
        quantity: 1,
        price: amount,
        totalAmount: amount,
        paymentId,
        status: 'confirmed'
      });

      await ticket.save();
      attendance.ticket = ticket._id;
      attendance.paymentStatus = 'paid';
      await attendance.save();
    }

    // Enviar email de confirmación
    try {
      const user = await User.findById(userId);
      await emailService.sendEmail(user.email, 'Registro Confirmado - MainEvents', 'attendance-confirmed', {
        userName: user.name,
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        attendanceId: attendance._id
      });
    } catch (emailError) {
      logger.warn('Error sending attendance confirmation email:', emailError);
    }

    logger.info('Attendance registered successfully', {
      attendanceId: attendance._id,
      eventId,
      userId,
      paymentId
    });

    res.status(201).json({
      success: true,
      message: 'Registro de asistencia exitoso',
      data: {
        attendanceId: attendance._id,
        eventName: event.name,
        status: attendance.status,
        registrationDate: attendance.registrationDate
      }
    });
  } catch (error) {
    logger.error('Error registering attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar asistencia'
    });
  }
};

// Obtener asistencias del usuario
export const getUserAttendances = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const attendances = await Attendance.find(query)
      .populate('event', 'name date location image description')
      .populate('ticket', 'ticketId status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendances,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error getting user attendances:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias'
    });
  }
};

// Obtener asistencias de un evento (para organizadores)
export const getEventAttendances = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verificar que el usuario es organizador del evento
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver las asistencias de este evento'
      });
    }

    const query = { event: eventId };
    if (status) {
      query.status = status;
    }

    const attendances = await Attendance.find(query)
      .populate('user', 'name email avatar')
      .populate('ticket', 'ticketId status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendances,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error getting event attendances:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias del evento'
    });
  }
};

// Confirmar asistencia
export const confirmAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const userId = req.user._id;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      user: userId
    }).populate('event', 'name date location');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Asistencia no encontrada'
      });
    }

    await attendance.confirmAttendance();

    logger.info('Attendance confirmed', {
      attendanceId,
      userId,
      eventId: attendance.event._id
    });

    res.json({
      success: true,
      message: 'Asistencia confirmada exitosamente',
      data: {
        attendanceId: attendance._id,
        eventName: attendance.event.name,
        status: attendance.status,
        confirmationDate: attendance.confirmationDate
      }
    });
  } catch (error) {
    logger.error('Error confirming attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al confirmar asistencia'
    });
  }
};

// Realizar check-in
export const checkInAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { location, deviceInfo } = req.body;
    const checkInBy = req.user._id;

    const attendance = await Attendance.findById(attendanceId)
      .populate('event', 'name date location')
      .populate('user', 'name email');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Asistencia no encontrada'
      });
    }

    // Verificar que el usuario es organizador del evento
    const event = await Event.findById(attendance.event._id);
    if (event.user.toString() !== checkInBy.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para hacer check-in en este evento'
      });
    }

    await attendance.checkIn({
      checkedInBy: checkInBy,
      location: location || 'Entrada principal',
      deviceInfo: deviceInfo || req.get('User-Agent'),
      ipAddress: req.ip
    });

    logger.info('Attendance checked in', {
      attendanceId,
      userId: attendance.user._id,
      eventId: attendance.event._id,
      checkedInBy
    });

    res.json({
      success: true,
      message: 'Check-in realizado exitosamente',
      data: {
        attendanceId: attendance._id,
        eventName: attendance.event.name,
        userName: attendance.user.name,
        checkedInAt: attendance.checkInData.checkedInAt
      }
    });
  } catch (error) {
    logger.error('Error checking in attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al realizar check-in'
    });
  }
};

// Cancelar asistencia
export const cancelAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      user: userId
    }).populate('event', 'name date location');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Asistencia no encontrada'
      });
    }

    await attendance.cancelAttendance(reason);

    logger.info('Attendance cancelled', {
      attendanceId,
      userId,
      eventId: attendance.event._id,
      reason
    });

    res.json({
      success: true,
      message: 'Asistencia cancelada exitosamente',
      data: {
        attendanceId: attendance._id,
        eventName: attendance.event.name,
        status: attendance.status
      }
    });
  } catch (error) {
    logger.error('Error cancelling attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al cancelar asistencia'
    });
  }
};

// Obtener estadísticas de asistencia
export const getAttendanceStats = async (req, res) => {
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
        message: 'No tienes permisos para ver las estadísticas de este evento'
      });
    }

    const stats = await Attendance.getEventStats(eventId);
    const totalRevenue = await Attendance.aggregate([
      { $match: { event: event._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        capacity: event.capacidad,
        occupancyRate: event.capacidad > 0 ? (stats.total / event.capacidad * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('Error getting attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de asistencia'
    });
  }
};

