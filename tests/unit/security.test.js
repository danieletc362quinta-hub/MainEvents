import {
  sanitizeInput,
  securityHeaders,
  advancedRateLimit,
  sensitiveDataProtection,
  fileTypeValidation
} from '../../src/middlewares/security.js';
import encryptionService from '../../src/utils/encryption.js';

describe('Security Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1',
      get: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn()
    };
    next = jest.fn();
  });

  describe('sanitizeInput', () => {
    test('should sanitize XSS attempts', () => {
      req.body = {
        name: '<script>alert("xss")</script>Test User',
        description: 'Normal description'
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('Test User');
      expect(req.body.description).toBe('Normal description');
      expect(next).toHaveBeenCalled();
    });

    test('should sanitize HTML tags', () => {
      req.body = {
        name: '<b>Bold</b> User',
        email: 'test@example.com'
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('Bold User');
      expect(req.body.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    test('should handle nested objects', () => {
      req.body = {
        user: {
          name: '<script>alert("xss")</script>User',
          profile: {
            bio: '<img src="x" onerror="alert(1)">'
          }
        }
      };

      sanitizeInput(req, res, next);

      expect(req.body.user.name).toBe('User');
      expect(req.body.user.profile.bio).toBe('');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('securityHeaders', () => {
    test('should set security headers', () => {
      securityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.set).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(res.set).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('advancedRateLimit', () => {
    test('should allow requests within limit', () => {
      const rateLimit = advancedRateLimit({ maxRequests: 5, windowMs: 60000 });
      
      // Hacer 3 requests
      for (let i = 0; i < 3; i++) {
        rateLimit(req, res, next);
        expect(next).toHaveBeenCalledTimes(i + 1);
      }
    });

    test('should block requests exceeding limit', () => {
      const rateLimit = advancedRateLimit({ maxRequests: 2, windowMs: 60000 });
      
      // Hacer 2 requests (dentro del límite)
      rateLimit(req, res, next);
      rateLimit(req, res, next);
      
      // Tercer request (excede el límite)
      rateLimit(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Demasiadas solicitudes',
        retryAfter: expect.any(Number)
      });
    });
  });

  describe('sensitiveDataProtection', () => {
    test('should log sensitive data detection', () => {
      req.body = {
        name: 'Test User',
        password: 'secret123',
        email: 'test@example.com'
      };

      sensitiveDataProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle nested sensitive data', () => {
      req.body = {
        user: {
          name: 'Test User',
          credentials: {
            password: 'secret123',
            token: 'abc123'
          }
        }
      };

      sensitiveDataProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('fileTypeValidation', () => {
    test('should allow valid file types', () => {
      req.file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };

      const validator = fileTypeValidation(['image/jpeg', 'image/png']);
      validator(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid file types', () => {
      req.file = {
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload'
      };

      const validator = fileTypeValidation(['image/jpeg', 'image/png']);
      validator(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tipo de archivo no permitido'
      });
    });
  });
});

describe('Encryption Service Tests', () => {
  describe('encrypt/decrypt', () => {
    test('should encrypt and decrypt data', () => {
      const originalData = { message: 'Hello World', number: 123 };
      
      const encrypted = encryptionService.encrypt(originalData);
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(originalData);
    });

    test('should encrypt with password', () => {
      const originalData = { message: 'Secret Message' };
      const password = 'myPassword123';
      
      const encrypted = encryptionService.encrypt(originalData, password);
      const decrypted = encryptionService.decrypt(encrypted, password);
      
      expect(decrypted).toEqual(originalData);
    });

    test('should fail to decrypt with wrong password', () => {
      const originalData = { message: 'Secret Message' };
      const password = 'myPassword123';
      const wrongPassword = 'wrongPassword';
      
      const encrypted = encryptionService.encrypt(originalData, password);
      
      expect(() => {
        encryptionService.decrypt(encrypted, wrongPassword);
      }).toThrow();
    });
  });

  describe('hash/verify', () => {
    test('should hash and verify data', () => {
      const data = 'password123';
      
      const hashData = encryptionService.hash(data);
      expect(hashData.hash).toBeDefined();
      expect(hashData.salt).toBeDefined();
      
      const isValid = encryptionService.verifyHash(data, hashData);
      expect(isValid).toBe(true);
    });

    test('should reject wrong data', () => {
      const data = 'password123';
      const wrongData = 'wrongpassword';
      
      const hashData = encryptionService.hash(data);
      const isValid = encryptionService.verifyHash(wrongData, hashData);
      
      expect(isValid).toBe(false);
    });
  });

  describe('sensitive data encryption', () => {
    test('should encrypt sensitive fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        phone: '+1234567890'
      };
      
      const encrypted = encryptionService.encryptSensitiveData(data);
      
      expect(encrypted.name).toBe('John Doe'); // No sensible
      expect(encrypted.email).toBe('john@example.com'); // No sensible
      expect(typeof encrypted.password).toBe('object'); // Encriptado
      expect(typeof encrypted.phone).toBe('object'); // Encriptado
    });

    test('should decrypt sensitive fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        phone: '+1234567890'
      };
      
      const encrypted = encryptionService.encryptSensitiveData(data);
      const decrypted = encryptionService.decryptSensitiveData(encrypted);
      
      expect(decrypted).toEqual(data);
    });
  });

  describe('token generation', () => {
    test('should generate secure tokens', () => {
      const token1 = encryptionService.generateSecureToken();
      const token2 = encryptionService.generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    test('should generate UUIDs', () => {
      const uuid1 = encryptionService.generateUUID();
      const uuid2 = encryptionService.generateUUID();
      
      expect(uuid1).toBeDefined();
      expect(uuid2).toBeDefined();
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});
