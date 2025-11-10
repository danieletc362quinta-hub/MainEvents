# 🚀 MainEvents - Sistema Avanzado de Eventos

## 📋 Índice
1. [Sistema de Notificaciones](#sistema-de-notificaciones)
2. [Sistema de Cupones y Descuentos](#sistema-de-cupones-y-descuentos)
3. [Sistema de Auditoría](#sistema-de-auditoría)
4. [Transferencia de Tickets](#transferencia-de-tickets)
5. [Análisis y Reportes](#análisis-y-reportes)
6. [Tareas Programadas](#tareas-programadas)
7. [Configuración Avanzada](#configuración-avanzada)

---

## 📧 Sistema de Notificaciones

### Características
- **Templates HTML personalizados** para diferentes tipos de emails
- **Cola de envío** para emails masivos
- **Múltiples proveedores** de email (Gmail, SendGrid, etc.)
- **Rate limiting** para evitar bloqueos

### Tipos de Emails
1. **Bienvenida** - Para nuevos usuarios
2. **Confirmación de Ticket** - Con QR code incluido
3. **Recordatorio de Evento** - 24h antes del evento
4. **Cancelación de Evento** - Con información de reembolso
5. **Restablecimiento de Contraseña** - Con enlace seguro

### Configuración
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación
```

### Uso
```javascript
import EmailService from './services/email.service.js';

// Enviar email de bienvenida
await EmailService.sendWelcomeEmail('usuario@email.com', 'Nombre Usuario');

// Enviar confirmación de ticket
await EmailService.sendTicketConfirmation('usuario@email.com', {
  eventName: 'Concierto Rock',
  eventDate: new Date(),
  eventLocation: 'Teatro Colón',
  ticketId: 'TICKET123',
  amount: 5000,
  qrCode: 'base64-qr-code'
});
```

---

## 🎫 Sistema de Cupones y Descuentos

### Tipos de Cupones
1. **Porcentual** - Descuento del X% (ej: 20% off)
2. **Fijo** - Descuento de $X (ej: $1000 off)
3. **Envío Gratuito** - Sin costo de envío
4. **Compra 1 Lleva 1** - BOGO

### Características Avanzadas
- **Fechas de validez** personalizables
- **Límites de uso** por cupón y por usuario
- **Restricciones por evento** o categoría
- **Monto mínimo** de compra
- **Solo usuarios nuevos** o con antigüedad mínima
- **Campañas y metadatos** para tracking

### Uso
```javascript
import Coupon from './models/coupon.model.js';

// Crear cupón
const coupon = await Coupon.create({
  code: 'WELCOME20',
  name: 'Bienvenida 20%',
  type: 'percentage',
  value: 20,
  maxDiscount: 2000,
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
  maxUses: 100,
  maxUsesPerUser: 1,
  createdBy: userId
});

// Validar cupón
const validCoupon = await Coupon.findValidCoupon('WELCOME20', userId, eventId, amount);

// Calcular descuento
const discount = validCoupon.calculateDiscount(amount);
```

---

## 📋 Sistema de Auditoría

### Eventos Auditados
- **Autenticación**: Login, logout, registro, cambio de contraseña
- **Eventos**: Crear, actualizar, eliminar, publicar, cancelar
- **Pagos**: Crear, confirmar, reembolsar, fallar
- **Tickets**: Comprar, validar, transferir, reembolsar
- **Cupones**: Crear, usar, desactivar
- **Usuarios**: Actualizar, eliminar, banear, cambiar rol
- **Sistema**: Configuración, backup, mantenimiento

### Características
- **Registro completo** de todas las acciones
- **Datos antes y después** de cambios
- **IP y User Agent** del usuario
- **Tiempo de respuesta** de cada acción
- **Severidad** de eventos (LOW, MEDIUM, HIGH, CRITICAL)
- **Limpieza automática** de logs antiguos

### Uso
```javascript
import Audit from './models/audit.model.js';

// Registrar acción
await Audit.logAction({
  user: userId,
  action: 'EVENT_CREATE',
  resource: 'EVENT',
  resourceId: eventId,
  before: null,
  after: eventData,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  httpMethod: req.method,
  url: req.originalUrl,
  statusCode: res.statusCode,
  responseTime: responseTime,
  success: true
});

// Obtener historial de usuario
const userActivity = await Audit.getUserActivity(userId);

// Obtener eventos de seguridad
const securityEvents = await Audit.getSecurityEvents(7); // últimos 7 días
```

---

## 🔄 Transferencia de Tickets

### Tipos de Transferencia
1. **Regalo** - Sin costo
2. **Venta** - Con precio personalizado
3. **Intercambio** - Por otro ticket

### Características
- **Expiración automática** de ofertas
- **Mensajes** entre vendedor y comprador
- **Historial completo** de la transferencia
- **Validación de tickets** antes de transferir
- **Comisión de plataforma** configurable

### Uso
```javascript
import TicketTransfer from './models/ticket-transfer.model.js';

// Crear transferencia
const transfer = await TicketTransfer.createTransfer({
  originalTicket: ticketId,
  fromUser: sellerId,
  toUser: buyerId,
  transferType: 'sale',
  transferPrice: 8000,
  platformFee: 800,
  sellerMessage: 'Vendo por urgencia',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
});

// Aceptar transferencia
await transfer.accept(buyerId, 'Perfecto, lo compro');

// Rechazar transferencia
await transfer.reject(buyerId, 'Precio muy alto');

// Cancelar transferencia
await transfer.cancel(sellerId);
```

---

## 📊 Análisis y Reportes

### Métricas del Sistema
- **Usuarios**: Total, crecimiento, nuevos este mes, activos
- **Eventos**: Total, activos, crecimiento, nuevos
- **Pagos**: Total, pendientes, tasa de éxito, precio promedio
- **Ingresos**: Total, este mes, crecimiento, valor promedio de orden

### Análisis de Eventos
- **Top eventos** por ventas
- **Rendimiento por categoría**
- **Análisis por ubicación**
- **Análisis de precios**
- **Utilización de capacidad**
- **Tendencias temporales**

### Análisis de Usuarios
- **Demografía** por rol y edad
- **Comportamiento** de compra
- **Retención** y engagement
- **Adquisición** y churn

### Análisis Financiero
- **Ingresos** por período
- **Análisis de pagos** y reembolsos
- **Comisiones** y fees
- **Proyecciones** de ingresos

### Uso
```javascript
import AnalyticsService from './services/analytics.service.js';

// Métricas generales
const metrics = await AnalyticsService.getSystemMetrics();

// Análisis de eventos
const eventAnalytics = await AnalyticsService.getEventAnalytics(null, '30d');

// Análisis de usuarios
const userAnalytics = await AnalyticsService.getUserAnalytics('30d');

// Análisis financiero
const financialAnalytics = await AnalyticsService.getFinancialAnalytics('30d');
```

---

## 🕐 Tareas Programadas

### Tareas Automáticas
1. **Recordatorios de eventos** - Diario a las 9 AM
2. **Limpieza de eventos** - Semanal (domingos a las 2 AM)
3. **Expiración de cupones** - Cada hora
4. **Expiración de transferencias** - Cada 30 minutos
5. **Limpieza de auditoría** - Mensual (día 1 a las 3 AM)
6. **Limpieza de cache** - Cada 6 horas
7. **Backup de base de datos** - Diario a las 3 AM
8. **Verificación de salud** - Cada 15 minutos
9. **Reconciliación de pagos** - Cada 2 horas
10. **Engagement de usuarios** - Semanal (lunes a las 10 AM)

### Control de Tareas
```javascript
import SchedulerService from './services/scheduler.service.js';

// Obtener estado de tareas
const taskStatus = SchedulerService.getTaskStatus();

// Ejecutar tarea manualmente
await SchedulerService.runTask('eventReminders');

// Detener todas las tareas
SchedulerService.stopAllTasks();
```

---

## ⚙️ Configuración Avanzada

### Variables de Entorno
```env
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key

# Frontend
FRONTEND_URL=http://localhost:3000

# Analytics
ANALYTICS_CACHE_TTL=300000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Monitoring
ENABLE_MONITORING=true
MONITORING_INTERVAL=900000
```

### Estructura de Archivos
```
src/
├── services/
│   ├── email.service.js          # Servicio de emails
│   ├── analytics.service.js      # Servicio de análisis
│   └── scheduler.service.js      # Tareas programadas
├── models/
│   ├── coupon.model.js           # Modelo de cupones
│   ├── audit.model.js            # Modelo de auditoría
│   └── ticket-transfer.model.js  # Modelo de transferencias
└── config.js                     # Configuración centralizada
```

---

## 🚀 Próximas Funcionalidades

### En Desarrollo
- [ ] **Sistema de notificaciones push**
- [ ] **Integración con WhatsApp Business**
- [ ] **Sistema de recomendaciones**
- [ ] **Gamificación y puntos**
- [ ] **API de terceros** (Google Calendar, Outlook)
- [ ] **Sistema de encuestas** post-evento
- [ ] **Integración con redes sociales**
- [ ] **Sistema de afiliados**
- [ ] **Marketplace de proveedores**
- [ ] **Sistema de subastas** de tickets

### Mejoras Técnicas
- [ ] **Cache con Redis** para mejor rendimiento
- [ ] **Microservicios** para escalabilidad
- [ ] **Docker y Kubernetes** para deployment
- [ ] **CI/CD pipeline** automatizado
- [ ] **Monitoreo con Prometheus/Grafana**
- [ ] **Logs centralizados** con ELK Stack
- [ ] **Tests automatizados** (unit, integration, e2e)
- [ ] **Documentación de API** con Swagger
- [ ] **Rate limiting** avanzado
- [ ] **Backup automático** en la nube

---

## 📞 Soporte

Para soporte técnico o consultas sobre las funcionalidades avanzadas:

- **Email**: soporte@mainevents.com
- **Documentación**: https://docs.mainevents.com
- **GitHub**: https://github.com/mainevents/backend
- **Discord**: https://discord.gg/mainevents

---

**¡MainEvents - El mejor backend de eventos del mundo! 🎉** 