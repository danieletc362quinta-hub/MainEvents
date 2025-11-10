import axios from 'axios';

const API_URL = 'http://localhost:4000/api/stats';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const dashboardService = {
  async getPublicStats() {
    const res = await api.get('/public');
    return res.data;
  },
  async getAdminStats() {
    const res = await api.get('/admin');
    return res.data;
  },
  async getUserStats() {
    const res = await api.get('/user');
    return res.data;
  },
}; 