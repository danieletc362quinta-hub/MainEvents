import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traducciones completas y unificadas
const translations = {
  es: {
    // Navegación
    nav: {
      home: 'Inicio',
      events: 'Eventos',
      suppliers: 'Proveedores',
      dashboard: 'Dashboard',
      profile: 'Perfil',
      settings: 'Configuración',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      language: 'Idioma',
      search: 'Buscar',
      searchPlaceholder: 'Buscar eventos, proveedores...',
      notifications: 'Notificaciones',
      menu: 'Menú',
      close: 'Cerrar'
    },
    
    // Mensajes comunes
    common: {
      loading: 'Cargando...',
      saving: 'Guardando...',
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      close: 'Cerrar',
      retry: 'Reintentar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      continue: 'Continuar',
      yes: 'Sí',
      no: 'No',
      ok: 'Aceptar'
    },
    
    // Autenticación
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Teléfono',
      location: 'Ubicación',
      bio: 'Biografía',
      rememberMe: 'Recordarme',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes una cuenta?',
      haveAccount: '¿Ya tienes una cuenta?',
      loginSuccess: 'Inicio de sesión exitoso',
      registerSuccess: 'Registro exitoso',
      logoutSuccess: 'Sesión cerrada correctamente'
    },
    
    // Eventos
    events: {
      title: 'Eventos',
      subtitle: 'Descubre los mejores eventos',
      loading: 'Cargando eventos...',
      noEvents: 'No hay eventos disponibles',
      noEventsDescription: 'No se encontraron eventos que coincidan con tus criterios de búsqueda',
      createFirst: 'Crea tu primer evento',
      found: 'encontrados',
      free: 'Gratis',
      views: 'vistas',
      viewDetails: 'Ver Evento',
      gridView: 'Vista de cuadrícula',
      listView: 'Vista de lista',
      
      // Categorías
      categories: {
        music: 'Música',
        sports: 'Deportes',
        art: 'Arte',
        technology: 'Tecnología',
        business: 'Negocios',
        education: 'Educación'
      },
      
      // Filtros
      filters: {
        title: 'Filtros',
        showAdvanced: 'Mostrar filtros avanzados',
        hideAdvanced: 'Ocultar filtros avanzados',
        searchingFor: '¿Qué estás buscando?',
        category: 'Categoría',
        allCategories: 'Todas las categorías',
        date: 'Fecha',
        anyDate: 'Cualquier fecha',
        today: 'Hoy',
        tomorrow: 'Mañana',
        thisWeek: 'Esta semana',
        thisMonth: 'Este mes',
        nextMonth: 'Próximo mes',
        price: 'Precio',
        anyPrice: 'Cualquier precio',
        free: 'Gratis',
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto',
        sortBy: 'Ordenar por',
        name: 'Nombre',
        popularity: 'Popularidad',
        rating: 'Calificación',
        clearAll: 'Limpiar todo',
        applyFilters: 'Aplicar filtros',
        reset: 'Restablecer'
      }
    },
    
    // Dashboard
    dashboard: {
      title: 'Panel de Control',
      welcome: 'Bienvenido de nuevo, aquí tienes un resumen de tu actividad',
      stats: {
        totalEvents: 'Eventos Totales',
        attendees: 'Asistentes',
        revenue: 'Ingresos',
        rating: 'Calificación',
        thisMonth: 'Este mes',
        totalRegistered: 'Total registrados',
        average: 'Promedio'
      },
      sections: {
        recentEvents: 'Eventos Recientes',
        upcomingEvents: 'Próximos Eventos',
        notifications: 'Notificaciones'
      },
      buttons: {
        newEvent: 'Nuevo Evento'
      },
      status: {
        completed: 'Completado',
        active: 'Activo'
      },
      attendees: 'asistentes'
    }
  },
  
  en: {
    // Navigation
    nav: {
      home: 'Home',
      events: 'Events',
      suppliers: 'Suppliers',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      language: 'Language',
      search: 'Search',
      searchPlaceholder: 'Search events, suppliers...',
      notifications: 'Notifications',
      menu: 'Menu',
      close: 'Close'
    },
    
    // Common messages
    common: {
      loading: 'Loading...',
      saving: 'Saving...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      retry: 'Retry',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      continue: 'Continue',
      yes: 'Yes',
      no: 'No',
      ok: 'OK'
    },
    
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      location: 'Location',
      bio: 'Bio',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot your password?',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      logoutSuccess: 'Logout successful'
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back, here\'s a summary of your activity',
      stats: {
        totalEvents: 'Total Events',
        attendees: 'Attendees',
        revenue: 'Revenue',
        rating: 'Rating',
        thisMonth: 'This month',
        totalRegistered: 'Total registered',
        average: 'Average'
      },
      sections: {
        recentEvents: 'Recent Events',
        upcomingEvents: 'Upcoming Events',
        notifications: 'Notifications'
      },
      buttons: {
        newEvent: 'New Event'
      },
      status: {
        completed: 'Completed',
        active: 'Active'
      },
      attendees: 'attendees'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const stored = localStorage.getItem('language');
    return stored && ['es', 'en'].includes(stored) ? stored : 'es';
  });

  // Guardar idioma en localStorage y actualizar el atributo lang del HTML
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  };

  // Función para obtener traducciones anidadas
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : path), obj);
  };

  // Función de traducción
  const t = (key, variables = {}) => {
    // Obtener el valor anidado de las traducciones
    let value = getNestedValue(translations[currentLanguage] || translations['es'], key);
    
    // Si no se encuentra la traducción y no estamos en español, intentar en español
    if (value === key && currentLanguage !== 'es') {
      value = getNestedValue(translations.es, key);
    }
    
    // Si aún no se encuentra, devolver la clave
    if (value === key) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Reemplazar variables en la cadena de traducción
    if (typeof value === 'string') {
      return Object.keys(variables).reduce(
        (str, varKey) => str.replace(new RegExp(`{{${varKey}}}`, 'g'), variables[varKey]),
        value
      );
    }
    
    return value || key;
  };

  // Valor del contexto
  const value = {
    t,
    currentLanguage,
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getAvailableLanguages: () => [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' }
    ],
    formatDate: (date, options = {}) => {
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(date);
    },
    formatNumber: (number, options = {}) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    formatCurrency: (amount, currency = 'USD', options = {}) => {
      const currencyMap = {
        es: 'EUR',
        en: 'USD'
      };
      
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currencyMap[currentLanguage] || currency,
        ...options
      }).format(amount);
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

