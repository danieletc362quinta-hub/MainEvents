import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import emailService from './email.service.js';
import { logger } from '../utils/logger.js';

class NotificationService {
  constructor() {
    this.channels = {
      in_app: this.sendInAppNotification.bind(this),
      email: this.sendEmailNotification.bind(this),
      push: this.sendPushNotification.bind(this),
      sms: this.sendSmsNotification.bind(this)
    };
  }

  // Crear notificación
  async createNotification(notificationData) {
    try {
      const notification = await Notification.createNotification(notificationData);
      
      // Enviar notificación a través de los canales especificados
      await this.sendNotification(notification);
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Enviar notificación a través de múltiples canales
  async sendNotification(notification) {
    const user = await User.findById(notification.user);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    for (const channel of notification.channels) {
      try {
        if (this.channels[channel]) {
          await this.channels[channel](notification, user);
        }
      } catch (error) {
        logger.error(`Error sending notification via ${channel}:`, error);
        // Continuar con otros canales aunque uno falle
      }
    }

    // Marcar como enviada
    notification.sentAt = new Date();
    await notification.save();
  }

  // Notificación en la aplicación
  async sendInAppNotification(notification, user) {
    // La notificación ya está guardada en la base de datos
    // Aquí podrías implementar WebSocket o Server-Sent Events
    logger.info('In-app notification sent', {
      userId: user._id,
      notificationId: notification._id,
      type: notification.type
    });
  }

  // Notificación por email
  async sendEmailNotification(notification, user) {
    if (!user.email) {
      throw new Error('Usuario no tiene email configurado');
    }

    const emailTemplate = this.getEmailTemplate(notification.type);
    
    await emailService.sendEmail(user.email, notification.title, emailTemplate, {
      userName: user.name,
      title: notification.title,
      message: notification.message,
      ...notification.data
    });

    logger.info('Email notification sent', {
      userId: user._id,
      email: user.email,
      notificationId: notification._id
    });
  }

  // Notificación push (simulada)
  async sendPushNotification(notification, user) {
    // Aquí integrarías con Firebase Cloud Messaging o similar
    logger.info('Push notification sent', {
      userId: user._id,
      notificationId: notification._id,
      type: notification.type
    });
  }

  // Notificación SMS (simulada)
  async sendSmsNotification(notification, user) {
    // Aquí integrarías con Twilio o similar
    logger.info('SMS notification sent', {
      userId: user._id,
      notificationId: notification._id,
      type: notification.type
    });
  }

  // Obtener template de email según el tipo
  getEmailTemplate(type) {
    const templates = {
      event_created: 'event-created',
      event_updated: 'event-updated',
      event_cancelled: 'event-cancelled',
      event_reminder: 'event-reminder',
      attendance_confirmed: 'attendance-confirmed',
      attendance_cancelled: 'attendance-cancelled',
      payment_completed: 'payment-completed',
      payment_failed: 'payment-failed',
      refund_requested: 'refund-requested',
      refund_processed: 'refund-processed',
      ticket_transferred: 'ticket-transferred',
      ticket_downloaded: 'ticket-downloaded',
      new_comment: 'new-comment',
      new_review: 'new-review',
      system_announcement: 'system-announcement',
      security_alert: 'security-alert'
    };

    return templates[type] || 'default';
  }

  // Notificaciones específicas por tipo
  async notifyEventCreated(event, organizer) {
    return await this.createNotification({
      user: organizer._id,
      type: 'event_created',
      title: 'Evento Creado Exitosamente',
      message: `Tu evento "${event.name}" ha sido creado y está disponible para registro.`,
      data: {
        eventId: event._id,
        eventName: event.name,
        eventDate: event.date
      },
      channels: ['in_app', 'email'],
      priority: 'medium',
      metadata: {
        source: 'system',
        category: 'event',
        relatedEntity: event._id,
        relatedEntityType: 'Event'
      }
    });
  }

  async notifyAttendanceConfirmed(attendance, user) {
    return await this.createNotification({
      user: user._id,
      type: 'attendance_confirmed',
      title: 'Asistencia Confirmada',
      message: `Tu asistencia al evento "${attendance.event.name}" ha sido confirmada.`,
      data: {
        eventId: attendance.event._id,
        eventName: attendance.event.name,
        eventDate: attendance.event.date,
        attendanceId: attendance._id
      },
      channels: ['in_app', 'email'],
      priority: 'medium',
      metadata: {
        source: 'system',
        category: 'event',
        relatedEntity: attendance._id,
        relatedEntityType: 'Attendance'
      }
    });
  }

  async notifyPaymentCompleted(payment, user) {
    return await this.createNotification({
      user: user._id,
      type: 'payment_completed',
      title: 'Pago Completado',
      message: `Tu pago de $${payment.amount} para el evento "${payment.event.name}" ha sido procesado exitosamente.`,
      data: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        eventName: payment.event.name,
        eventDate: payment.event.date
      },
      channels: ['in_app', 'email'],
      priority: 'high',
      metadata: {
        source: 'system',
        category: 'payment',
        relatedEntity: payment._id,
        relatedEntityType: 'Payment'
      }
    });
  }

  async notifyRefundRequested(refund, user) {
    return await this.createNotification({
      user: user._id,
      type: 'refund_requested',
      title: 'Solicitud de Reembolso Enviada',
      message: `Tu solicitud de reembolso por $${refund.amount} ha sido enviada y está siendo procesada.`,
      data: {
        refundId: refund.refundId,
        amount: refund.amount,
        reason: refund.reason,
        paymentId: refund.paymentId
      },
      channels: ['in_app', 'email'],
      priority: 'medium',
      metadata: {
        source: 'system',
        category: 'payment',
        relatedEntity: refund._id,
        relatedEntityType: 'Payment'
      }
    });
  }

  async notifyTicketTransferred(ticket, fromUser, toUser) {
    // Notificar al usuario que recibe el ticket
    await this.createNotification({
      user: toUser._id,
      type: 'ticket_transferred',
      title: 'Ticket Transferido',
      message: `${fromUser.name} te ha transferido un ticket para el evento "${ticket.event.name}".`,
      data: {
        ticketId: ticket.ticketId,
        eventName: ticket.event.name,
        eventDate: ticket.event.date,
        fromUserName: fromUser.name
      },
      channels: ['in_app', 'email'],
      priority: 'medium',
      metadata: {
        source: 'user',
        category: 'event',
        relatedEntity: ticket._id,
        relatedEntityType: 'Ticket'
      }
    });

    // Notificar al usuario que transfiere el ticket
    await this.createNotification({
      user: fromUser._id,
      type: 'ticket_transferred',
      title: 'Ticket Transferido Exitosamente',
      message: `Has transferido exitosamente tu ticket para "${ticket.event.name}" a ${toUser.name}.`,
      data: {
        ticketId: ticket.ticketId,
        eventName: ticket.event.name,
        toUserName: toUser.name
      },
      channels: ['in_app'],
      priority: 'low',
      metadata: {
        source: 'user',
        category: 'event',
        relatedEntity: ticket._id,
        relatedEntityType: 'Ticket'
      }
    });
  }

  async notifyEventReminder(event, attendees) {
    const notifications = [];
    
    for (const attendee of attendees) {
      const notification = await this.createNotification({
        user: attendee.user._id,
        type: 'event_reminder',
        title: 'Recordatorio de Evento',
        message: `¡No olvides! El evento "${event.name}" es mañana.`,
        data: {
          eventId: event._id,
          eventName: event.name,
          eventDate: event.date,
          eventLocation: event.location
        },
        channels: ['in_app', 'email'],
        priority: 'high',
        metadata: {
          source: 'automated',
          category: 'event',
          relatedEntity: event._id,
          relatedEntityType: 'Event'
        }
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }

  async notifySystemAnnouncement(title, message, targetUsers = null) {
    let users;
    
    if (targetUsers) {
      users = await User.find({ _id: { $in: targetUsers } });
    } else {
      users = await User.find({});
    }

    const notifications = [];
    
    for (const user of users) {
      const notification = await this.createNotification({
        user: user._id,
        type: 'system_announcement',
        title,
        message,
        channels: ['in_app', 'email'],
        priority: 'high',
        metadata: {
          source: 'admin',
          category: 'system'
        }
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId, options = {}) {
    return await Notification.getUserNotifications(userId, options);
  }

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    return await notification.markAsRead();
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    return await Notification.markAllAsRead(userId);
  }

  // Archivar notificación
  async archiveNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    return await notification.archive();
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(userId) {
    return await Notification.getNotificationStats(userId);
  }

  // Limpiar notificaciones antiguas
  async cleanupOldNotifications(daysOld = 30) {
    return await Notification.cleanupOldNotifications(daysOld);
  }
}

export default new NotificationService();

