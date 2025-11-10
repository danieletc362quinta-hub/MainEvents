import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Para enviar cookies
});

// No necesitamos interceptor porque usamos cookies automáticamente

// API pública para eventos destacados (sin autenticación)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const eventService = {
  async getAll(params) {
    const res = await publicApi.get('/events/all', { params });
    return res.data;
  },
  async getUserEvents(params) {
    const res = await api.get('/events', { params });
    return res.data;
  },
  async getById(id) {
    const res = await publicApi.get(`/events/${id}`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/events', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
  async attend(id, data = {}) {
    console.log('🎫 Service: Enviando petición de asistencia:', { id, data });
    const res = await api.post(`/events/attend/${id}`, data);
    console.log('🎫 Service: Respuesta recibida:', res.data);
    return res.data;
  },
  async favorite(id) {
    const res = await api.post(`/events/favorite`, { eventId: id });
    return res.data;
  },
  async comment(id, comment) {
    const res = await api.post(`/events/comment`, { eventId: id, comment });
    return res.data;
  },
  // Eventos destacados (sin autenticación)
  async getFeatured(limit = 6) {
    const res = await publicApi.get(`/events/featured?limit=${limit}`);
    return res.data;
  },

  // Subir imagen de evento
  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const res = await api.post('/events/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
}; 