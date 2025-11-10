import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env o env.local
dotenv.config({ path: path.join(__dirname, '../env.local') });
dotenv.config();

export const config = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/MainEvents',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true' || !process.env.MONGODB_URI,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  TOKEN_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  
  // Server
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  
  // Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Analytics
  ANALYTICS_CACHE_TTL: parseInt(process.env.ANALYTICS_CACHE_TTL) || 5 * 60 * 1000, // 5 minutes
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Redis (for caching and sessions)
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Monitoring
  ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true',
  MONITORING_INTERVAL: parseInt(process.env.MONITORING_INTERVAL) || 15 * 60 * 1000, // 15 minutes
};

// Backward compatibility
export const TOKEN_SECRET = config.JWT_SECRET;