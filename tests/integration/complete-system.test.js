/**
 * Test de integración completo para el sistema de eventos
 * Prueba todas las funcionalidades implementadas
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/user.model.js';
import Event from '../../src/models/events.model.js';
import Audit from '../../src/models/audit.model.js';

describe('Sistema Completo de Eventos', () => {
  let testUser;
  let authToken;
  let testEvent;

  beforeAll(async () => {
    // Crear usuario de prueba
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    await testUser.save();

    // Obtener token de autenticación
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await User.deleteMany({ email: 'test@example.com' });
    await Event.deleteMany({});
    await Audit.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpiar registros antes de cada test
    await Event.deleteMany({});
    await Audit.deleteMany({});
  });

  describe('Flujo completo de creación de evento', () => {
    test('debe crear un evento completo con auditoría', async () => {
      const eventData = {
        title: 'Concierto de Rock',
        description: 'Un increíble concierto de rock con las mejores bandas',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
        location: 'Estadio Nacional',
        address: 'Av. Principal 123',
        city: 'Lima',
        country: 'Perú',
        price: 150,
        capacity: 1000,
        category: 'musical',
        tags: ['rock', 'música', 'concierto'],
        image: 'https://example.com/image.jpg',
        isPublic: true
      };

      // Crear evento
      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.event).toBeTruthy();
      expect(createResponse.body.event.title).toBe(eventData.title);

      testEvent = createResponse.body.event;

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'EVENT_CREATE',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resource).toBe('EVENT');
      expect(auditRecord.resourceId.toString()).toBe(testEvent._id);
      expect(auditRecord.severity).toBe('MEDIUM');
    });

    test('debe actualizar el evento con auditoría', async () => {
      const updateData = {
        title: 'Concierto de Rock - ACTUALIZADO',
        price: 200,
        capacity: 1500
      };

      const updateResponse = await request(app)
        .put(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.event.title).toBe(updateData.title);
      expect(updateResponse.body.event.price).toBe(updateData.price);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'EVENT_UPDATE',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resourceId.toString()).toBe(testEvent._id);
    });

    test('debe eliminar el evento con auditoría', async () => {
      const deleteResponse = await request(app)
        .delete(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'EVENT_DELETE',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resourceId.toString()).toBe(testEvent._id);
      expect(auditRecord.severity).toBe('HIGH');
    });
  });

  describe('Sistema de autenticación con auditoría', () => {
    test('debe registrar login exitoso con auditoría', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeTruthy();

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'USER_LOGIN',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.severity).toBe('HIGH');
    });

    test('debe registrar login fallido con auditoría', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(loginResponse.status).toBe(401);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'USER_LOGIN',
        success: false 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(false);
      expect(auditRecord.statusCode).toBe(401);
      expect(auditRecord.errorMessage).toBeTruthy();
    });

    test('debe registrar logout con auditoría', async () => {
      const logoutResponse = await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(logoutResponse.status).toBe(200);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'USER_LOGOUT',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
    });
  });

  describe('Sistema de pagos con auditoría', () => {
    test('debe procesar pago con auditoría', async () => {
      const paymentData = {
        amount: 150,
        currency: 'PEN',
        description: 'Pago por evento',
        paymentMethod: 'credit_card',
        eventId: testEvent._id
      };

      const paymentResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'PAYMENT_CREATE',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resource).toBe('PAYMENT');
      expect(auditRecord.severity).toBe('HIGH');
    });
  });

  describe('Sistema de dashboard con auditoría', () => {
    test('debe acceder al dashboard con auditoría', async () => {
      const dashboardResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.stats).toBeTruthy();

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'DASHBOARD_ACCESS',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resource).toBe('SYSTEM');
    });
  });

  describe('Sistema de auditoría - Consultas', () => {
    beforeEach(async () => {
      // Crear varios registros de auditoría para las pruebas
      await Audit.create([
        {
          user: testUser._id,
          action: 'USER_LOGIN',
          resource: 'USER',
          resourceId: testUser._id,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          httpMethod: 'POST',
          url: '/api/login',
          statusCode: 200,
          responseTime: 100,
          success: true,
          severity: 'HIGH'
        },
        {
          user: testUser._id,
          action: 'EVENT_CREATE',
          resource: 'EVENT',
          resourceId: new mongoose.Types.ObjectId(),
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          httpMethod: 'POST',
          url: '/api/events',
          statusCode: 201,
          responseTime: 200,
          success: true,
          severity: 'MEDIUM'
        },
        {
          user: testUser._id,
          action: 'USER_LOGIN',
          resource: 'USER',
          resourceId: testUser._id,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          httpMethod: 'POST',
          url: '/api/login',
          statusCode: 401,
          responseTime: 50,
          success: false,
          severity: 'HIGH',
          errorMessage: 'Invalid credentials'
        }
      ]);
    });

    test('debe obtener actividad del usuario', async () => {
      const userActivity = await Audit.getUserActivity(testUser._id, 10);
      
      expect(userActivity).toHaveLength(3);
      expect(userActivity[0].action).toBe('USER_LOGIN');
      expect(userActivity[0].user.name).toBe('Test User');
    });

    test('debe obtener eventos de seguridad', async () => {
      const securityEvents = await Audit.getSecurityEvents(7);
      
      expect(securityEvents).toHaveLength(2); // Solo eventos de login
      expect(securityEvents.every(event => 
        ['USER_LOGIN', 'USER_LOGOUT'].includes(event.action)
      )).toBe(true);
    });

    test('debe obtener acciones fallidas', async () => {
      const failedActions = await Audit.getFailedActions(7);
      
      expect(failedActions).toHaveLength(1);
      expect(failedActions[0].success).toBe(false);
      expect(failedActions[0].errorMessage).toBe('Invalid credentials');
    });

    test('debe obtener resumen de auditoría', async () => {
      const summary = await Audit.getAuditSummary(30);
      
      expect(summary).toHaveLength(2); // USER_LOGIN y EVENT_CREATE
      expect(summary[0]._id).toBe('USER_LOGIN');
      expect(summary[0].total).toBe(2);
      expect(summary[0].successful).toBe(1);
      expect(summary[0].failed).toBe(1);
    });
  });

  describe('Sistema de idiomas', () => {
    test('debe cambiar idioma correctamente', async () => {
      // Test del endpoint de cambio de idioma (si existe)
      const languageResponse = await request(app)
        .post('/api/language')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'en' });

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'USER_UPDATE',
        user: testUser._id 
      });
      
      expect(auditRecord).toBeTruthy();
    });
  });

  describe('Sistema de ayuda', () => {
    test('debe acceder al sistema de ayuda', async () => {
      const helpResponse = await request(app)
        .get('/api/help')
        .set('Authorization', `Bearer ${authToken}`);

      expect(helpResponse.status).toBe(200);
      expect(helpResponse.body.help).toBeTruthy();
    });

    test('debe buscar en la ayuda', async () => {
      const searchResponse = await request(app)
        .get('/api/help/search?q=evento')
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.results).toBeTruthy();
    });
  });

  describe('Sistema responsive', () => {
    test('debe detectar dispositivo móvil', async () => {
      const mobileResponse = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');

      expect(mobileResponse.status).toBe(200);
      expect(mobileResponse.body.events).toBeTruthy();
    });

    test('debe detectar dispositivo de escritorio', async () => {
      const desktopResponse = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      expect(desktopResponse.status).toBe(200);
      expect(desktopResponse.body.events).toBeTruthy();
    });
  });

  describe('Rendimiento del sistema', () => {
    test('debe manejar múltiples peticiones simultáneas', async () => {
      const promises = [];
      
      // Crear 50 peticiones simultáneas
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/api/events')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // Verificar que todas las respuestas fueron exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verificar que el tiempo de respuesta es razonable
      expect(endTime - startTime).toBeLessThan(5000); // Menos de 5 segundos
    });

    test('debe manejar carga de auditoría', async () => {
      const promises = [];
      
      // Crear 100 registros de auditoría simultáneamente
      for (let i = 0; i < 100; i++) {
        promises.push(
          Audit.create({
            user: testUser._id,
            action: 'USER_LOGIN',
            resource: 'USER',
            resourceId: testUser._id,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent',
            httpMethod: 'POST',
            url: '/api/login',
            statusCode: 200,
            responseTime: 100,
            success: true,
            severity: 'HIGH'
          })
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();

      // Verificar que se crearon todos los registros
      const count = await Audit.countDocuments();
      expect(count).toBe(100);

      // Verificar que el tiempo de procesamiento es razonable
      expect(endTime - startTime).toBeLessThan(3000); // Menos de 3 segundos
    });
  });

  describe('Seguridad del sistema', () => {
    test('debe rechazar peticiones sin token', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(401);
    });

    test('debe rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('debe registrar intentos de acceso no autorizado', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ 
        action: 'DASHBOARD_ACCESS',
        success: false 
      });
      
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(false);
      expect(auditRecord.statusCode).toBe(401);
    });
  });
});