import Review from '../models/review.model.js';
import Event from '../models/events.model.js';

import Notification from '../models/notification.model.js';

// Crear review
export const createReview = async (req, res) => {
  try {
    const { event, rating, title, comment, categories } = req.body;
    const userId = req.user.id;

    // Verificar si el usuario ya ha hecho un review para este evento
    const existingReview = await Review.findOne({
      user: userId,
      event: event
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'Ya has hecho un review para este evento'
      });
    }

    // Verificar que el evento existe
    const eventExists = await Event.findById(event);
    if (!eventExists) {
      return res.status(404).json({
        error: 'Evento no encontrado'
      });
    }

    // Verificar que el usuario asistió al evento
    const attended = eventExists.attendees.some(attendee => 
      attendee.user.toString() === userId
    );

    if (!attended) {
      return res.status(403).json({
        error: 'Solo puedes hacer review de eventos a los que asististe'
      });
    }

    const newReview = new Review({
      user: userId,
      event,
      rating,
      title,
      comment,
      categories,
      verified: true // Se marca como verificado porque asistió al evento
    });

    const savedReview = await newReview.save();

    // Crear notificación para el organizador del evento
    await Notification.create({
      user: eventExists.user,
      title: 'Nuevo Review Recibido',
      message: `Has recibido un nuevo review de ${rating} estrellas para tu evento "${eventExists.name}".`,
      type: 'info',
      category: 'event_update',
      data: {
        eventId: event,
        reviewId: savedReview._id
      }
    });



    const populatedReview = await Review.findById(savedReview._id)
      .populate('user', 'name')
      .populate('event', 'name')


    res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      review: populatedReview
    });

  } catch (error) {
    console.error('❌ Error al crear review:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear el review'
    });
  }
};

// Obtener reviews de un evento
export const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { event: eventId, status: 'approved' };
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    // Calcular estadísticas
    const stats = await Review.aggregate([
      { $match: { event: eventId, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener reviews del evento:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener reviews'
    });
  }
};



// Actualizar review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment, categories } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: 'Review no encontrado'
      });
    }

    // Verificar que el usuario sea el autor del review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        error: 'No tienes permisos para actualizar este review'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, title, comment, categories },
      { new: true, runValidators: true }
    ).populate('user', 'name')
     .populate('event', 'name')


    res.json({
      success: true,
      message: 'Review actualizado correctamente',
      review: updatedReview
    });

  } catch (error) {
    console.error('❌ Error al actualizar review:', error);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar el review'
    });
  }
};

// Eliminar review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: 'Review no encontrado'
      });
    }

    // Verificar que el usuario sea el autor del review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este review'
      });
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar review:', error);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar el review'
    });
  }
};

// Marcar review como útil
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review no encontrado'
      });
    }

    // Verificar que el usuario no sea el autor del review
    if (review.user.toString() === userId) {
      return res.status(400).json({
        error: 'No puedes marcar tu propio review como útil'
      });
    }

    // Verificar si ya marcó el review
    const existingVote = review.helpful.find(vote => vote.user.toString() === userId);
    
    if (existingVote) {
      // Actualizar voto existente
      existingVote.helpful = helpful;
    } else {
      // Agregar nuevo voto
      review.helpful.push({ user: userId, helpful });
    }

    await review.save();

    res.json({
      success: true,
      message: `Review marcado como ${helpful ? 'útil' : 'no útil'}`
    });

  } catch (error) {
    console.error('❌ Error al marcar review como útil:', error);
    res.status(500).json({
      error: 'Error interno del servidor al marcar review como útil'
    });
  }
};

// Obtener reviews del usuario
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .populate('event', 'name image')

      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener reviews del usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener reviews del usuario'
    });
  }
}; 