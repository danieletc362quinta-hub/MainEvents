import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tickets';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ticketService = {
  // Obtener tickets del usuario
  async getUserTickets() {
    const res = await api.get('/user');
    return res.data.data || [];
  },

  // Obtener ticket por ID
  async getTicketById(ticketId) {
    const res = await api.get(`/${ticketId}`);
    return res.data.data;
  },

  // Obtener estadísticas de tickets
  async getTicketStats() {
    const res = await api.get('/stats');
    return res.data.data;
  },
  
  // Transferir ticket
  async transferTicket(data) {
    const res = await api.post('/transfer', data);
    return res.data;
  },
  
  // Descargar ticket en PDF
  async downloadTicket(ticketId) {
    const res = await api.get(`/${ticketId}/download`, {
      responseType: 'blob'
    });
    
    // Crear URL para descarga
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticketId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Descarga iniciada' };
  },
  
  // Validar ticket
  async validateTicket(data) {
    const res = await api.post('/validate', data);
    return res.data;
  },

  // Check-in de ticket (para organizadores)
  async checkInTicket(data) {
    const res = await api.post('/checkin', data);
    return res.data;
  }
}; 