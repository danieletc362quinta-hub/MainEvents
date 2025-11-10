/**
 * Middleware de Seguridad Avanzada
 * 
 * Proporciona:
 * - Encriptación de datos sensibles
 * - Validación avanzada de entrada
 * - Protección contra XSS, SQL injection
 * - Rate limiting inteligente
 * - Detección de patrones sospechosos
 */

import crypto from 'crypto';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

class AdvancedSecurityMiddleware {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi
    ];
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();
  }

  /**
   * Middleware de encriptación de datos sensibles
   */
  encryptSensitiveData() {
    return (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        try {
          // Encriptar datos sensibles antes de enviar
          if (typeof data === 'object' && data !== null) {
            data = this.encryptObject(data);
          }
          originalSend.call(this, data);
        } catch (error) {
          console.error('Error encrypting response:', error);
          originalSend.call(this, data);
        }
      }.bind(this);
      
      next();
    };
  }

  /**
   * Encriptar objeto recursivamente
   */
  encryptObject(obj) {
    const encrypted = { ...obj };
    
    // Campos sensibles que deben ser encriptados
    const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'creditCard'];
    
    for (const [key, value] of Object.entries(encrypted)) {
      if (sensitiveFields.includes(key.toLowerCase()) && typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = this.encryptObject(value);
      }
    }
    
    return encrypted;
  }

  /**
   * Encriptar string
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencriptar string
   */
  decrypt(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Middleware de validación avanzada
   */
  advancedValidation() {
    return [
      // Sanitización básica
      body('*').trim().escape(),
      
      // Validación de email
      body('email').isEmail().normalizeEmail(),
      
      // Validación de contraseña
      body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
      
      // Validación de teléfono
      body('phone').optional().isMobilePhone(),
      
      // Validación de URL
      body('website').optional().isURL(),
      
      // Validación de fecha
      body('date').optional().isISO8601(),
      
      // Middleware de validación
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array()
          });
        }
        next();
      }
    ];
  }

  /**
   * Middleware de detección de patrones sospechosos
   */
  detectSuspiciousActivity() {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      const bodyString = JSON.stringify(req.body);
      const queryString = JSON.stringify(req.query);
      
      // Verificar si la IP está bloqueada
      if (this.blockedIPs.has(clientIP)) {
        return res.status(403).json({
          success: false,
          message: 'IP bloqueada por actividad sospechosa'
        });
      }
      
      // Detectar patrones sospechosos
      const suspiciousContent = bodyString + queryString + userAgent;
      const isSuspicious = this.suspiciousPatterns.some(pattern => 
        pattern.test(suspiciousContent)
      );
      
      if (isSuspicious) {
        this.recordSuspiciousActivity(clientIP, req.path, 'Suspicious pattern detected');
        return res.status(400).json({
          success: false,
          message: 'Contenido sospechoso detectado'
        });
      }
      
      next();
    };
  }

  /**
   * Middleware de rate limiting inteligente
   */
  intelligentRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: (req) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        const attempts = this.failedAttempts.get(clientIP) || 0;
        
        // Reducir límite para IPs con intentos fallidos
        if (attempts > 5) return 5;
        if (attempts > 2) return 20;
        return 100; // Límite normal
      },
      message: {
        success: false,
        message: 'Demasiadas solicitudes, inténtalo más tarde'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        this.recordFailedAttempt(clientIP);
        res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes, inténtalo más tarde'
        });
      }
    });
  }

  /**
   * Middleware de auditoría de seguridad
   */
  securityAudit() {
    return (req, res, next) => {
      const startTime = Date.now();
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      
      // Interceptar respuesta
      const originalSend = res.send;
      const self = this;
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Registrar evento de auditoría
        self.logSecurityEvent({
          timestamp: new Date().toISOString(),
          ip: clientIP,
          method: req.method,
          path: req.path,
          userAgent,
          statusCode: res.statusCode,
          responseTime,
          userId: req.user?.id,
          success: res.statusCode < 400
        });
        
        originalSend.call(res, data);
      };
      
      next();
    };
  }

  /**
   * Registrar actividad sospechosa
   */
  recordSuspiciousActivity(ip, path, reason) {
    console.warn(`🚨 Suspicious activity detected: ${ip} - ${path} - ${reason}`);
    
    // Incrementar contador de intentos fallidos
    this.recordFailedAttempt(ip);
    
    // Bloquear IP si tiene muchos intentos fallidos
    const attempts = this.failedAttempts.get(ip) || 0;
    if (attempts > 10) {
      this.blockedIPs.add(ip);
      console.warn(`🚫 IP ${ip} blocked due to suspicious activity`);
    }
  }

  /**
   * Registrar intento fallido
   */
  recordFailedAttempt(ip) {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    // Limpiar intentos fallidos después de 1 hora
    setTimeout(() => {
      this.failedAttempts.delete(ip);
    }, 60 * 60 * 1000);
  }

  /**
   * Registrar evento de seguridad
   */
  logSecurityEvent(event) {
    // En un entorno de producción, esto se enviaría a un sistema de logging
    console.log('🔒 Security event:', event);
    
    // Aquí se podría integrar con servicios como:
    // - Elasticsearch
    // - Splunk
    // - CloudWatch
    // - Custom logging service
  }

  /**
   * Middleware de headers de seguridad
   */
  securityHeaders() {
    return (req, res, next) => {
      // Prevenir clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevenir MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Habilitar XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:4000;"
      );
      
      next();
    };
  }

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      failedAttempts: Object.fromEntries(this.failedAttempts),
      totalBlockedIPs: this.blockedIPs.size,
      totalFailedAttempts: Array.from(this.failedAttempts.values()).reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Desbloquear IP
   */
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    this.failedAttempts.delete(ip);
    console.log(`✅ IP ${ip} unblocked`);
  }

  /**
   * Limpiar datos de seguridad
   */
  clearSecurityData() {
    this.blockedIPs.clear();
    this.failedAttempts.clear();
    console.log('🧹 Security data cleared');
  }
}

// Crear instancia singleton
const advancedSecurityMiddleware = new AdvancedSecurityMiddleware();

export default advancedSecurityMiddleware;
