/**
 * Tests unitarios para el sistema de auditoría
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import Audit from '../../src/models/audit.model.js';
import User from '../../src/models/user.model.js';

describe('Sistema de Auditoría', () => {
  let testUser;
  let authToken;

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
    await Audit.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpiar registros de auditoría antes de cada test
    await Audit.deleteMany({});
  });

  describe('Registro de operaciones de autenticación', () => {
    test('debe registrar login exitoso', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'USER_LOGIN' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.statusCode).toBe(200);
      expect(auditRecord.severity).toBe('HIGH');
    });

    test('debe registrar login fallido', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'USER_LOGIN', success: false });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(false);
      expect(auditRecord.statusCode).toBe(401);
      expect(auditRecord.errorMessage).toBeTruthy();
    });

    test('debe registrar registro de usuario', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'USER_REGISTER' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.statusCode).toBe(201);
      expect(auditRecord.severity).toBe('HIGH');
    });
  });

  describe('Registro de operaciones de eventos', () => {
    test('debe registrar creación de evento', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        price: 100,
        capacity: 50
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      expect(response.status).toBe(201);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'EVENT_CREATE' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resource).toBe('EVENT');
      expect(auditRecord.after).toBeTruthy();
    });

    test('debe registrar actualización de evento', async () => {
      // Primero crear un evento
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        price: 100,
        capacity: 50
      };

      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      const eventId = createResponse.body.event._id;

      // Actualizar el evento
      const updateData = {
        title: 'Updated Event Title',
        price: 150
      };

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'EVENT_UPDATE' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resourceId.toString()).toBe(eventId);
    });

    test('debe registrar eliminación de evento', async () => {
      // Primero crear un evento
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        price: 100,
        capacity: 50
      };

      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      const eventId = createResponse.body.event._id;

      // Eliminar el evento
      const response = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'EVENT_DELETE' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resourceId.toString()).toBe(eventId);
      expect(auditRecord.severity).toBe('HIGH');
    });
  });

  describe('Registro de operaciones de pagos', () => {
    test('debe registrar creación de pago', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD',
        description: 'Test Payment',
        paymentMethod: 'credit_card'
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'PAYMENT_CREATE' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.resource).toBe('PAYMENT');
      expect(auditRecord.severity).toBe('HIGH');
    });
  });

  describe('Registro de operaciones de sistema', () => {
    test('debe registrar acceso al dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Verificar que se creó el registro de auditoría
      const auditRecord = await Audit.findOne({ action: 'DASHBOARD_ACCESS' });
      expect(auditRecord).toBeTruthy();
      expect(auditRecord.user.toString()).toBe(testUser._id.toString());
      expect(auditRecord.success).toBe(true);
      expect(auditRecord.resource).toBe('SYSTEM');
    });
  });

  describe('Métodos estáticos del modelo Audit', () => {
    test('debe obtener actividad del usuario', async () => {
      // Crear algunos registros de auditoría
      await Audit.create({
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
      });

      const userActivity = await Audit.getUserActivity(testUser._id, 10);
      expect(userActivity).toHaveLength(1);
      expect(userActivity[0].action).toBe('USER_LOGIN');
    });

    test('debe obtener eventos de seguridad', async () => {
      // Crear registros de seguridad
      await Audit.create({
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
      });

      const securityEvents = await Audit.getSecurityEvents(7);
      expect(securityEvents).toHaveLength(1);
      expect(securityEvents[0].action).toBe('USER_LOGIN');
    });

    test('debe obtener acciones fallidas', async () => {
      // Crear registro de acción fallida
      await Audit.create({
        user: testUser._id,
        action: 'USER_LOGIN',
        resource: 'USER',
        resourceId: testUser._id,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        httpMethod: 'POST',
        url: '/api/login',
        statusCode: 401,
        responseTime: 100,
        success: false,
        severity: 'HIGH',
        errorMessage: 'Invalid credentials'
      });

      const failedActions = await Audit.getFailedActions(7);
      expect(failedActions).toHaveLength(1);
      expect(failedActions[0].success).toBe(false);
      expect(failedActions[0].errorMessage).toBe('Invalid credentials');
    });

    test('debe obtener resumen de auditoría', async () => {
      // Crear varios registros
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
          action: 'USER_LOGIN',
          resource: 'USER',
          resourceId: testUser._id,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          httpMethod: 'POST',
          url: '/api/login',
          statusCode: 401,
          responseTime: 100,
          success: false,
          severity: 'HIGH'
        }
      ]);

      const summary = await Audit.getAuditSummary(30);
      expect(summary).toHaveLength(1);
      expect(summary[0]._id).toBe('USER_LOGIN');
      expect(summary[0].total).toBe(2);
      expect(summary[0].successful).toBe(1);
      expect(summary[0].failed).toBe(1);
    });
  });

  describe('Validación de datos de auditoría', () => {
    test('debe validar campos requeridos', async () => {
      const auditData = {
        action: 'TEST_ACTION',
        resource: 'TEST',
        resourceId: new mongoose.Types.ObjectId(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        httpMethod: 'POST',
        url: '/api/test',
        statusCode: 200,
        responseTime: 100,
        success: true
      };

      const audit = new Audit(auditData);
      const validationError = audit.validateSync();
      
      expect(validationError).toBeTruthy();
      expect(validationError.errors.user).toBeTruthy();
    });

    test('debe validar enum de acciones', async () => {
      const auditData = {
        user: testUser._id,
        action: 'INVALID_ACTION',
        resource: 'TEST',
        resourceId: new mongoose.Types.ObjectId(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        httpMethod: 'POST',
        url: '/api/test',
        statusCode: 200,
        responseTime: 100,
        success: true
      };

      const audit = new Audit(auditData);
      const validationError = audit.validateSync();
      
      expect(validationError).toBeTruthy();
      expect(validationError.errors.action).toBeTruthy();
    });

    test('debe validar enum de recursos', async () => {
      const auditData = {
        user: testUser._id,
        action: 'USER_LOGIN',
        resource: 'INVALID_RESOURCE',
        resourceId: new mongoose.Types.ObjectId(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        httpMethod: 'POST',
        url: '/api/test',
        statusCode: 200,
        responseTime: 100,
        success: true
      };

      const audit = new Audit(auditData);
      const validationError = audit.validateSync();
      
      expect(validationError).toBeTruthy();
      expect(validationError.errors.resource).toBeTruthy();
    });
  });

  describe('Rendimiento del sistema de auditoría', () => {
    test('debe manejar múltiples registros simultáneos', async () => {
      const promises = [];
      
      // Crear 100 registros simultáneamente
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
      expect(endTime - startTime).toBeLessThan(5000); // Menos de 5 segundos
    });
  });
});
