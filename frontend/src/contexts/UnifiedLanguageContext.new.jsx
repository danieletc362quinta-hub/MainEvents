import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
export const LanguageContext = createContext();

// Hook personalizado para usar el contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traducciones
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

// Proveedor de contexto
export const LanguageProvider = ({ children }) => {
  // Estado para el idioma actual
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Intentar obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'es'; // Por defecto español
  });

  // Efecto para guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Función para cambiar el idioma
  const changeLanguage = (language) => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  };

  // Función para obtener una traducción anidada
  const getNestedTranslation = (obj, path) => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : path), obj);
  };

  // Función de traducción
  const t = (key, variables = {}) => {
    // Obtener la traducción
    let translation = getNestedTranslation(translations[currentLanguage] || translations['es'], key);
    
    // Si no se encuentra la traducción, intentar en el idioma por defecto (español)
    if (translation === key && currentLanguage !== 'es') {
      translation = getNestedTranslation(translations['es'], key);
    }
    
    // Si aún no se encuentra, mostrar advertencia y devolver la clave
    if (translation === key) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Reemplazar variables en la cadena de traducción
    if (typeof translation === 'string') {
      return Object.entries(variables).reduce(
        (str, [key, value]) => str.replace(new RegExp(`{{${key}}}`, 'g'), value),
        translation
      );
    }
    
    return translation;
  };

  // Valor del contexto
  const contextValue = {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' }
    ]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
