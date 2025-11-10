import Participant from '../models/participant.model.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
// import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

// Registrar participante en un evento
export const registerParticipant = async (req, res) => {
  try {
    // Validación será manejada por los middlewares de Zod

    const { eventId, registrationData, ticket, payment } = req.body;

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

    // Verificar capacidad disponible
    const currentParticipants = await Participant.countDocuments({
      event: eventId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (currentParticipants + ticket.quantity > event.capacidad) {
      return res.status(400).json({
        success: false,
        message: 'No hay suficiente capacidad disponible'
      });
    }

    // Verificar si el usuario ya está registrado
    const existingParticipant = await Participant.findOne({
      event: eventId,
      user: req.user.id
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás registrado en este evento'
      });
    }

    const participantData = {
      event: eventId,
      user: req.user.id,
      registrationData,
      ticket,
      payment,
      metadata: {
        source: req.headers['user-agent'] ? 'web' : 'api',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer
      }
    };

    const participant = new Participant(participantData);
    await participant.save();

    // Actualizar estadísticas del evento
    await Event.findByIdAndUpdate(eventId, {
      $inc: { 'statistics.totalParticipants': ticket.quantity }
    });

    logger.info(`Participante registrado en evento ${eventId} por usuario ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      data: participant
    });
  } catch (error) {
    logger.error('Error al registrar participante:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás registrado en este evento'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener participantes de un evento
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'registrationDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { event: eventId };
    
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const participants = await Participant.find(query)
      .populate('user', 'name email')
      .populate('event', 'name date location')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Participant.countDocuments(query);

    res.json({
      success: true,
      data: participants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error al obtener participantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener participantes de un usuario
export const getUserParticipants = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'registrationDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: userId };
    
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const participants = await Participant.find(query)
      .populate('event', 'name date location image')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Participant.countDocuments(query);

    res.json({
      success: true,
      data: participants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error al obtener participantes del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener participante por ID
export const getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'name date location image')
      .populate('checkIn.checkedInBy', 'name email');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo el participante, organizador del evento o admin)
    const event = await Event.findById(participant.event);
    const isOwner = participant.user._id.toString() === req.user.id;
    const isEventOrganizer = event.organizer === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este participante'
      });
    }

    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    logger.error('Error al obtener participante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Confirmar participante
export const confirmParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    const event = await Event.findById(participant.event);
    const isEventOrganizer = event.organizer === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para confirmar este participante'
      });
    }

    await participant.confirm();

    logger.info(`Participante confirmado: ${participant.ticket.ticketNumber}`);

    res.json({
      success: true,
      message: 'Participante confirmado exitosamente'
    });
  } catch (error) {
    logger.error('Error al confirmar participante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cancelar participante
export const cancelParticipant = async (req, res) => {
  try {
    const { reason } = req.body;
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo el participante, organizador del evento o admin)
    const event = await Event.findById(participant.event);
    const isOwner = participant.user.toString() === req.user.id;
    const isEventOrganizer = event.organizer === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar este participante'
      });
    }

    await participant.cancel(reason);

    logger.info(`Participante cancelado: ${participant.ticket.ticketNumber}, razón: ${reason}`);

    res.json({
      success: true,
      message: 'Participante cancelado exitosamente'
    });
  } catch (error) {
    logger.error('Error al cancelar participante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Registrar check-in
export const checkInParticipant = async (req, res) => {
  try {
    const { location } = req.body;
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    const event = await Event.findById(participant.event);
    const isEventOrganizer = event.organizer === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para registrar check-in'
      });
    }

    await participant.checkIn(location, req.user.id);

    logger.info(`Check-in registrado para participante: ${participant.ticket.ticketNumber}`);

    res.json({
      success: true,
      message: 'Check-in registrado exitosamente'
    });
  } catch (error) {
    logger.error('Error al registrar check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar como no asistió
export const markAsNoShow = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    const event = await Event.findById(participant.event);
    const isEventOrganizer = event.organizer === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para marcar como no asistió'
      });
    }

    await participant.markAsNoShow();

    logger.info(`Participante marcado como no asistió: ${participant.ticket.ticketNumber}`);

    res.json({
      success: true,
      message: 'Participante marcado como no asistió'
    });
  } catch (error) {
    logger.error('Error al marcar como no asistió:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Enviar feedback
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    // Verificar permisos (solo el participante)
    if (participant.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar feedback'
      });
    }

    await participant.submitFeedback(rating, comment);

    logger.info(`Feedback enviado por participante: ${participant.ticket.ticketNumber}`);

    res.json({
      success: true,
      message: 'Feedback enviado exitosamente'
    });
  } catch (error) {
    logger.error('Error al enviar feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de participantes de un evento
export const getEventParticipantStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await Participant.getEventStats(eventId);

    const totalParticipants = await Participant.countDocuments({ event: eventId });
    const confirmedParticipants = await Participant.countDocuments({
      event: eventId,
      status: 'confirmed'
    });
    const attendedParticipants = await Participant.countDocuments({
      event: eventId,
      status: 'attended'
    });

    res.json({
      success: true,
      data: {
        total: totalParticipants,
        confirmed: confirmedParticipants,
        attended: attendedParticipants,
        byStatus: stats
      }
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas de participantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar participante por número de ticket
export const searchParticipantByTicket = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const participant = await Participant.findOne({
      'ticket.ticketNumber': ticketNumber
    })
      .populate('user', 'name email')
      .populate('event', 'name date location');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participante no encontrado'
      });
    }

    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    logger.error('Error al buscar participante por ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
