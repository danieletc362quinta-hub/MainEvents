/**
 * Servicio de Auditoría de Seguridad
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuditService {
  constructor() {
    this.auditLogFile = path.join(__dirname, '../logs/audit.log');
    this.securityEvents = [];
    this.maxEventsInMemory = 1000;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.auditLogFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  logEvent(event) {
    const auditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      level: event.level || 'info',
      category: event.category || 'general',
      action: event.action,
      userId: event.userId || null,
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || 'unknown',
      path: event.path || 'unknown',
      method: event.method || 'unknown',
      statusCode: event.statusCode || 200,
      details: event.details || {},
      riskLevel: this.calculateRiskLevel(event),
      ...event
    };

    this.securityEvents.push(auditEvent);
    
    if (this.securityEvents.length > this.maxEventsInMemory) {
      this.securityEvents.shift();
    }

    this.writeToLogFile(auditEvent);
    this.analyzeEvent(auditEvent);

    return auditEvent;
  }

  calculateRiskLevel(event) {
    let riskScore = 0;

    if (event.statusCode >= 400) riskScore += 1;
    if (event.statusCode >= 500) riskScore += 2;
    if (event.action === 'login_failed') riskScore += 3;
    if (event.action === 'unauthorized_access') riskScore += 4;
    if (event.action === 'suspicious_activity') riskScore += 5;
    if (event.category === 'security') riskScore += 2;
    if (event.category === 'authentication') riskScore += 1;

    if (event.userAgent && (
      event.userAgent.includes('bot') ||
      event.userAgent.includes('crawler') ||
      event.userAgent.includes('scanner')
    )) {
      riskScore += 2;
    }

    const recentFailures = this.getRecentFailures(event.ip, 5);
    if (recentFailures > 3) riskScore += 3;

    if (riskScore >= 8) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    if (riskScore >= 1) return 'low';
    return 'minimal';
  }

  getRecentFailures(ip, minutes = 5) {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.securityEvents.filter(event => 
      event.ip === ip &&
      event.action === 'login_failed' &&
      new Date(event.timestamp) > cutoffTime
    ).length;
  }

  analyzeEvent(event) {
    this.detectSuspiciousPatterns(event);
    this.detectBruteForceAttack(event);
    this.detectUnauthorizedAccess(event);
  }

  detectSuspiciousPatterns(event) {
    const suspiciousPatterns = [
      { pattern: /admin/i, risk: 'high' },
      { pattern: /\.\.\//, risk: 'critical' },
      { pattern: /<script/i, risk: 'critical' },
      { pattern: /union.*select/i, risk: 'critical' }
    ];

    const content = JSON.stringify(event.details);
    
    for (const { pattern, risk } of suspiciousPatterns) {
      if (pattern.test(content)) {
        this.logEvent({
          level: 'warning',
          category: 'security',
          action: 'suspicious_pattern_detected',
          ip: event.ip,
          userId: event.userId,
          details: { pattern: pattern.toString(), risk, originalEvent: event.id }
        });
      }
    }
  }

  detectBruteForceAttack(event) {
    if (event.action === 'login_failed') {
      const recentFailures = this.getRecentFailures(event.ip, 10);
      
      if (recentFailures >= 5) {
        this.logEvent({
          level: 'critical',
          category: 'security',
          action: 'brute_force_attack_detected',
          ip: event.ip,
          details: { failureCount: recentFailures, timeWindow: '10 minutes' }
        });
      }
    }
  }

  detectUnauthorizedAccess(event) {
    if (event.statusCode === 401 || event.statusCode === 403) {
      this.logEvent({
        level: 'warning',
        category: 'security',
        action: 'unauthorized_access_attempt',
        ip: event.ip,
        userId: event.userId,
        details: { statusCode: event.statusCode, path: event.path }
      });
    }
  }

  writeToLogFile(event) {
    try {
      const logEntry = JSON.stringify(event) + '\n';
      fs.appendFileSync(this.auditLogFile, logEntry);
    } catch (error) {
      console.error('Error writing to audit log:', error);
    }
  }

  generateEventId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getEvents(filters = {}) {
    let events = [...this.securityEvents];

    if (filters.level) {
      events = events.filter(event => event.level === filters.level);
    }
    if (filters.category) {
      events = events.filter(event => event.category === filters.category);
    }
    if (filters.userId) {
      events = events.filter(event => event.userId === filters.userId);
    }
    if (filters.ip) {
      events = events.filter(event => event.ip === filters.ip);
    }
    if (filters.riskLevel) {
      events = events.filter(event => event.riskLevel === filters.riskLevel);
    }

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filters.limit) {
      events = events.slice(0, filters.limit);
    }

    return events;
  }

  getAuditStats() {
    const events = this.securityEvents;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      total: events.length,
      last24h: events.filter(e => new Date(e.timestamp) > last24h).length,
      byLevel: this.groupBy(events, 'level'),
      byCategory: this.groupBy(events, 'category'),
      byRiskLevel: this.groupBy(events, 'riskLevel'),
      recentCritical: events.filter(e => e.riskLevel === 'critical').slice(0, 10)
    };
  }

  groupBy(events, field) {
    return events.reduce((acc, event) => {
      const value = event[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}

const auditService = new AuditService();
export default auditService;