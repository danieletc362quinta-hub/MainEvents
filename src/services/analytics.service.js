import mongoose from 'mongoose';
import Event from '../models/events.model.js';
import User from '../models/user.model.js';
import MercadoPagoPayment from '../models/mercadopago.model.js';
import Coupon from '../models/coupon.model.js';
import Audit from '../models/audit.model.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Métricas generales del sistema
  async getSystemMetrics() {
    const cacheKey = 'system_metrics';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalEvents,
      totalPayments,
      totalRevenue,
      activeEvents,
      pendingPayments
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      MercadoPagoPayment.countDocuments(),
      this.calculateTotalRevenue(),
      Event.countDocuments({ date: { $gte: new Date() } }),
      MercadoPagoPayment.countDocuments({ status: 'pending' })
    ]);

    const metrics = {
      users: {
        total: totalUsers,
        growth: await this.calculateGrowthRate('User'),
        newThisMonth: await this.countNewThisMonth('User'),
        activeThisMonth: await this.countActiveThisMonth()
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        growth: await this.calculateGrowthRate('Event'),
        newThisMonth: await this.countNewThisMonth('Event')
      },
      payments: {
        total: totalPayments,
        pending: pendingPayments,
        successRate: await this.calculatePaymentSuccessRate(),
        averageTicketPrice: await this.calculateAverageTicketPrice()
      },
      revenue: {
        total: totalRevenue,
        thisMonth: await this.calculateMonthlyRevenue(),
        growth: await this.calculateRevenueGrowth(),
        averageOrderValue: await this.calculateAverageOrderValue()
      }
    };

    this.setCached(cacheKey, metrics);
    return metrics;
  }

  // Análisis de eventos
  async getEventAnalytics(eventId = null, timeRange = '30d') {
    const cacheKey = `event_analytics_${eventId}_${timeRange}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(timeRange);
    
    if (eventId) {
      return this.getSingleEventAnalytics(eventId, dateFilter);
    }

    const analytics = {
      topEvents: await this.getTopEvents(dateFilter),
      categoryPerformance: await this.getCategoryPerformance(dateFilter),
      locationAnalysis: await this.getLocationAnalysis(dateFilter),
      priceAnalysis: await this.getPriceAnalysis(dateFilter),
      capacityUtilization: await this.getCapacityUtilization(dateFilter),
      trends: await this.getEventTrends(dateFilter)
    };

    this.setCached(cacheKey, analytics);
    return analytics;
  }

  // Análisis de usuarios
  async getUserAnalytics(timeRange = '30d') {
    const cacheKey = `user_analytics_${timeRange}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(timeRange);

    const analytics = {
      demographics: await this.getUserDemographics(),
      behavior: await this.getUserBehavior(dateFilter),
      retention: await this.getUserRetention(dateFilter),
      engagement: await this.getUserEngagement(dateFilter),
      acquisition: await this.getUserAcquisition(dateFilter),
      churn: await this.getUserChurn(dateFilter)
    };

    this.setCached(cacheKey, analytics);
    return analytics;
  }

  // Análisis de pagos y finanzas
  async getFinancialAnalytics(timeRange = '30d') {
    const cacheKey = `financial_analytics_${timeRange}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(timeRange);

    const analytics = {
      revenue: await this.getRevenueAnalysis(dateFilter),
      payments: await this.getPaymentAnalysis(dateFilter),
      refunds: await this.getRefundAnalysis(dateFilter),
      fees: await this.getFeeAnalysis(dateFilter),
      projections: await this.getRevenueProjections(dateFilter)
    };

    this.setCached(cacheKey, analytics);
    return analytics;
  }

  // Métodos privados para cálculos específicos
  async calculateTotalRevenue() {
    const result = await MercadoPagoPayment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async calculateMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await MercadoPagoPayment.aggregate([
      { 
        $match: { 
          status: 'approved',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async calculateRevenueGrowth() {
    const currentMonth = await this.calculateMonthlyRevenue();
    const lastMonth = await this.calculateLastMonthRevenue();
    
    if (lastMonth === 0) return 0;
    return ((currentMonth - lastMonth) / lastMonth) * 100;
  }

  async calculateLastMonthRevenue() {
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const result = await MercadoPagoPayment.aggregate([
      { 
        $match: { 
          status: 'approved',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async calculatePaymentSuccessRate() {
    const [total, approved] = await Promise.all([
      MercadoPagoPayment.countDocuments(),
      MercadoPagoPayment.countDocuments({ status: 'approved' })
    ]);
    
    return total > 0 ? (approved / total) * 100 : 0;
  }

  async calculateAverageTicketPrice() {
    const result = await MercadoPagoPayment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, average: { $avg: '$amount' } } }
    ]);
    return result[0]?.average || 0;
  }

  async calculateAverageOrderValue() {
    const result = await MercadoPagoPayment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$user', total: { $sum: '$amount' } } },
      { $group: { _id: null, average: { $avg: '$total' } } }
    ]);
    return result[0]?.average || 0;
  }

  async getTopEvents(dateFilter) {
    return MercadoPagoPayment.aggregate([
      { $match: { status: 'approved', createdAt: dateFilter } },
      { $group: { _id: '$event', totalSales: { $sum: '$amount' }, tickets: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          eventName: '$event.name',
          totalSales: 1,
          tickets: 1,
          averagePrice: { $divide: ['$totalSales', '$tickets'] }
        }
      }
    ]);
  }

  async getCategoryPerformance(dateFilter) {
    return MercadoPagoPayment.aggregate([
      { $match: { status: 'approved', createdAt: dateFilter } },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.type',
          totalSales: { $sum: '$amount' },
          tickets: { $sum: 1 },
          events: { $addToSet: '$event._id' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalSales: 1,
          tickets: 1,
          eventCount: { $size: '$events' },
          averageTicketPrice: { $divide: ['$totalSales', '$tickets'] }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
  }

  async getUserDemographics() {
    return User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          averageAge: { $avg: '$age' }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          averageAge: { $round: ['$averageAge', 1] }
        }
      }
    ]);
  }

  async getUserBehavior(dateFilter) {
    return MercadoPagoPayment.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$amount' },
          ticketsBought: { $sum: 1 },
          eventsAttended: { $addToSet: '$event' }
        }
      },
      {
        $project: {
          userId: '$_id',
          totalSpent: 1,
          ticketsBought: 1,
          uniqueEvents: { $size: '$eventsAttended' },
          averageTicketPrice: { $divide: ['$totalSpent', '$ticketsBought'] }
        }
      },
      {
        $group: {
          _id: null,
          averageSpent: { $avg: '$totalSpent' },
          averageTickets: { $avg: '$ticketsBought' },
          averageEvents: { $avg: '$uniqueEvents' }
        }
      }
    ]);
  }

  async getRevenueAnalysis(dateFilter) {
    return MercadoPagoPayment.aggregate([
      { $match: { status: 'approved', createdAt: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          tickets: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
  }

  // Métodos de utilidad
  getDateFilter(timeRange) {
    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return { $gte: start, $lte: now };
  }

  async calculateGrowthRate(model) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [lastMonthCount, thisMonthCount] = await Promise.all([
      mongoose.model(model).countDocuments({ createdAt: { $lt: thisMonth } }),
      mongoose.model(model).countDocuments({ createdAt: { $gte: thisMonth } })
    ]);

    if (lastMonthCount === 0) return 0;
    return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  }

  async countNewThisMonth(model) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return mongoose.model(model).countDocuments({ createdAt: { $gte: startOfMonth } });
  }

  async countActiveThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return User.countDocuments({ lastLogin: { $gte: startOfMonth } });
  }

  // Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Métodos adicionales que se implementarán según necesidad
  async getSingleEventAnalytics(eventId, dateFilter) {
    // Implementar análisis específico de un evento
    return {};
  }

  async getLocationAnalysis(dateFilter) {
    // Implementar análisis por ubicación
    return {};
  }

  async getPriceAnalysis(dateFilter) {
    // Implementar análisis de precios
    return {};
  }

  async getCapacityUtilization(dateFilter) {
    // Implementar análisis de utilización de capacidad
    return {};
  }

  async getEventTrends(dateFilter) {
    // Implementar tendencias de eventos
    return {};
  }

  async getUserRetention(dateFilter) {
    // Implementar análisis de retención
    return {};
  }

  async getUserEngagement(dateFilter) {
    // Implementar análisis de engagement
    return {};
  }

  async getUserAcquisition(dateFilter) {
    // Implementar análisis de adquisición
    return {};
  }

  async getUserChurn(dateFilter) {
    // Implementar análisis de churn
    return {};
  }

  async getPaymentAnalysis(dateFilter) {
    // Implementar análisis de pagos
    return {};
  }

  async getRefundAnalysis(dateFilter) {
    // Implementar análisis de reembolsos
    return {};
  }

  async getFeeAnalysis(dateFilter) {
    // Implementar análisis de comisiones
    return {};
  }

  async getRevenueProjections(dateFilter) {
    // Implementar proyecciones de ingresos
    return {};
  }
}

export default new AnalyticsService(); 