import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import connectDB from './config/database.js'
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import eventRoutes from './routes/event.routes.js'

import reviewRoutes from './routes/review.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import mercadopagoRoutes from './routes/mercadopago.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import supplierRoutes from './routes/supplier.routes.js'
import participantRoutes from './routes/participant.routes.js'
import monitoringRoutes from './routes/monitoring.routes.js'
import socialAuthRoutes from './routes/socialAuth.routes.js'
import ticketRoutes from './routes/ticket.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import { getPublicStats } from './controllers/dashboard.controller.js'
import { 
  healthCheckMiddleware, 
  availabilityCheckMiddleware, 
  availabilityLoggingMiddleware,
  resourceCheckMiddleware 
} from './middlewares/healthCheck.js'
import monitoringMiddleware from './middlewares/monitoring.middleware.js'
import advancedSecurityMiddleware from './middlewares/advancedSecurity.middleware.js'
import auditService from './services/audit.service.js'
import {
  sanitizeInput,
  securityHeaders,
  securityLogging,
  advancedRateLimit,
  sensitiveDataProtection,
  payloadSizeLimit,
  fileTypeValidation,
  originValidation
} from './middlewares/security.js'
import {
  encryptSensitiveData,
  decryptSensitiveData,
  gdprCompliance,
  dataRetentionCheck,
  dataAccessLogging,
  consentValidation,
  rightToErasure,
  dataPortability
} from './middlewares/dataProtection.js'
import monitoringService from './services/monitoring.service.js'

const app = express()

// Conectar a la base de datos
connectDB()

// Monitoring middleware (debe ir antes de otros middlewares)
app.use(monitoringMiddleware.monitor())
app.use(monitoringMiddleware.healthCheck())
app.use(monitoringMiddleware.metrics())

// Advanced security middleware
app.use(advancedSecurityMiddleware.securityHeaders())
app.use(advancedSecurityMiddleware.detectSuspiciousActivity())
app.use(advancedSecurityMiddleware.intelligentRateLimit())
app.use(advancedSecurityMiddleware.securityAudit())

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:4000"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:4000", "http://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS configuration
app.use(cors({
  origin: true, // Permitir todos los orígenes en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Consent'],
}))

// Rate limiting configurations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false,
  // Key generator for rate limiting
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
})

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Skip successful auth attempts
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
})

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
})

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
})

// Apply rate limiting
app.use('/api/', limiter)
app.use('/api/register', authLimiter)
app.use('/api/login', authLimiter)
app.use('/api/events', apiLimiter)
app.use('/api/payments', apiLimiter)
app.use('/api/coupons', apiLimiter)

// Security middlewares
app.use(securityHeaders)
app.use(securityLogging)
app.use(sanitizeInput)
app.use(sensitiveDataProtection)
app.use(payloadSizeLimit(5 * 1024 * 1024)) // 5MB limit
app.use(fileTypeValidation(['image/jpeg', 'image/png', 'image/gif', 'image/webp']))
// app.use(originValidation(process.env.ALLOWED_ORIGINS?.split(',') || []))

// Data protection middlewares
app.use(gdprCompliance)
app.use(dataRetentionCheck)
app.use(dataAccessLogging)
// app.use(consentValidation) // Deshabilitado temporalmente para desarrollo
app.use(rightToErasure)
app.use(dataPortability)

// Health check and availability middlewares
app.use(availabilityCheckMiddleware)
app.use(availabilityLoggingMiddleware)
app.use(resourceCheckMiddleware)
app.use(healthCheckMiddleware)

// Logging
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'))

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000,
}))
app.use(cookieParser())

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// Iniciar servicio de monitoreo
monitoringService.start()

// Ruta pública de estadísticas
app.get('/api/stats/public', getPublicStats)

// API routes
app.use("/api", authRoutes)
app.use("/api", eventRoutes)

app.use("/api", reviewRoutes)
app.use("/api", notificationRoutes)
app.use("/api", dashboardRoutes)
app.use("/api/payments", mercadopagoRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api", supplierRoutes)
app.use("/api", participantRoutes)
app.use("/api", monitoringRoutes)
app.use("/api/social", socialAuthRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/notifications", notificationRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    })
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    })
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value',
      field: Object.keys(err.keyPattern)[0]
    })
  }
  
  res.status(err.status || 500).json({
    error: config.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

export default app