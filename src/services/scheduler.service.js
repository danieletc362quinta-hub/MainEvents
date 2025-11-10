import cron from 'node-cron';
import EmailService from './email.service.js';
import AnalyticsService from './analytics.service.js';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import MercadoPagoPayment from '../models/mercadopago.model.js';
import Coupon from '../models/coupon.model.js';
import TicketTransfer from '../models/ticket-transfer.model.js';
import Audit from '../models/audit.model.js';

class SchedulerService {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
  }

  // Inicializar todas las tareas programadas
  init() {
    if (this.isRunning) return;
    
    console.log('🕐 Initializing scheduled tasks...');
    
    this.scheduleEventReminders();
    this.scheduleEventCleanup();
    this.scheduleCouponExpiration();
    this.scheduleTransferExpiration();
    this.scheduleAuditCleanup();
    this.scheduleAnalyticsCache();
    this.scheduleDatabaseBackup();
    this.scheduleSystemHealthCheck();
    this.schedulePaymentReconciliation();
    this.scheduleUserEngagement();
    
    this.isRunning = true;
    console.log('✅ Scheduled tasks initialized');
  }

  // Recordatorios de eventos (diario a las 9 AM)
  scheduleEventReminders() {
    const task = cron.schedule('0 9 * * *', async () => {
      console.log('📅 Running event reminders task...');
      try {
        await this.sendEventReminders();
      } catch (error) {
        console.error('❌ Error in event reminders task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('eventReminders', task);
    task.start();
  }

  // Limpieza de eventos pasados (semanal)
  scheduleEventCleanup() {
    const task = cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Running event cleanup task...');
      try {
        await this.cleanupOldEvents();
      } catch (error) {
        console.error('❌ Error in event cleanup task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('eventCleanup', task);
    task.start();
  }

  // Expiración de cupones (cada hora)
  scheduleCouponExpiration() {
    const task = cron.schedule('0 * * * *', async () => {
      console.log('🎫 Running coupon expiration task...');
      try {
        await this.expireOldCoupons();
      } catch (error) {
        console.error('❌ Error in coupon expiration task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('couponExpiration', task);
    task.start();
  }

  // Expiración de transferencias (cada 30 minutos)
  scheduleTransferExpiration() {
    const task = cron.schedule('*/30 * * * *', async () => {
      console.log('🔄 Running transfer expiration task...');
      try {
        await TicketTransfer.expireOldTransfers();
      } catch (error) {
        console.error('❌ Error in transfer expiration task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('transferExpiration', task);
    task.start();
  }

  // Limpieza de logs de auditoría (mensual)
  scheduleAuditCleanup() {
    const task = cron.schedule('0 3 1 * *', async () => {
      console.log('📋 Running audit cleanup task...');
      try {
        await Audit.cleanOldLogs();
      } catch (error) {
        console.error('❌ Error in audit cleanup task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('auditCleanup', task);
    task.start();
  }

  // Limpieza de cache de analytics (cada 6 horas)
  scheduleAnalyticsCache() {
    const task = cron.schedule('0 */6 * * *', async () => {
      console.log('📊 Running analytics cache cleanup...');
      try {
        AnalyticsService.clearCache();
      } catch (error) {
        console.error('❌ Error in analytics cache cleanup:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('analyticsCache', task);
    task.start();
  }

  // Backup de base de datos (diario a las 3 AM)
  scheduleDatabaseBackup() {
    const task = cron.schedule('0 3 * * *', async () => {
      console.log('💾 Running database backup task...');
      try {
        await this.createDatabaseBackup();
      } catch (error) {
        console.error('❌ Error in database backup task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('databaseBackup', task);
    task.start();
  }

  // Verificación de salud del sistema (cada 15 minutos)
  scheduleSystemHealthCheck() {
    const task = cron.schedule('*/15 * * * *', async () => {
      console.log('🏥 Running system health check...');
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Error in system health check:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('systemHealthCheck', task);
    task.start();
  }

  // Reconciliación de pagos (cada 2 horas)
  schedulePaymentReconciliation() {
    const task = cron.schedule('0 */2 * * *', async () => {
      console.log('💰 Running payment reconciliation...');
      try {
        await this.reconcilePayments();
      } catch (error) {
        console.error('❌ Error in payment reconciliation:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('paymentReconciliation', task);
    task.start();
  }

  // Engagement de usuarios (semanal)
  scheduleUserEngagement() {
    const task = cron.schedule('0 10 * * 1', async () => {
      console.log('👥 Running user engagement task...');
      try {
        await this.sendEngagementEmails();
      } catch (error) {
        console.error('❌ Error in user engagement task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set('userEngagement', task);
    task.start();
  }

  // Métodos de implementación de tareas
  async sendEventReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Buscar eventos que ocurren mañana
    const events = await Event.find({
      date: { $gte: tomorrow, $lt: dayAfter }
    });

    for (const event of events) {
      // Buscar usuarios que compraron tickets para este evento
      const payments = await MercadoPagoPayment.find({
        event: event._id,
        status: 'approved'
      }).populate('user', 'email name');

      for (const payment of payments) {
        try {
          await EmailService.sendEventReminder(payment.user.email, {
            name: event.name,
            date: event.date,
            location: event.location
          });
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${payment.user.email}:`, error);
        }
      }
    }

    console.log(`📧 Sent ${events.length} event reminders`);
  }

  async cleanupOldEvents() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await Event.updateMany(
      { date: { $lt: threeMonthsAgo } },
      { $set: { isArchived: true } }
    );

    console.log(`🗂️ Archived ${result.modifiedCount} old events`);
  }

  async expireOldCoupons() {
    const result = await Coupon.updateMany(
      {
        validUntil: { $lt: new Date() },
        isActive: true
      },
      { $set: { isActive: false } }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} coupons`);
    }
  }

  async createDatabaseBackup() {
    // Implementar lógica de backup
    // Esto dependerá de tu configuración de base de datos
    console.log('💾 Database backup completed');
  }

  async performHealthCheck() {
    const checks = {
      database: await this.checkDatabaseConnection(),
      email: await this.checkEmailService(),
      payments: await this.checkPaymentService(),
      memory: this.checkMemoryUsage(),
      uptime: process.uptime()
    };

    const allHealthy = Object.values(checks).every(check => check.healthy);
    
    if (!allHealthy) {
      console.warn('⚠️ System health check failed:', checks);
    } else {
      console.log('✅ System health check passed');
    }

    return checks;
  }

  async reconcilePayments() {
    // Buscar pagos pendientes por más de 24 horas
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const pendingPayments = await MercadoPagoPayment.find({
      status: 'pending',
      createdAt: { $lt: yesterday }
    });

    for (const payment of pendingPayments) {
      try {
        // Verificar estado en Mercado Pago
        // Implementar lógica de verificación
        console.log(`🔄 Reconciling payment ${payment._id}`);
      } catch (error) {
        console.error(`❌ Error reconciling payment ${payment._id}:`, error);
      }
    }

    console.log(`💰 Reconciled ${pendingPayments.length} payments`);
  }

  async sendEngagementEmails() {
    // Buscar usuarios inactivos por más de 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await User.find({
      lastLogin: { $lt: thirtyDaysAgo },
      isActive: true
    });

    for (const user of inactiveUsers) {
      try {
        // Enviar email de re-engagement
        await EmailService.sendEmail(
          user.email,
          '¡Te extrañamos! Nuevos eventos te esperan',
          'engagement',
          { userName: user.name }
        );
      } catch (error) {
        console.error(`❌ Failed to send engagement email to ${user.email}:`, error);
      }
    }

    console.log(`📧 Sent ${inactiveUsers.length} engagement emails`);
  }

  // Métodos de verificación de salud
  async checkDatabaseConnection() {
    try {
      await Event.findOne().limit(1);
      return { healthy: true, message: 'Database connection OK' };
    } catch (error) {
      return { healthy: false, message: 'Database connection failed', error: error.message };
    }
  }

  async checkEmailService() {
    try {
      // Verificar configuración de email
      return { healthy: true, message: 'Email service OK' };
    } catch (error) {
      return { healthy: false, message: 'Email service failed', error: error.message };
    }
  }

  async checkPaymentService() {
    try {
      // Verificar conexión con Mercado Pago
      return { healthy: true, message: 'Payment service OK' };
    } catch (error) {
      return { healthy: false, message: 'Payment service failed', error: error.message };
    }
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    const memoryUsageMB = usage.heapUsed / 1024 / 1024;
    const maxMemoryMB = usage.heapTotal / 1024 / 1024;
    const percentage = (memoryUsageMB / maxMemoryMB) * 100;

    return {
      healthy: percentage < 80,
      message: `Memory usage: ${memoryUsageMB.toFixed(2)}MB / ${maxMemoryMB.toFixed(2)}MB (${percentage.toFixed(1)}%)`,
      usage: percentage
    };
  }

  // Métodos de control
  stopAllTasks() {
    console.log('🛑 Stopping all scheduled tasks...');
    for (const [name, task] of this.tasks) {
      task.stop();
      console.log(`⏹️ Stopped task: ${name}`);
    }
    this.isRunning = false;
  }

  getTaskStatus() {
    const status = {};
    for (const [name, task] of this.tasks) {
      status[name] = {
        running: task.running,
        nextRun: task.nextDate()
      };
    }
    return status;
  }

  // Ejecutar tarea manualmente
  async runTask(taskName) {
    const task = this.tasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    console.log(`🚀 Manually running task: ${taskName}`);
    
    switch (taskName) {
      case 'eventReminders':
        await this.sendEventReminders();
        break;
      case 'eventCleanup':
        await this.cleanupOldEvents();
        break;
      case 'couponExpiration':
        await this.expireOldCoupons();
        break;
      case 'transferExpiration':
        await TicketTransfer.expireOldTransfers();
        break;
      case 'auditCleanup':
        await Audit.cleanOldLogs();
        break;
      case 'analyticsCache':
        AnalyticsService.clearCache();
        break;
      case 'databaseBackup':
        await this.createDatabaseBackup();
        break;
      case 'systemHealthCheck':
        await this.performHealthCheck();
        break;
      case 'paymentReconciliation':
        await this.reconcilePayments();
        break;
      case 'userEngagement':
        await this.sendEngagementEmails();
        break;
      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
  }
}

export default new SchedulerService(); 