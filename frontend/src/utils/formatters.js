/**
 * Utilidades para formatear datos en la aplicación
 */

/**
 * Formatea un precio en formato de moneda
 * @param {number} price - El precio a formatear
 * @param {string} currency - La moneda (por defecto 'ARS')
 * @returns {string} El precio formateado
 */
export const formatPrice = (price, currency = 'ARS') => {
  if (!price && price !== 0) return 'Gratis';
  
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - La fecha a formatear
 * @param {string} format - El formato deseado ('short', 'long', 'time')
 * @returns {string} La fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const options = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    time: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };
  
  return dateObj.toLocaleDateString('es-AR', options[format] || options.short);
};

/**
 * Formatea una fecha relativa (ej: "hace 2 días")
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} La fecha relativa
 */
export const formatRelativeDate = (date) => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  
  return `Hace ${Math.floor(diffDays / 365)} años`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - El número a formatear
 * @returns {string} El número formateado
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('es-AR').format(number);
};

/**
 * Formatea una duración en minutos a formato legible
 * @param {number} minutes - Los minutos a formatear
 * @returns {string} La duración formateada
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 1) return 'Duración no especificada';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formatea un porcentaje
 * @param {number} value - El valor a formatear
 * @param {number} total - El total para calcular el porcentaje
 * @returns {string} El porcentaje formateado
 */
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}; 