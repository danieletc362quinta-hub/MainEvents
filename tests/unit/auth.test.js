import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import auth controller and middleware
const authController = (await import('../../src/controllers/auth.controller.js')).default;
const validateToken = (await import('../../src/middlewares/validateToken.js')).default;
const { registerSchema, loginSchema } = await import('../../src/schemas/auth.schemas.js');

describe('Auth Controller - Unit Tests', () => {
  let app;
  let mockUser;
  let mockEvent;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Mock database models
    const User = (await import('../../src/models/user.model.js')).default;
    const Event = (await import('../../src/models/events.model.js')).default;
    
    // Create test data
    mockUser = await testUtils.createTestUser();
    mockEvent = await testUtils.createTestEvent({}, mockUser._id);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };

      const req = {
        body: userData
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario registrado exitosamente',
          user: expect.objectContaining({
            name: userData.name,
            email: userData.email,
            role: userData.role
          })
        })
      );
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com', // Already exists
        password: 'password123',
        role: 'user'
      };

      const req = {
        body: userData
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('email')
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const req = {
        body: loginData
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login exitoso',
          token: expect.any(String),
          user: expect.objectContaining({
            email: loginData.email
          })
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const req = {
        body: loginData
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Credenciales inválidas'
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = {
        user: { userId: mockUser._id }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout exitoso'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = {
        user: { userId: mockUser._id }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            _id: mockUser._id.toString(),
            name: mockUser.name,
            email: mockUser.email
          })
        })
      );
    });
  });
});

describe('Auth Middleware - Unit Tests', () => {
  let app;
  let mockUser;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    mockUser = await testUtils.createTestUser();
  });

  describe('validateToken', () => {
    it('should pass with valid token', async () => {
      const token = await testUtils.generateToken(mockUser);
      
      app.use(validateToken);
      app.get('/test', (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        userId: mockUser._id.toString(),
        role: mockUser.role
      });
    });

    it('should reject request without token', async () => {
      app.use(validateToken);
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });

    it('should reject request with invalid token', async () => {
      app.use(validateToken);
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no válido o expirado');
    });
  });
});

describe('Auth Schemas - Unit Tests', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'user'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    it('should reject short password', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        role: 'user'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('password');
    });

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid_role'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('role');
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('password');
    });
  });
}); 