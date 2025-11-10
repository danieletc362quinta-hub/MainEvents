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

export const paymentService = {
  async createPreference(data) {
    const res = await api.post('/create', data);
    return res.data;
  },
  async getUserPayments() {
    const res = await api.get('/tickets');
    return res.data.tickets || [];
  },
  async refund(id) {
    const res = await api.post('/refund', { paymentId: id });
    return res.data;
  },
  async validateTicket(data) {
    const res = await api.post('/validate-ticket', data);
    return res.data;
  },
  async getUserTickets() {
    const res = await api.get('/tickets');
    return res.data.tickets || [];
  },
}; 