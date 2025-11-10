import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Configurar axios para enviar cookies automáticamente
axios.defaults.withCredentials = true;

class AuthService {
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await axios.post(`${API_URL}/logout`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData) {
    try {
      const response = await axios.put(`${API_URL}/profile`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verificar si el usuario está autenticado
  async checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      return response.data.user;
    } catch (error) {
      // Si hay error de JWT, limpiar cookies
      if (error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  // Limpiar autenticación
  clearAuth() {
    // Limpiar cookies del navegador
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  handleError(error) {
    console.error('Error en authService:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      const errorData = error.response.data;
      const errorMessage = errorData.error || errorData.message || 'Error del servidor';
      const errorDetails = errorData.details || errorData.field || '';
      
      return {
        message: errorMessage,
        status: error.response.status,
        details: errorDetails,
        field: errorData.field
      };
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      return {
        message: 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
        status: 0
      };
    } else {
      // Algo más pasó
      return {
        message: error.message || 'Error desconocido',
        status: 0
      };
    }
  }
}

export default new AuthService();