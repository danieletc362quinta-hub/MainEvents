import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const paymentService = {
  /**
   * Procesa un pago con tarjeta de crédito
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async processCreditCardPayment(paymentData) {
    try {
      const response = await axios.post(
        `${API_URL}/payments/credit-card`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al procesar pago con tarjeta:', error);
      throw error;
    }
  },

  /**
   * Crea una orden de pago con PayPal
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<Object>} Respuesta de PayPal
   */
  async createPayPalOrder(orderData) {
    try {
      const response = await axios.post(
        `${API_URL}/payments/paypal/create-order`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear orden de PayPal:', error);
      throw error;
    }
  },

  /**
   * Captura un pago de PayPal
   * @param {string} orderId - ID de la orden de PayPal
   * @returns {Promise<Object>} Respuesta de la captura
   */
  async capturePayPalOrder(orderId) {
    try {
      const response = await axios.post(
        `${API_URL}/payments/paypal/capture-order`,
        { orderId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al capturar orden de PayPal:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un pago
   * @param {string} paymentId - ID del pago
   * @returns {Promise<Object>} Detalles del pago
   */
  async getPaymentDetails(paymentId) {
    try {
      const response = await axios.get(
        `${API_URL}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del pago:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de pagos del usuario
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de pagos
   */
  async getPaymentHistory(filters = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/payments/history`,
        {
          params: filters,
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de pagos:', error);
      throw error;
    }
  }
};

export default paymentService;
