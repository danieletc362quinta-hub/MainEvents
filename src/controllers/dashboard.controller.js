import Event from '../models/events.model.js';
import User from '../models/user.model.js';

import Review from '../models/review.model.js';
import Notification from '../models/notification.model.js';

// Dashboard general para administradores
export const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Verificar si es administrador
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acceso denegado. Solo administradores pueden ver este dashboard.'
      });
    }

    // Estadísticas generales
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalProviders = 0; // Proveedores eliminados del sistema
    const totalReviews = await Review.countDocuments();

    // Eventos por estado
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);

    // Proveedores por estado (eliminados del sistema)
    const providersByStatus = [];

    // Eventos por tipo
    const eventsByType = await Event.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Eventos por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top 5 eventos más populares
    const topEvents = await Event.find()
      .sort({ visitas: -1, 'rating.average': -1 })
      .limit(5)
      .populate('user', 'name email');

    // Top 5 proveedores mejor calificados (eliminados del sistema)
    const topProviders = [];

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalProviders,
        totalReviews
      },
      eventsByStatus,
      providersByStatus,
      eventsByType,
      eventsByMonth,
      topEvents,
      topProviders
    });

  } catch (error) {
    console.error('❌ Error al obtener dashboard de administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener dashboard'
    });
  }
};

// Dashboard para organizadores de eventos
export const getOrganizerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Eventos del usuario
    const userEvents = await Event.find({ user: userId });
    const totalEvents = userEvents.length;
    const activeEvents = userEvents.filter(event => event.estado === 'activo').length;
    const completedEvents = userEvents.filter(event => event.estado === 'completado').length;

    // Estadísticas de eventos
    const totalAttendees = userEvents.reduce((sum, event) => sum + event.concurrentes, 0);
    const totalRevenue = userEvents.reduce((sum, event) => sum + (event.price * event.concurrentes), 0);
    const averageRating = userEvents.reduce((sum, event) => sum + event.rating.average, 0) / totalEvents || 0;

    // Eventos por tipo
    const eventsByType = await Event.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Eventos próximos (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingEvents = await Event.find({
      user: userId,
      date: { $gte: new Date(), $lte: thirtyDaysFromNow },
      estado: 'activo'
    }).sort({ date: 1 });

    // Reviews recientes
    const recentReviews = await Review.find({
      event: { $in: userEvents.map(event => event._id) }
    })
    .populate('user', 'name')
    .populate('event', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      stats: {
        totalEvents,
        activeEvents,
        completedEvents,
        totalAttendees,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10
      },
      eventsByType,
      upcomingEvents,
      recentReviews
    });

  } catch (error) {
    console.error('❌ Error al obtener dashboard de organizador:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener dashboard'
    });
  }
};

// Dashboard para usuarios regulares
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Eventos a los que asistió
    const attendedEvents = await Event.find({
      'attendees.user': userId
    }).populate('user', 'name');

    // Eventos favoritos
    const favoriteEvents = await Event.find({
      favoritos: userId
    }).populate('user', 'name');

    // Reviews del usuario
    const userReviews = await Review.find({ user: userId })
      .populate('event', 'name image')
      .sort({ createdAt: -1 })
      .limit(5);

    // Notificaciones no leídas
    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false
    });

    // Eventos próximos a los que está registrado
    const upcomingAttendedEvents = attendedEvents.filter(event => 
      event.date > new Date() && event.estado === 'activo'
    );

    // Estadísticas
    const totalAttended = attendedEvents.length;
    const totalFavorites = favoriteEvents.length;
    const totalReviews = userReviews.length;

    res.json({
      success: true,
      stats: {
        totalAttended,
        totalFavorites,
        totalReviews,
        unreadNotifications
      },
      attendedEvents: attendedEvents.slice(0, 5),
      favoriteEvents: favoriteEvents.slice(0, 5),
      userReviews,
      upcomingAttendedEvents
    });

  } catch (error) {
    console.error('❌ Error al obtener dashboard de usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener dashboard'
    });
  }
};

// Estadísticas generales públicas
export const getPublicStats = async (req, res) => {
  try {
    // Estadísticas públicas que no requieren autenticación
    const totalEvents = await Event.countDocuments({ estado: 'activo' });
    const totalUsers = await User.countDocuments();
    const totalProviders = 0; // Proveedores eliminados del sistema
    const totalReviews = await Review.countDocuments({ status: 'approved' });

    // Eventos por categoría
    const eventsByCategory = await Event.aggregate([
      { $match: { estado: 'activo' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Proveedores por categoría (eliminados del sistema)
    const providersByCategory = [];

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalUsers,
        totalProviders,
        totalReviews
      },
      eventsByCategory,
      providersByCategory
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas públicas:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
}; 