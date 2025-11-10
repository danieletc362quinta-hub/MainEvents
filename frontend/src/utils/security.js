/**
 * Utilidades de seguridad para MainEvents
 * Implementación de buenas prácticas de seguridad en el frontend
 */

// Configuración de Content Security Policy
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Necesario para React en desarrollo
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necesario para Material-UI
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://api.mainevents.com',
    'https://www.google-analytics.com'
  ],
  'frame-src': [
    "'none'"
  ],
  'object-src': [
    "'none'"
  ],
  'base-uri': [
    "'self'"
  ],
  'form-action': [
    "'self'"
  ]
};

// Función para generar CSP header
export const generateCSPHeader = () => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Sanitización de entrada de usuario
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

// Validación de email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validación de contraseña
export const validatePassword = (password) => {
  const minLength = 6;
  const maxLength = 128;
  
  if (!password || password.length < minLength || password.length > maxLength) {
    return {
      isValid: false,
      message: `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres`
    };
  }
  
  return { isValid: true };
};

// Validación de teléfono
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true }; // Opcional
  
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(phone) || cleanPhone.length < 8 || cleanPhone.length > 20) {
    return {
      isValid: false,
      message: 'Formato de teléfono inválido'
    };
  }
  
  return { isValid: true };
};

// Función para detectar XSS
export const detectXSS = (input) => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Función para escapar HTML
export const escapeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
};

// Función para generar token CSRF
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Función para validar token CSRF
export const validateCSRFToken = (token, storedToken) => {
  return token && storedToken && token === storedToken;
};

// Configuración de cookies seguras
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 día
};

// Función para establecer cookie segura
export const setSecureCookie = (name, value, options = {}) => {
  const config = { ...COOKIE_CONFIG, ...options };
  const cookieString = `${name}=${value}; ${Object.entries(config)
    .map(([key, val]) => `${key}=${val}`)
    .join('; ')}`;
  
  document.cookie = cookieString;
};

// Función para obtener cookie
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Función para eliminar cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// Función para limpiar datos sensibles del localStorage
export const clearSensitiveData = () => {
  const sensitiveKeys = ['token', 'password', 'ssn', 'creditCard'];
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// Función para validar URL
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Función para detectar intentos de phishing
export const detectPhishing = (url) => {
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /goo\.gl/i,
    /t\.co/i,
    /facebook\.com\/l\.php/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
};

// Función para generar nonce
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Función para validar nonce
export const validateNonce = (nonce, storedNonce) => {
  return nonce && storedNonce && nonce === storedNonce;
};

// Configuración de rate limiting en el cliente
export const RATE_LIMIT_CONFIG = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxConsecutiveFailures: 5
};

// Clase para manejar rate limiting
export class RateLimiter {
  constructor(config = RATE_LIMIT_CONFIG) {
    this.config = config;
    this.requests = [];
    this.consecutiveFailures = 0;
  }
  
  canMakeRequest() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Limpiar requests antiguos
    this.requests = this.requests.filter(time => time > windowStart);
    
    // Verificar límite de requests
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Verificar límite de fallos consecutivos
    if (this.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      return false;
    }
    
    return true;
  }
  
  recordRequest() {
    this.requests.push(Date.now());
  }
  
  recordFailure() {
    this.consecutiveFailures++;
  }
  
  recordSuccess() {
    this.consecutiveFailures = 0;
  }
}

// Función para detectar bots
export const detectBot = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
};

// Función para generar hash seguro
export const generateSecureHash = async (input) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Función para validar JWT
export const validateJWT = (token) => {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiración
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// Función para limpiar logs en producción
export const secureLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'production') {
    // En producción, no logear datos sensibles
    console.log(message);
  } else {
    // En desarrollo, logear todo
    console.log(message, data);
  }
};

// Configuración de headers de seguridad
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader()
};

export default {
  CSP_CONFIG,
  generateCSPHeader,
  sanitizeInput,
  validateEmail,
  validatePassword,
  validatePhone,
  detectXSS,
  escapeHTML,
  generateCSRFToken,
  validateCSRFToken,
  COOKIE_CONFIG,
  setSecureCookie,
  getCookie,
  deleteCookie,
  clearSensitiveData,
  validateURL,
  detectPhishing,
  generateNonce,
  validateNonce,
  RATE_LIMIT_CONFIG,
  RateLimiter,
  detectBot,
  generateSecureHash,
  validateJWT,
  secureLog,
  SECURITY_HEADERS
};

