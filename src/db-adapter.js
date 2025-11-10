// Adaptador de base de datos que funciona con MongoDB y base de datos en memoria
import { config } from './config.js';
import memoryDB from './db-memory.js';

class DatabaseAdapter {
  constructor() {
    this.isMemoryDB = config.USE_MEMORY_DB;
    this.db = memoryDB;
  }

  // Métodos para usuarios
  async createUser(userData) {
    if (this.isMemoryDB) {
      return await this.db.create('users', userData);
    }
    // Para MongoDB, usar el modelo directamente
    const User = (await import('./models/user.model.js')).default;
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email) {
    if (this.isMemoryDB) {
      return await this.db.findUserByEmail(email);
    }
    const User = (await import('./models/user.model.js')).default;
    return await User.findOne({ email });
  }

  async findUserById(id) {
    if (this.isMemoryDB) {
      return await this.db.findById('users', id);
    }
    const User = (await import('./models/user.model.js')).default;
    return await User.findById(id);
  }

  async updateUser(id, data) {
    if (this.isMemoryDB) {
      return await this.db.update('users', id, data);
    }
    const User = (await import('./models/user.model.js')).default;
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  // Métodos para eventos
  async createEvent(eventData) {
    if (this.isMemoryDB) {
      return await this.db.create('events', eventData);
    }
    const Event = (await import('./models/events.model.js')).default;
    const event = new Event(eventData);
    return await event.save();
  }

  async findEventById(id) {
    if (this.isMemoryDB) {
      return await this.db.findById('events', id);
    }
    const Event = (await import('./models/events.model.js')).default;
    return await Event.findById(id);
  }

  async findEvents(query = {}) {
    if (this.isMemoryDB) {
      return await this.db.find('events', query);
    }
    const Event = (await import('./models/events.model.js')).default;
    
    let mongoQuery = {};
    
    if (query.status) mongoQuery.status = query.status;
    if (query.visibility) mongoQuery.visibility = query.visibility;
    if (query.organizer) mongoQuery.organizer = query.organizer;
    if (query.type) mongoQuery.type = query.type;
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(mongoQuery).skip(skip).limit(limit),
      Event.countDocuments(mongoQuery)
    ]);

    return {
      data: events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };
  }

  async findFeaturedEvents(limit = 6) {
    if (this.isMemoryDB) {
      return await this.db.findFeaturedEvents(limit);
    }
    const Event = (await import('./models/events.model.js')).default;
    const events = await Event.find({ 
      status: 'active', 
      visibility: 'public' 
    }).limit(limit);
    
    return {
      events,
      count: events.length,
      success: true
    };
  }

  async updateEvent(id, data) {
    if (this.isMemoryDB) {
      return await this.db.update('events', id, data);
    }
    const Event = (await import('./models/events.model.js')).default;
    return await Event.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteEvent(id) {
    if (this.isMemoryDB) {
      return await this.db.delete('events', id);
    }
    const Event = (await import('./models/events.model.js')).default;
    return await Event.findByIdAndDelete(id);
  }

  // Métodos para participantes
  async createParticipant(participantData) {
    if (this.isMemoryDB) {
      return await this.db.create('participants', participantData);
    }
    const Participant = (await import('./models/participant.model.js')).default;
    const participant = new Participant(participantData);
    return await participant.save();
  }

  async findParticipantsByEvent(eventId) {
    if (this.isMemoryDB) {
      return await this.db.find('participants', { eventId });
    }
    const Participant = (await import('./models/participant.model.js')).default;
    const result = await Participant.find({ eventId });
    return {
      data: result,
      total: result.length,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }

  async findParticipantByUserAndEvent(userId, eventId) {
    if (this.isMemoryDB) {
      const result = await this.db.find('participants', { userId, eventId });
      return result.data[0] || null;
    }
    const Participant = (await import('./models/participant.model.js')).default;
    return await Participant.findOne({ userId, eventId });
  }

  // Métodos para reviews
  async createReview(reviewData) {
    if (this.isMemoryDB) {
      return await this.db.create('reviews', reviewData);
    }
    const Review = (await import('./models/review.model.js')).default;
    const review = new Review(reviewData);
    return await review.save();
  }

  async findReviewsByEvent(eventId) {
    if (this.isMemoryDB) {
      return await this.db.find('reviews', { eventId });
    }
    const Review = (await import('./models/review.model.js')).default;
    const result = await Review.find({ eventId });
    return {
      data: result,
      total: result.length,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }

  // Métodos para cupones
  async createCoupon(couponData) {
    if (this.isMemoryDB) {
      return await this.db.create('coupons', couponData);
    }
    const Coupon = (await import('./models/coupon.model.js')).default;
    const coupon = new Coupon(couponData);
    return await coupon.save();
  }

  async findCoupons(query = {}) {
    if (this.isMemoryDB) {
      return await this.db.find('coupons', query);
    }
    const Coupon = (await import('./models/coupon.model.js')).default;
    
    let mongoQuery = {};
    if (query.userId) mongoQuery.userId = query.userId;
    if (query.isActive !== undefined) mongoQuery.isActive = query.isActive;
    
    const result = await Coupon.find(mongoQuery);
    return {
      data: result,
      total: result.length,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }

  async findCouponByCode(code) {
    if (this.isMemoryDB) {
      const result = await this.db.find('coupons', { code });
      return result.data[0] || null;
    }
    const Coupon = (await import('./models/coupon.model.js')).default;
    return await Coupon.findOne({ code });
  }

  async updateCoupon(id, data) {
    if (this.isMemoryDB) {
      return await this.db.update('coupons', id, data);
    }
    const Coupon = (await import('./models/coupon.model.js')).default;
    return await Coupon.findByIdAndUpdate(id, data, { new: true });
  }

  // Métodos para notificaciones
  async createNotification(notificationData) {
    if (this.isMemoryDB) {
      return await this.db.create('notifications', notificationData);
    }
    const Notification = (await import('./models/notification.model.js')).default;
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findNotificationsByUser(userId) {
    if (this.isMemoryDB) {
      return await this.db.find('notifications', { userId });
    }
    const Notification = (await import('./models/notification.model.js')).default;
    const result = await Notification.find({ userId });
    return {
      data: result,
      total: result.length,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }

  async updateNotification(id, data) {
    if (this.isMemoryDB) {
      return await this.db.update('notifications', id, data);
    }
    const Notification = (await import('./models/notification.model.js')).default;
    return await Notification.findByIdAndUpdate(id, data, { new: true });
  }
}

// Instancia global
const dbAdapter = new DatabaseAdapter();

export default dbAdapter;
