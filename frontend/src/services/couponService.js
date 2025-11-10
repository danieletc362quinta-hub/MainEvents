import axios from 'axios';

const API_URL = 'http://localhost:4000/api/coupons';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const couponService = {
  async getActive() {
    const res = await api.get('/active');
    return res.data.coupons || [];
  },
  async getUserCoupons() {
    const res = await api.get('/user');
    return res.data.coupons || [];
  },
  async create(data) {
    const res = await api.post('/create', data);
    return res.data;
  },
  async validate(data) {
    const res = await api.post('/validate', data);
    return res.data;
  },
  async deactivate(id) {
    const res = await api.put(`/${id}/deactivate`);
    return res.data;
  },
  async stats() {
    const res = await api.get('/stats');
    return res.data;
  },
}; 