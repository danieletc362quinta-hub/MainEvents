import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const notificationService = {
  async getAll() {
    const res = await api.get('/notifications');
    return res.data.notifications || [];
  },
  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/notifications', data);
    return res.data;
  },
}; 