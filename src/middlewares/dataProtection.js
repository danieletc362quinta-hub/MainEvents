import encryptionService from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

// Middleware para encriptar datos sensibles antes de guardar
export const encryptSensitiveData = (req, res, next) => {
  try {
    if (req.body) {
      req.body = encryptionService.encryptSensitiveData(req.body);
    }
    next();
  } catch (error) {
    logger.error('Error encrypting sensitive data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar datos sensibles'
    });
  }
};

// Middleware para desencriptar datos sensibles después de leer
export const decryptSensitiveData = (req, res, next) => {
  try {
    if (res.locals.data) {
      res.locals.data = encryptionService.decryptSensitiveData(res.locals.data);
    }
    next();
  } catch (error) {
    logger.error('Error decrypting sensitive data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar datos sensibles'
    });
  }
};

// Middleware para validación de datos personales (GDPR)
export const gdprCompliance = (req, res, next) => {
  const personalDataFields = [
    'name', 'email', 'phone', 'address', 'dateOfBirth', 
    'ssn', 'creditCard', 'biometricData', 'healthData'
  ];

  const hasPersonalData = (obj) => {
    for (const field of personalDataFields) {
      if (obj[field]) {
        return true;
      }
    }
    return false;
  };

  if (req.body && hasPersonalData(req.body)) {
    // Log de procesamiento de datos personales
    logger.info('Personal data processing detected', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      fields: personalDataFields.filter(field => req.body[field])
    });

    // Agregar metadatos de GDPR
    req.body._gdpr = {
      processedAt: new Date().toISOString(),
      purpose: 'Service provision',
      legalBasis: 'Contract',
      retentionPeriod: '7 years',
      dataController: 'MainEvents',
      contact: 'privacy@mainevents.com'
    };
  }

  next();
};

// Middleware para anonimización de datos
export const anonymizeData = (req, res, next) => {
  if (res.locals.data) {
    const anonymizeString = (str) => {
      if (typeof str !== 'string' || str.length < 3) return str;
      return str.charAt(0) + '*'.repeat(str.length - 2) + str.charAt(str.length - 1);
    };

    const anonymizeEmail = (email) => {
      if (!email || !email.includes('@')) return email;
      const [local, domain] = email.split('@');
      return anonymizeString(local) + '@' + domain;
    };

    const anonymizePhone = (phone) => {
      if (!phone || phone.length < 4) return phone;
      return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
    };

    const anonymizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const anonymized = { ...obj };
      
      if (anonymized.email) {
        anonymized.email = anonymizeEmail(anonymized.email);
      }
      
      if (anonymized.phone) {
        anonymized.phone = anonymizePhone(anonymized.phone);
      }
      
      if (anonymized.name) {
        anonymized.name = anonymizeString(anonymized.name);
      }
      
      return anonymized;
    };

    res.locals.data = anonymizeObject(res.locals.data);
  }

  next();
};

// Middleware para validación de retención de datos
export const dataRetentionCheck = (req, res, next) => {
  const retentionPolicies = {
    user: 7 * 365 * 24 * 60 * 60 * 1000, // 7 años
    event: 3 * 365 * 24 * 60 * 60 * 1000, // 3 años
    payment: 10 * 365 * 24 * 60 * 60 * 1000, // 10 años
    log: 1 * 365 * 24 * 60 * 60 * 1000, // 1 año
    default: 2 * 365 * 24 * 60 * 60 * 1000 // 2 años
  };

  const checkRetention = (data, type = 'default') => {
    const retentionPeriod = retentionPolicies[type] || retentionPolicies.default;
    const now = new Date();
    
    if (data.createdAt) {
      const createdAt = new Date(data.createdAt);
      const age = now.getTime() - createdAt.getTime();
      
      if (age > retentionPeriod) {
        logger.warn('Data retention period exceeded', {
          type,
          createdAt: data.createdAt,
          age: age / (1000 * 60 * 60 * 24), // días
          retentionPeriod: retentionPeriod / (1000 * 60 * 60 * 24), // días
          id: data._id || data.id
        });
        
        return false;
      }
    }
    
    return true;
  };

  if (req.body) {
    const dataType = req.path.split('/')[2] || 'default'; // Extraer tipo de la URL
    if (!checkRetention(req.body, dataType)) {
      return res.status(400).json({
        success: false,
        message: 'Datos expirados según política de retención'
      });
    }
  }

  next();
};

// Middleware para logging de acceso a datos
export const dataAccessLogging = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de acceso a datos sensibles
    if (req.path.includes('/api/users') || req.path.includes('/api/participants')) {
      logger.info('Sensitive data access', {
        user: req.user?.id || 'anonymous',
        ip: req.ip,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para validación de consentimiento
export const consentValidation = (req, res, next) => {
  const consentRequired = [
    '/api/register',
    '/api/participants/register',
    '/api/suppliers'
  ];

  const requiresConsent = consentRequired.some(path => req.path.startsWith(path)) && 
                         ['POST', 'PUT', 'PATCH'].includes(req.method);
  
  if (requiresConsent) {
    const consent = req.body?.consent || req.headers['x-consent'];
    
    if (!consent) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere consentimiento para procesar datos personales',
        consentRequired: true
      });
    }
    
    // Log de consentimiento
    logger.info('Consent given for data processing', {
      user: req.user?.id || 'anonymous',
      ip: req.ip,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Middleware para derecho al olvido (GDPR)
export const rightToErasure = (req, res, next) => {
  if (req.method === 'DELETE' && req.path.includes('/api/users/')) {
    const userId = req.params.id;
    
    // Log de solicitud de eliminación
    logger.info('Right to erasure requested', {
      userId,
      requestedBy: req.user?.id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Agregar metadatos de eliminación
    req.body._erasure = {
      requestedAt: new Date().toISOString(),
      requestedBy: req.user?.id,
      reason: 'Right to erasure (GDPR)',
      status: 'pending'
    };
  }

  next();
};

// Middleware para portabilidad de datos
export const dataPortability = (req, res, next) => {
  if (req.path.includes('/api/users/') && req.query.export === 'true') {
    // Log de solicitud de portabilidad
    logger.info('Data portability requested', {
      userId: req.params.id,
      requestedBy: req.user?.id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Agregar metadatos de portabilidad
    req.body._portability = {
      requestedAt: new Date().toISOString(),
      requestedBy: req.user?.id,
      format: req.query.format || 'json',
      status: 'pending'
    };
  }

  next();
};
