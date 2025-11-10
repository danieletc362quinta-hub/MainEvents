import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from 'mercadopago';

// Configuración de Mercado Pago
const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const mp = {
  preferences: new Preference(mpConfig),
  payment: new Payment(mpConfig),
  refund: new PaymentRefund(mpConfig)
};

// Configuración de webhook
const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

// Configuración de monedas soportadas
const SUPPORTED_CURRENCIES = {
  ARS: 'ARS', // Peso argentino
  USD: 'USD', // Dólar estadounidense
  BRL: 'BRL'  // Real brasileño
};

// Configuración de tipos de ticket
const TICKET_TYPES = {
  GENERAL: 'general',
  VIP: 'vip',
  EARLY_BIRD: 'early_bird',
  STUDENT: 'student',
  SENIOR: 'senior'
};

// Precios por defecto (en pesos argentinos)
const DEFAULT_PRICES = {
  [TICKET_TYPES.GENERAL]: 25000, // $25.000 ARS
  [TICKET_TYPES.VIP]: 50000,     // $50.000 ARS
  [TICKET_TYPES.EARLY_BIRD]: 20000, // $20.000 ARS
  [TICKET_TYPES.STUDENT]: 15000, // $15.000 ARS
  [TICKET_TYPES.SENIOR]: 15000   // $15.000 ARS
};

// Función para crear preferencia de pago
export const createPaymentPreference = async ({
  items,
  payer,
  external_reference,
  notification_url,
  back_urls = {},
  expires = true,
  expiration_date_to = null
}) => {
  try {
    const preference = {
      items,
      payer,
      external_reference,
      notification_url,
      back_urls,
      expires,
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" } // Excluir pagos en efectivo por defecto
        ],
        installments: 12 // Hasta 12 cuotas
      },
      auto_return: "approved",
      statement_descriptor: "MainEvents"
    };

    if (expiration_date_to) {
      preference.expiration_date_to = expiration_date_to;
    }

    const response = await mp.preferences.create({ body: preference });
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw new Error(`Error al crear preferencia de pago: ${error.message}`);
  }
};

// Función para procesar webhook
export const processWebhook = async (data) => {
  try {
    // Mercado Pago no requiere verificación de firma como Stripe
    // pero podemos validar el tipo de evento
    const { type, data: eventData } = data;
    
    return {
      type,
      data: eventData,
      isValid: true
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw new Error('Error al procesar webhook');
  }
};

// Función para obtener información del pago
export const getPaymentInfo = async (paymentId) => {
  try {
    const payment = await mp.payment.get({ id: paymentId });
    return payment;
  } catch (error) {
    console.error('Error retrieving payment:', error);
    throw new Error(`Error al obtener información del pago: ${error.message}`);
  }
};

// Función para reembolsar pago
export const refundPayment = async (paymentId, amount = null) => {
  try {
    const refundData = {
      amount: amount ? amount : null
    };

    const refund = await mp.refund.create({
      payment_id: paymentId,
      body: refundData
    });
    
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error(`Error al procesar reembolso: ${error.message}`);
  }
};

// Función para generar ID único de ticket
export const generateTicketId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TKT-MP-${timestamp}-${randomStr}`.toUpperCase();
};

// Función para generar código QR
export const generateQRCode = (ticketId, eventId, userId) => {
  const data = {
    ticketId,
    eventId,
    userId,
    timestamp: Date.now(),
    provider: 'mercadopago'
  };
  
  // En producción, usarías una librería como qrcode
  // Por ahora, retornamos un string codificado
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

// Función para validar ticket
export const validateTicket = (qrCode) => {
  try {
    const data = JSON.parse(Buffer.from(qrCode, 'base64').toString());
    return {
      isValid: true,
      data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Código QR inválido'
    };
  }
};

// Función para calcular precio con descuentos
export const calculatePrice = (basePrice, ticketType, discount = 0) => {
  const typePrice = DEFAULT_PRICES[ticketType] || basePrice;
  const discountAmount = (typePrice * discount) / 100;
  return Math.max(0, typePrice - discountAmount);
};

// Función para formatear precio para Mercado Pago
export const formatPriceForMP = (price, currency = 'ARS') => {
  // Mercado Pago requiere el precio en la moneda base
  return Math.round(price);
};

// Función para formatear precio para mostrar
export const formatPriceForDisplay = (price, currency = 'ARS') => {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  
  return formatter.format(price);
};

// Función para crear items para Mercado Pago
export const createMPItems = (event, ticketType, quantity, customPrice = null) => {
  const basePrice = customPrice || DEFAULT_PRICES[ticketType] || 25000;
  const totalPrice = basePrice * quantity;
  
  return [{
    id: `${event._id}-${ticketType}`,
    title: `${event.name} - ${ticketType.toUpperCase()}`,
    description: `Ticket para ${event.name} - ${ticketType}`,
    picture_url: event.image,
    category_id: "events",
    quantity: quantity,
    unit_price: basePrice,
    currency_id: "ARS"
  }];
};

// Función para crear información del pagador
export const createPayer = (user) => {
  return {
    name: user.name,
    email: user.email,
    identification: {
      type: "DNI",
      number: user.dni || "00000000"
    }
  };
};

// Función para validar estado del pago
export const validatePaymentStatus = (payment) => {
  const status = payment.status;
  const statusDetail = payment.status_detail;
  
  switch (status) {
    case 'approved':
      return { isValid: true, status: 'succeeded' };
    case 'pending':
      return { isValid: false, status: 'pending' };
    case 'in_process':
      return { isValid: false, status: 'processing' };
    case 'rejected':
      return { isValid: false, status: 'failed' };
    case 'cancelled':
      return { isValid: false, status: 'cancelled' };
    case 'refunded':
      return { isValid: false, status: 'refunded' };
    default:
      return { isValid: false, status: 'unknown' };
  }
};

export {
  mp,
  webhookSecret,
  SUPPORTED_CURRENCIES,
  TICKET_TYPES,
  DEFAULT_PRICES
}; 