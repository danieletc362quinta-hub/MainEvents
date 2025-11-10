export const config = {
  PORT: 4000,
  NODE_ENV: 'development',
  
  // MongoDB - Configuración temporal para desarrollo
  // Cambia esto por tu URL de MongoDB Atlas o local
  MONGODB_URI: 'mongodb://localhost:27017/MainEvents',
  
  // JWT
  JWT_SECRET: 'dev-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  
  // CORS
  CORS_ORIGIN: 'http://localhost:3000',
  
  // Logging
  LOG_LEVEL: 'info'
}; 