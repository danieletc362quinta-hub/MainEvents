import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import app components
const app = (await import('../../src/app.js')).default;
const eventRoutes = (await import('../../src/routes/event.routes.js')).default;
const authRoutes = (await import('../../src/routes/auth.routes.js')).default;

describe('Events API - Integration Tests', () => {
  let authToken;
  let organizerToken;
  let adminToken;
  let testUser;
  let testOrganizer;
  let testAdmin;
  let testEvent;

  beforeAll(async () => {
    // Create test users
    testUser = await testUtils.createTestUser({ role: 'user' });
    testOrganizer = await testUtils.createTestUser({ 
      email: 'organizer@example.com', 
      role: 'organizer' 
    });
    testAdmin = await testUtils.createTestUser({ 
      email: 'admin@example.com', 
      role: 'admin' 
    });

    // Generate tokens
    authToken = await testUtils.generateToken(testUser);
    organizerToken = await testUtils.generateToken(testOrganizer);
    adminToken = await testUtils.generateToken(testAdmin);
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create test events
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
      await testUtils.createTestEvent({ 
        name: 'Second Event',
        type: 'cultural'
      }, testOrganizer._id);
    });

    it('should return all events for authenticated user', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.events).toHaveLength(2);
      expect(response.body.events[0]).toHaveProperty('_id');
      expect(response.body.events[0]).toHaveProperty('name');
      expect(response.body.events[0]).toHaveProperty('organizer');
    });

    it('should filter events by category', async () => {
      const response = await request(app)
        .get('/api/events?category=musical')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].type).toBe('musical');
    });

    it('should search events by name', async () => {
      const response = await request(app)
        .get('/api/events?search=Second')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].name).toBe('Second Event');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });
  });

  describe('POST /api/events', () => {
    it('should create event successfully for organizer', async () => {
      const eventData = {
        name: 'New Concert',
        description: 'Amazing concert',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Concert Hall',
        type: 'musical',
        image: 'https://example.com/concert.jpg',
        capacidad: 1000
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Evento creado exitosamente');
      expect(response.body.event).toMatchObject({
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        type: eventData.type,
        capacidad: eventData.capacidad
      });
      expect(response.body.event.organizer).toBe(testOrganizer._id.toString());
    });

    it('should reject event creation for regular user', async () => {
      const eventData = {
        name: 'New Concert',
        description: 'Amazing concert',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Concert Hall',
        type: 'musical',
        image: 'https://example.com/concert.jpg',
        capacidad: 1000
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No tienes permisos para crear eventos');
    });

    it('should validate required fields', async () => {
      const invalidEventData = {
        name: 'Incomplete Event'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(invalidEventData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('GET /api/events/:id', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should return specific event', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.event._id).toBe(testEvent._id.toString());
      expect(response.body.event.name).toBe(testEvent.name);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evento no encontrado');
    });
  });

  describe('PUT /api/events/:id', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should update event for organizer', async () => {
      const updateData = {
        name: 'Updated Event Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Evento actualizado exitosamente');
      expect(response.body.event.name).toBe(updateData.name);
      expect(response.body.event.description).toBe(updateData.description);
    });

    it('should reject update for non-organizer', async () => {
      const updateData = {
        name: 'Updated Event Name'
      };

      const response = await request(app)
        .put(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No tienes permisos para actualizar este evento');
    });
  });

  describe('DELETE /api/events/:id', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should delete event for organizer', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Evento eliminado exitosamente');
    });

    it('should reject deletion for non-organizer', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No tienes permisos para eliminar este evento');
    });
  });

  describe('POST /api/events/:id/attend', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should allow user to attend event', async () => {
      const response = await request(app)
        .post(`/api/events/${testEvent._id}/attend`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Te has registrado para el evento exitosamente');
    });

    it('should prevent duplicate attendance', async () => {
      // First attendance
      await request(app)
        .post(`/api/events/${testEvent._id}/attend`)
        .set('Authorization', `Bearer ${authToken}`);

      // Second attendance (should fail)
      const response = await request(app)
        .post(`/api/events/${testEvent._id}/attend`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ya estás registrado para este evento');
    });
  });

  describe('POST /api/events/favorite', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should add event to favorites', async () => {
      const response = await request(app)
        .post('/api/events/favorite')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: testEvent._id });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Evento agregado a favoritos');
    });

    it('should prevent duplicate favorites', async () => {
      // First favorite
      await request(app)
        .post('/api/events/favorite')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: testEvent._id });

      // Second favorite (should fail)
      const response = await request(app)
        .post('/api/events/favorite')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: testEvent._id });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El evento ya está en tus favoritos');
    });
  });

  describe('POST /api/events/comment', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should add comment to event', async () => {
      const commentData = {
        eventId: testEvent._id,
        content: 'Great event!'
      };

      const response = await request(app)
        .post('/api/events/comment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Comentario agregado exitosamente');
      expect(response.body.comment.content).toBe(commentData.content);
    });
  });

  describe('POST /api/events/review', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
    });

    it('should add review to event', async () => {
      const reviewData = {
        eventId: testEvent._id,
        rating: 5,
        comment: 'Excellent event!'
      };

      const response = await request(app)
        .post('/api/events/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reseña agregada exitosamente');
      expect(response.body.review.rating).toBe(reviewData.rating);
      expect(response.body.review.comment).toBe(reviewData.comment);
    });

    it('should validate rating range', async () => {
      const reviewData = {
        eventId: testEvent._id,
        rating: 6, // Invalid rating
        comment: 'Excellent event!'
      };

      const response = await request(app)
        .post('/api/events/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /api/events/attended', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
      // Make user attend the event
      await request(app)
        .post(`/api/events/${testEvent._id}/attend`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should return attended events', async () => {
      const response = await request(app)
        .get('/api/events/attended')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0]._id).toBe(testEvent._id.toString());
    });
  });

  describe('GET /api/events/reviews/:eventId', () => {
    beforeEach(async () => {
      testEvent = await testUtils.createTestEvent({}, testOrganizer._id);
      // Add a review
      await request(app)
        .post('/api/events/review')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: testEvent._id,
          rating: 5,
          comment: 'Great event!'
        });
    });

    it('should return event reviews', async () => {
      const response = await request(app)
        .get(`/api/events/reviews/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(5);
      expect(response.body.reviews[0].comment).toBe('Great event!');
      expect(response.body.averageRating).toBe(5);
      expect(response.body.totalReviews).toBe(1);
    });
  });
}); 