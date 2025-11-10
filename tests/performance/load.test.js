import request from 'supertest';
import app from '../../src/app.js';

describe('Performance Tests', () => {
  let authToken;
  let eventId;

  beforeAll(async () => {
    // Crear usuario y obtener token
    await request(app)
      .post('/api/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;

    // Crear evento para tests
    const eventResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Event',
        description: 'A test event',
        date: '2024-12-25T20:00:00.000Z',
        endDate: '2024-12-25T23:00:00.000Z',
        duration: 180,
        location: 'Test Location',
        capacity: 100,
        price: 50,
        type: 'musical',
        category: 'Entertainment',
        visibility: 'publico'
      });

    eventId = eventResponse.body.data._id;
  });

  describe('Response Time Tests', () => {
    test('health endpoint should respond quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100); // Menos de 100ms
      expect(response.body.status).toBe('OK');
    });

    test('events endpoint should respond quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/events/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500); // Menos de 500ms
      expect(response.body.success).toBe(true);
    });

    test('suppliers endpoint should respond quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/suppliers')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500); // Menos de 500ms
      expect(response.body.success).toBe(true);
    });
  });

  describe('Concurrent Request Tests', () => {
    test('should handle 10 concurrent health requests', async () => {
      const promises = Array(10).fill().map(() =>
        request(app).get('/api/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Todos los requests deben ser exitosos
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Debe completarse en menos de 2 segundos
      expect(totalTime).toBeLessThan(2000);
    });

    test('should handle 5 concurrent event requests', async () => {
      const promises = Array(5).fill().map(() =>
        request(app)
          .get('/api/events/all')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Todos los requests deben ser exitosos
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Debe completarse en menos de 3 segundos
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory with multiple requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Hacer 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/health');
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // El aumento de memoria no debería ser excesivo (menos de 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Database Performance Tests', () => {
    test('should handle multiple event creations efficiently', async () => {
      const startTime = Date.now();
      
      const promises = Array(5).fill().map((_, index) =>
        request(app)
          .post('/api/events')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Test Event ${index}`,
            description: 'A test event',
            date: '2024-12-25T20:00:00.000Z',
            endDate: '2024-12-25T23:00:00.000Z',
            duration: 180,
            location: 'Test Location',
            capacity: 100,
            price: 50,
            type: 'musical',
            category: 'Entertainment',
            visibility: 'publico'
          })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Todos los requests deben ser exitosos
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Debe completarse en menos de 5 segundos
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Large Payload Tests', () => {
    test('should handle large event data', async () => {
      const largeEventData = {
        name: 'Large Event',
        description: 'A'.repeat(5000), // Descripción de 5000 caracteres
        date: '2024-12-25T20:00:00.000Z',
        endDate: '2024-12-25T23:00:00.000Z',
        duration: 180,
        location: 'Test Location',
        capacity: 100,
        price: 50,
        type: 'musical',
        category: 'Entertainment',
        visibility: 'publico',
        tags: Array(100).fill().map((_, i) => `tag${i}`) // 100 tags
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeEventData)
        .expect(201);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Menos de 2 segundos
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should enforce rate limiting', async () => {
      const promises = Array(15).fill().map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      // Algunos requests deben ser limitados
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Performance', () => {
    test('should handle errors quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.error).toBe('Route not found');
      expect(responseTime).toBeLessThan(100); // Menos de 100ms
    });
  });

  describe('Monitoring Performance', () => {
    test('monitoring endpoint should respond quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/monitoring/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
    });
  });
});
