import crypto from 'crypto';
import { logger } from './logger.js';

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 64; // 512 bits
    
    // Usar clave de encriptación del entorno o generar una por defecto
    this.masterKey = process.env.ENCRYPTION_KEY || this.generateKey();
  }

  // Generar clave de encriptación
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  // Generar salt
  generateSalt() {
    return crypto.randomBytes(this.saltLength).toString('hex');
  }

  // Derivar clave desde password y salt
  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha512');
  }

  // Encriptar datos
  encrypt(data, password = null) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = this.generateSalt();
      
      // Usar password proporcionado o clave maestra
      const key = password ? this.deriveKey(password, salt) : Buffer.from(this.masterKey, 'hex');
      
      const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from(salt, 'hex'));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      logger.error('Error encrypting data:', error);
      throw new Error('Error al encriptar datos');
    }
  }

  // Desencriptar datos
  decrypt(encryptedData, password = null) {
    try {
      const { encrypted, iv, salt, tag, algorithm } = encryptedData;
      
      if (algorithm !== this.algorithm) {
        throw new Error('Algoritmo de encriptación no soportado');
      }
      
      // Usar password proporcionado o clave maestra
      const key = password ? this.deriveKey(password, salt) : Buffer.from(this.masterKey, 'hex');
      
      const decipher = crypto.createDecipherGCM(algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAAD(Buffer.from(salt, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Error decrypting data:', error);
      throw new Error('Error al desencriptar datos');
    }
  }

  // Encriptar datos sensibles en base de datos
  encryptSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard', 'phone', 'email'];
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        try {
          encrypted[field] = this.encrypt(encrypted[field]);
        } catch (error) {
          logger.warn(`Failed to encrypt field ${field}:`, error);
        }
      }
    }

    return encrypted;
  }

  // Desencriptar datos sensibles de base de datos
  decryptSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard', 'phone', 'email'];
    const decrypted = { ...data };

    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'object' && decrypted[field].encrypted) {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          logger.warn(`Failed to decrypt field ${field}:`, error);
        }
      }
    }

    return decrypted;
  }

  // Hash de datos (una sola vía)
  hash(data, salt = null) {
    const actualSalt = salt || this.generateSalt();
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512');
    return {
      hash: hash.toString('hex'),
      salt: actualSalt
    };
  }

  // Verificar hash
  verifyHash(data, hashData) {
    const { hash, salt } = hashData;
    const newHash = this.hash(data, salt);
    return newHash.hash === hash;
  }

  // Generar token seguro
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generar UUID v4
  generateUUID() {
    return crypto.randomUUID();
  }

  // Firmar datos
  sign(data, privateKey = null) {
    const key = privateKey || this.masterKey;
    const signature = crypto.createHmac('sha256', key).update(JSON.stringify(data)).digest('hex');
    return signature;
  }

  // Verificar firma
  verify(data, signature, privateKey = null) {
    const key = privateKey || this.masterKey;
    const expectedSignature = crypto.createHmac('sha256', key).update(JSON.stringify(data)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  }

  // Encriptar archivo
  encryptFile(fileBuffer, password = null) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = this.generateSalt();
      
      const key = password ? this.deriveKey(password, salt) : Buffer.from(this.masterKey, 'hex');
      const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from(salt, 'hex'));
      
      let encrypted = cipher.update(fileBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      logger.error('Error encrypting file:', error);
      throw new Error('Error al encriptar archivo');
    }
  }

  // Desencriptar archivo
  decryptFile(encryptedFile, password = null) {
    try {
      const { encrypted, iv, salt, tag, algorithm } = encryptedFile;
      
      if (algorithm !== this.algorithm) {
        throw new Error('Algoritmo de encriptación no soportado');
      }
      
      const key = password ? this.deriveKey(password, salt) : Buffer.from(this.masterKey, 'hex');
      const decipher = crypto.createDecipherGCM(algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAAD(Buffer.from(salt, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted;
    } catch (error) {
      logger.error('Error decrypting file:', error);
      throw new Error('Error al desencriptar archivo');
    }
  }
}

// Instancia singleton
const encryptionService = new EncryptionService();

export default encryptionService;
