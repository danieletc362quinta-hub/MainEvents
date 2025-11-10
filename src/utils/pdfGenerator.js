import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Genera un PDF para un ticket de evento
 * @param {Object} ticketData - Datos del ticket
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
export const generatePDF = async (ticketData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generar QR Code
      const qrCodeDataURL = await QRCode.toDataURL(ticketData.qrCode, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#2E7D32')
         .text('MainEvents', 50, 50, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Ticket de Entrada', 50, 80, { align: 'center' });

      // Línea separadora
      doc.moveTo(50, 110)
         .lineTo(545, 110)
         .stroke('#2E7D32', 2);

      // Información del evento
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('INFORMACIÓN DEL EVENTO', 50, 130);

      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Evento: ${ticketData.eventName}`, 50, 160)
         .text(`Fecha: ${new Date(ticketData.eventDate).toLocaleDateString('es-ES', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, 50, 180)
         .text(`Ubicación: ${ticketData.eventLocation}`, 50, 200);

      // Información del ticket
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('INFORMACIÓN DEL TICKET', 50, 240);

      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Ticket ID: ${ticketData.ticketId}`, 50, 270)
         .text(`Tipo: ${ticketData.ticketType.toUpperCase()}`, 50, 290)
         .text(`Cantidad: ${ticketData.quantity}`, 50, 310)
         .text(`Precio: $${ticketData.price}`, 50, 330)
         .text(`Estado: ${ticketData.status.toUpperCase()}`, 50, 350);

      // Información del usuario
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('INFORMACIÓN DEL USUARIO', 50, 390);

      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Nombre: ${ticketData.userName}`, 50, 420);

      // QR Code
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('CÓDIGO QR', 300, 240);

      // Convertir data URL a buffer para el PDF
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      
      doc.image(qrBuffer, 300, 270, { width: 150, height: 150 });

      // Términos y condiciones
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('TÉRMINOS Y CONDICIONES:', 50, 500)
         .text('• Este ticket es personal e intransferible', 50, 520)
         .text('• Debe presentarse en la entrada del evento', 50, 540)
         .text('• No se permiten reembolsos después del evento', 50, 560)
         .text('• El organizador se reserva el derecho de admisión', 50, 580);

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#999999')
         .text('Generado el: ' + new Date().toLocaleString('es-ES'), 50, 650, { align: 'center' })
         .text('MainEvents - Sistema de Gestión de Eventos', 50, 670, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera un PDF para múltiples tickets
 * @param {Array} ticketsData - Array de datos de tickets
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
export const generateMultipleTicketsPDF = async (ticketsData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: {
          top: 30,
          bottom: 30,
          left: 30,
          right: 30
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      for (let i = 0; i < ticketsData.length; i++) {
        const ticketData = ticketsData[i];
        
        if (i > 0) {
          doc.addPage();
        }

        // Generar QR Code para este ticket
        const qrCodeDataURL = await QRCode.toDataURL(ticketData.qrCode, {
          width: 100,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Header más compacto para múltiples tickets
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#2E7D32')
           .text('MainEvents', 30, 30, { align: 'center' });

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Ticket de Entrada', 30, 50, { align: 'center' });

        // Información del evento
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('EVENTO', 30, 80);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333333')
           .text(ticketData.eventName, 30, 100)
           .text(new Date(ticketData.eventDate).toLocaleDateString('es-ES'), 30, 115)
           .text(ticketData.eventLocation, 30, 130);

        // Información del ticket
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('TICKET', 30, 160);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`ID: ${ticketData.ticketId}`, 30, 180)
           .text(`Tipo: ${ticketData.ticketType.toUpperCase()}`, 30, 195)
           .text(`Cantidad: ${ticketData.quantity}`, 30, 210)
           .text(`Precio: $${ticketData.price}`, 30, 225);

        // Usuario
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`Usuario: ${ticketData.userName}`, 30, 250);

        // QR Code más pequeño
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(qrBuffer, 400, 80, { width: 100, height: 100 });

        // Estado
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(ticketData.status === 'confirmed' ? '#2E7D32' : '#FF9800')
           .text(`Estado: ${ticketData.status.toUpperCase()}`, 400, 190);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};




