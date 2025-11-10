/**
 * Utilidades para manejar la autenticación JWT
 */

const TOKEN_KEY = 'mainevents_auth_token';
const USER_KEY = 'mainevents_user';

/**
 * Almacena el token JWT en el almacenamiento local
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    // Configura el token en el encabezado de axios por defecto
    if (typeof window !== 'undefined') {
      const axios = require('axios');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } else {
    removeAuthToken();
  }
};

/**
 * Obtiene el token JWT almacenado
 * @returns {string|null} Token JWT o null si no existe
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Elimina el token JWT del almacenamiento local
 */
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Elimina el token del encabezado de axios
    const axios = require('axios');
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Verificar si el token es válido (sin expiración o expiración futura)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return false;
  }
};

/**
 * Obtiene los datos del usuario desde el token JWT
 * @returns {Object|null} Datos del usuario o null si no hay token
 */
export const getUserFromToken = () => {
  if (typeof window === 'undefined') return null;
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user || null;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

/**
 * Almacena los datos del usuario en el almacenamiento local
 * @param {Object} user - Datos del usuario
 */
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Obtiene los datos del usuario del almacenamiento local
 * @returns {Object|null} Datos del usuario o null si no existen
 */
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    removeAuthToken();
    // Redirigir a la página de inicio de sesión
    window.location.href = '/login';
  }
};

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
  getUserFromToken,
  setUser,
  getUser,
  logout
};
