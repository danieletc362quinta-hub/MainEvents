import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traducciones simplificadas pero completas
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
    
    // Eventos
    events: {
      title: 'Eventos',
      subtitle: 'Descubre los mejores eventos de tu ciudad. Filtra, busca y encuentra tu próxima experiencia inolvidable.',
      search: 'Buscar eventos...',
      found: 'encontrado',
      createEvent: 'Crear Evento',
      editEvent: 'Editar Evento',
      deleteEvent: 'Eliminar Evento',
      eventTitle: 'Título del Evento',
      description: 'Descripción',
      date: 'Fecha',
      time: 'Hora',
      location: 'Ubicación',
      price: 'Precio',
      capacity: 'Capacidad',
      category: 'Categoría',
      image: 'Imagen',
      tags: 'Etiquetas',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
      cancelled: 'Cancelado',
      featured: 'Eventos Destacados',
      upcoming: 'Próximos Eventos',
      past: 'Eventos Pasados',
      allEvents: 'Todos los Eventos',
      noEvents: 'No se encontraron eventos',
      noEventsDescription: 'Intenta ajustar los filtros o busca con otros términos.',
      createNewEvent: 'Crear Nuevo Evento',
      eventDetails: 'Detalles del Evento',
      participants: 'Participantes',
      comments: 'Comentarios',
      reviews: 'Reseñas',
      share: 'Compartir',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      join: 'Unirse',
      leave: 'Salir',
      full: 'Completo',
      available: 'Disponible',
      soldOut: 'Agotado',
      viewDetails: 'Ver Detalles',
      addToFavorites: 'Agregar a favoritos',
      removeFromFavorites: 'Remover de favoritos',
      attendees: 'asistentes',
      views: 'visitas',
      viewMore: 'Ver más',
      gridView: 'Vista de cuadrícula',
      listView: 'Vista de lista',
      filters: {
        title: 'Filtros y Búsqueda',
        category: 'Categoría',
        date: 'Fecha',
        price: 'Precio',
        sort: 'Ordenar',
        all: 'Todos',
        anyDate: 'Cualquier fecha',
        anyPrice: 'Cualquier precio',
        free: 'Gratis',
        lowPrice: 'Menos de $50',
        mediumPrice: '$50 - $200',
        highPrice: 'Más de $200',
        sortByDate: 'Por fecha',
        sortByPrice: 'Por precio',
        sortByName: 'Por nombre',
        sortByPopularity: 'Por popularidad',
        sortByRating: 'Por calificación',
        clearFilters: 'Limpiar Filtros'
      },
      categories: {
        musical: 'Musical',
        sport: 'Deportivo',
        cultural: 'Cultural',
        technology: 'Tecnológico',
        business: 'Empresarial',
        educational: 'Educativo'
      }
    },
    
    // Tiempo
    time: {
      now: 'Ahora',
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes',
      thisYear: 'Este Año',
      lastWeek: 'Semana Pasada',
      lastMonth: 'Mes Pasado',
      lastYear: 'Año Pasado',
      nextWeek: 'Próxima Semana',
      nextMonth: 'Próximo Mes',
      nextYear: 'Próximo Año'
    },
    
    // Mensajes del sistema
    messages: {
      success: {
        eventCreated: 'Evento creado exitosamente',
        eventUpdated: 'Evento actualizado exitosamente',
        eventDeleted: 'Evento eliminado exitosamente',
        userRegistered: 'Usuario registrado exitosamente',
        userLoggedIn: 'Usuario inició sesión exitosamente',
        userLoggedOut: 'Usuario cerró sesión exitosamente',
        profileUpdated: 'Perfil actualizado exitosamente',
        settingsSaved: 'Configuración guardada exitosamente',
        dataSaved: 'Datos guardados exitosamente'
      },
      error: {
        generic: 'Ha ocurrido un error inesperado',
        network: 'Error de conexión. Verifica tu internet.',
        unauthorized: 'No tienes permisos para realizar esta acción',
        forbidden: 'Acceso denegado',
        notFound: 'Recurso no encontrado',
        validation: 'Datos de entrada inválidos',
        server: 'Error interno del servidor',
        loginFailed: 'Credenciales inválidas',
        registrationFailed: 'Error al registrar usuario',
        eventNotFound: 'Evento no encontrado',
        supplierNotFound: 'Proveedor no encontrado',
        userNotFound: 'Usuario no encontrado',
        fileUploadFailed: 'Error al subir archivo',
        paymentFailed: 'Error en el pago',
        emailSendFailed: 'Error al enviar email'
      },
      warning: {
        unsavedChanges: 'Tienes cambios sin guardar',
        confirmDelete: '¿Estás seguro de que quieres eliminar este elemento?',
        sessionExpired: 'Tu sesión ha expirado',
        lowStorage: 'Espacio de almacenamiento bajo',
        maintenanceMode: 'El sistema está en modo mantenimiento'
      },
      info: {
        loading: 'Cargando...',
        noData: 'No hay datos disponibles',
        searchResults: 'Resultados de búsqueda',
        filtersApplied: 'Filtros aplicados',
        dataUpdated: 'Datos actualizados',
        newVersionAvailable: 'Nueva versión disponible'
      }
    },
    
    // Formularios
    forms: {
      required: 'Campo requerido',
      invalidEmail: 'Email inválido',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      invalidPhone: 'Número de teléfono inválido',
      invalidDate: 'Fecha inválida',
      invalidTime: 'Hora inválida',
      invalidPrice: 'Precio inválido',
      invalidCapacity: 'Capacidad inválida',
      fileTooLarge: 'El archivo es demasiado grande',
      invalidFileType: 'Tipo de archivo no válido',
      maxLength: 'Máximo {max} caracteres',
      minLength: 'Mínimo {min} caracteres',
      selectOption: 'Selecciona una opción',
      uploadFile: 'Subir archivo',
      dragAndDrop: 'Arrastra y suelta archivos aquí',
      or: 'o',
      browse: 'Examinar',
      remove: 'Eliminar',
      save: 'Guardar',
      cancel: 'Cancelar',
      submit: 'Enviar',
      reset: 'Limpiar',
      loading: 'Cargando...',
      saving: 'Guardando...',
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      refresh: 'Actualizar'
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
    
    // Events
    events: {
      title: 'Events',
      subtitle: 'Discover the best events in your city. Filter, search and find your next unforgettable experience.',
      search: 'Search events...',
      found: 'found',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      eventTitle: 'Event Title',
      description: 'Description',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      price: 'Price',
      capacity: 'Capacity',
      category: 'Category',
      image: 'Image',
      tags: 'Tags',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      cancelled: 'Cancelled',
      featured: 'Featured Events',
      upcoming: 'Upcoming Events',
      past: 'Past Events',
      allEvents: 'All Events',
      noEvents: 'No events found',
      noEventsDescription: 'Try adjusting the filters or search with other terms.',
      createNewEvent: 'Create New Event',
      eventDetails: 'Event Details',
      participants: 'Participants',
      comments: 'Comments',
      reviews: 'Reviews',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      join: 'Join',
      leave: 'Leave',
      full: 'Full',
      available: 'Available',
      soldOut: 'Sold Out',
      viewDetails: 'View Details',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      attendees: 'attendees',
      views: 'views',
      viewMore: 'View more',
      gridView: 'Grid view',
      listView: 'List view',
      filters: {
        title: 'Filters and Search',
        category: 'Category',
        date: 'Date',
        price: 'Price',
        sort: 'Sort',
        all: 'All',
        anyDate: 'Any date',
        anyPrice: 'Any price',
        free: 'Free',
        lowPrice: 'Under $50',
        mediumPrice: '$50 - $200',
        highPrice: 'Over $200',
        sortByDate: 'By date',
        sortByPrice: 'By price',
        sortByName: 'By name',
        sortByPopularity: 'By popularity',
        sortByRating: 'By rating',
        clearFilters: 'Clear Filters'
      },
      categories: {
        musical: 'Musical',
        sport: 'Sport',
        cultural: 'Cultural',
        technology: 'Technology',
        business: 'Business',
        educational: 'Educational'
      }
    },
    
    // Time
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      lastYear: 'Last Year',
      nextWeek: 'Next Week',
      nextMonth: 'Next Month',
      nextYear: 'Next Year'
    },
    
    // System messages
    messages: {
      success: {
        eventCreated: 'Event created successfully',
        eventUpdated: 'Event updated successfully',
        eventDeleted: 'Event deleted successfully',
        userRegistered: 'User registered successfully',
        userLoggedIn: 'User logged in successfully',
        userLoggedOut: 'User logged out successfully',
        profileUpdated: 'Profile updated successfully',
        settingsSaved: 'Settings saved successfully',
        dataSaved: 'Data saved successfully'
      },
      error: {
        generic: 'An unexpected error occurred',
        network: 'Connection error. Check your internet.',
        unauthorized: 'You do not have permission to perform this action',
        forbidden: 'Access denied',
        notFound: 'Resource not found',
        validation: 'Invalid input data',
        server: 'Internal server error',
        loginFailed: 'Invalid credentials',
        registrationFailed: 'User registration failed',
        eventNotFound: 'Event not found',
        supplierNotFound: 'Supplier not found',
        userNotFound: 'User not found',
        fileUploadFailed: 'File upload failed',
        paymentFailed: 'Payment failed',
        emailSendFailed: 'Email send failed'
      },
      warning: {
        unsavedChanges: 'You have unsaved changes',
        confirmDelete: 'Are you sure you want to delete this item?',
        sessionExpired: 'Your session has expired',
        lowStorage: 'Low storage space',
        maintenanceMode: 'System is in maintenance mode'
      },
      info: {
        loading: 'Loading...',
        noData: 'No data available',
        searchResults: 'Search results',
        filtersApplied: 'Filters applied',
        dataUpdated: 'Data updated',
        newVersionAvailable: 'New version available'
      }
    },
    
    // Forms
    forms: {
      required: 'Required field',
      invalidEmail: 'Invalid email',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      invalidPhone: 'Invalid phone number',
      invalidDate: 'Invalid date',
      invalidTime: 'Invalid time',
      invalidPrice: 'Invalid price',
      invalidCapacity: 'Invalid capacity',
      fileTooLarge: 'File is too large',
      invalidFileType: 'Invalid file type',
      maxLength: 'Maximum {max} characters',
      minLength: 'Minimum {min} characters',
      selectOption: 'Select an option',
      uploadFile: 'Upload file',
      dragAndDrop: 'Drag and drop files here',
      or: 'or',
      browse: 'Browse',
      remove: 'Remove',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      reset: 'Reset',
      loading: 'Loading...',
      saving: 'Saving...',
      success: 'Success!',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      refresh: 'Refresh'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Prioridad: localStorage > navegador > español
    const stored = localStorage.getItem('language');
    if (stored && ['es', 'en'].includes(stored)) {
      return stored;
    }
    
    const browserLang = navigator.language.split('-')[0];
    return ['es', 'en'].includes(browserLang) ? browserLang : 'es';
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Función de traducción con interpolación
  const t = (key, params = {}) => {
    console.log(`🔍 Translating key: ${key} in language: ${language}`);
    const keys = key.split('.');
    
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) {
      console.warn(`❌ Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    // Interpolación de parámetros
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    console.log(`✅ Translation found: ${value}`);
    return value;
  };

  // Función para cambiar idioma
  const changeLanguage = (newLanguage) => {
    console.log('🔄 Changing language from', language, 'to', newLanguage);
    if (['es', 'en'].includes(newLanguage)) {
      setLanguage(newLanguage);
      console.log('✅ Language changed to:', newLanguage);
    } else {
      console.warn(`❌ Unsupported language: ${newLanguage}`);
    }
  };

  // Función para obtener idioma actual
  const getCurrentLanguage = () => language;

  // Función para obtener idiomas disponibles
  const getAvailableLanguages = () => [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const value = {
    language,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
