import Notification from '../models/notification.model.js';
import notificationService from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

// Obtener notificaciones del usuario
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      status = 'unread', 
      type, 
      priority, 
      page = 1, 
      limit = 20 
    } = req.query;

    const options = {
      status,
      type,
      priority,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const notifications = await notificationService.getUserNotifications(userId, options);
    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: {
        notifications,
        stats,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total: stats.total
        }
      }
    });
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

// Marcar notificación como leída
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al marcar notificación como leída'
    });
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'Todas las notificaciones han sido marcadas como leídas',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas'
    });
  }
};

// Archivar notificación
export const archiveNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.archiveNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notificación archivada',
      data: notification
    });
  } catch (error) {
    logger.error('Error archiving notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al archivar notificación'
    });
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de notificaciones'
    });
  }
};

// Crear notificación (para administradores)
export const createNotification = async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      title, 
      message, 
      data, 
      priority = 'medium',
      channels = ['in_app'],
      scheduledFor 
    } = req.body;

    const notificationData = {
      user: userId,
      type,
      title,
      message,
      data: data || {},
      priority,
      channels,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date()
    };

    const notification = await notificationService.createNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: notification
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear notificación'
    });
  }
};

// Enviar anuncio del sistema (para administradores)
export const sendSystemAnnouncement = async (req, res) => {
  try {
    const { title, message, targetUsers } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Título y mensaje son requeridos'
      });
    }

    const notifications = await notificationService.notifySystemAnnouncement(
      title, 
      message, 
      targetUsers
    );

    res.json({
      success: true,
      message: 'Anuncio del sistema enviado exitosamente',
      data: {
        notificationsSent: notifications.length
      }
    });
  } catch (error) {
    logger.error('Error sending system announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar anuncio del sistema'
    });
  }
};

// Limpiar notificaciones antiguas (para administradores)
export const cleanupOldNotifications = async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;

    const result = await notificationService.cleanupOldNotifications(parseInt(daysOld));

    res.json({
      success: true,
      message: 'Notificaciones antiguas limpiadas exitosamente',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    logger.error('Error cleaning up old notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar notificaciones antiguas'
    });
  }
};

// Obtener notificaciones por tipo
export const getNotificationsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const options = {
      type,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const notifications = await notificationService.getUserNotifications(userId, options);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting notifications by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones por tipo'
    });
  }
};