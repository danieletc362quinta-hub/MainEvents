import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { createTransport } from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.queue = [];
    this.isProcessing = false;
    this.init();
  }

  async init() {
    try {
      this.transporter = createTransport({
        host: config.EMAIL_HOST || 'smtp.gmail.com',
        port: config.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS
        }
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  // Templates HTML
  getTemplates() {
    return {
      welcome: (userName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Bienvenido a MainEvents, ${userName}!</h2>
          <p>Gracias por registrarte en nuestra plataforma de eventos.</p>
          <p>Ya puedes comenzar a explorar eventos increíbles y comprar tickets.</p>
          <a href="${config.FRONTEND_URL}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explorar Eventos</a>
        </div>
      `,
      
      ticketConfirmation: (ticketData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">¡Ticket Confirmado!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>${ticketData.eventName}</h3>
            <p><strong>Fecha:</strong> ${new Date(ticketData.eventDate).toLocaleDateString()}</p>
            <p><strong>Lugar:</strong> ${ticketData.eventLocation}</p>
            <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
            <p><strong>Precio:</strong> $${ticketData.amount}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <img src="data:image/png;base64,${ticketData.qrCode}" alt="QR Code" style="max-width: 200px;">
          </div>
          <p>Presenta este QR code en la entrada del evento.</p>
        </div>
      `,

      eventReminder: (eventData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">¡Recordatorio de Evento!</h2>
          <p>Tu evento está próximo a comenzar:</p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>${eventData.name}</h3>
            <p><strong>Fecha:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date(eventData.date).toLocaleTimeString()}</p>
            <p><strong>Lugar:</strong> ${eventData.location}</p>
          </div>
          <p>¡No olvides llevar tu ticket con el QR code!</p>
        </div>
      `,

      eventCancelled: (eventData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Evento Cancelado</h2>
          <p>Lamentamos informarte que el siguiente evento ha sido cancelado:</p>
          <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>${eventData.name}</h3>
            <p><strong>Fecha:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
            <p><strong>Motivo:</strong> ${eventData.cancellationReason}</p>
          </div>
          <p>Tu reembolso será procesado automáticamente en los próximos días.</p>
        </div>
      `,

      passwordReset: (resetLink) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecer Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Restablecer Contraseña</a>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        </div>
      `,

      eventCreated: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">¡Evento Creado Exitosamente!</h2>
          <p>Hola ${data.userName},</p>
          <p>Tu evento ha sido creado correctamente en MainEvents.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>${data.eventName}</h3>
            <p><strong>Fecha:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
            <p><strong>Lugar:</strong> ${data.eventLocation}</p>
          </div>
          <p>Puedes gestionar tu evento desde tu panel de control.</p>
          <a href="${data.eventUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Ver Evento</a>
          <p>¡Gracias por usar MainEvents!</p>
        </div>
      `
    };
  }

  async sendEmail(to, subject, template, data = {}) {
    const templates = this.getTemplates();
    const htmlContent = templates[template](data);

    const mailOptions = {
      from: `"MainEvents" <${config.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Email failed to ${to}:`, error);
      throw error;
    }
  }

  // Cola de envío para emails masivos
  async addToQueue(to, subject, template, data) {
    this.queue.push({ to, subject, template, data });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const email = this.queue.shift();
      try {
        await this.sendEmail(email.to, email.subject, email.template, email.data);
        // Esperar 1 segundo entre emails para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('❌ Failed to send queued email:', error);
      }
    }

    this.isProcessing = false;
  }

  // Métodos específicos para diferentes tipos de emails
  async sendWelcomeEmail(userEmail, userName) {
    return this.sendEmail(
      userEmail,
      '¡Bienvenido a MainEvents!',
      'welcome',
      { userName }
    );
  }

  async sendTicketConfirmation(userEmail, ticketData) {
    return this.sendEmail(
      userEmail,
      'Ticket Confirmado - MainEvents',
      'ticketConfirmation',
      ticketData
    );
  }

  async sendEventReminder(userEmail, eventData) {
    return this.sendEmail(
      userEmail,
      'Recordatorio de Evento - MainEvents',
      'eventReminder',
      eventData
    );
  }

  async sendEventCancellation(userEmail, eventData) {
    return this.sendEmail(
      userEmail,
      'Evento Cancelado - MainEvents',
      'eventCancelled',
      eventData
    );
  }

  async sendPasswordReset(userEmail, resetLink) {
    return this.sendEmail(
      userEmail,
      'Restablecer Contraseña - MainEvents',
      'passwordReset',
      { resetLink }
    );
  }

  async sendEventCreatedEmail(userEmail, eventData) {
    return this.sendEmail(
      userEmail,
      'Evento Creado Exitosamente - MainEvents',
      'eventCreated',
      eventData
    );
  }

  // Envío masivo para notificaciones
  async sendBulkEmail(emails, subject, template, data) {
    const promises = emails.map(email => 
      this.addToQueue(email, subject, template, data)
    );
    
    return Promise.all(promises);
  }
}

export default new EmailService(); 