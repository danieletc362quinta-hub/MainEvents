import axios from 'axios';

const API_URL = 'http://localhost:4000/api/payments';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const refundService = {
  // Obtener reembolsos del usuario
  async getUserRefunds() {
    const res = await api.get('/refunds');
    return res.data.data || [];
  },

  // Solicitar reembolso
  async requestRefund({ paymentId, amount, reason }) {
    const res = await api.post(`/${paymentId}/refund`, {
      amount,
      reason
    });
    return res.data;
  },

  // Obtener estadísticas de reembolsos
  async getRefundStats() {
    const res = await api.get('/stats');
    return res.data.data;
  }
};




