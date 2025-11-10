// Sistema de internacionalización para MainEvents
export const translations = {
  es: {
    // Navegación
    navigation: {
      home: 'Inicio',
      events: 'Eventos',
      createEvent: 'Crear Evento',
      profile: 'Perfil',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      dashboard: 'Panel de Control',
      admin: 'Administración',
      suppliers: 'Proveedores',
      participants: 'Participantes'
    },
    
    // Autenticación
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      name: 'Nombre',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      loginSuccess: 'Inicio de sesión exitoso',
      registerSuccess: 'Registro exitoso',
      logoutSuccess: 'Sesión cerrada exitosamente'
    },
    
    // Eventos
    events: {
      title: 'Eventos',
      createEvent: 'Crear Evento',
      editEvent: 'Editar Evento',
      deleteEvent: 'Eliminar Evento',
      eventName: 'Nombre del Evento',
      description: 'Descripción',
      date: 'Fecha',
      endDate: 'Fecha de Finalización',
      location: 'Ubicación',
      capacity: 'Capacidad',
      price: 'Precio',
      category: 'Categoría',
      type: 'Tipo',
      status: 'Estado',
      visibility: 'Visibilidad',
      tags: 'Etiquetas',
      image: 'Imagen',
      organizer: 'Organizador',
      duration: 'Duración (minutos)',
      streamingUrl: 'URL de Streaming',
      public: 'Público',
      private: 'Privado',
      active: 'Activo',
      inactive: 'Inactivo',
      cancelled: 'Cancelado',
      completed: 'Completado',
      musical: 'Musical',
      sports: 'Deportivo',
      cultural: 'Cultural',
      business: 'Empresarial',
      entertainment: 'Entretenimiento',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      attend: 'Asistir',
      favorite: 'Favorito',
      comment: 'Comentar',
      comments: 'Comentarios',
      noEvents: 'No hay eventos disponibles',
      loadingEvents: 'Cargando eventos...',
      eventCreated: 'Evento creado exitosamente',
      eventUpdated: 'Evento actualizado exitosamente',
      eventDeleted: 'Evento eliminado exitosamente',
      eventAttended: 'Te has registrado al evento',
      eventFavorited: 'Evento agregado a favoritos',
      eventUnfavorited: 'Evento removido de favoritos'
    },
    
    // Proveedores
    suppliers: {
      title: 'Proveedores',
      addSupplier: 'Agregar Proveedor',
      editSupplier: 'Editar Proveedor',
      deleteSupplier: 'Eliminar Proveedor',
      supplierName: 'Nombre del Proveedor',
      services: 'Servicios',
      description: 'Descripción',
      contact: 'Contacto',
      rating: 'Calificación',
      reviews: 'Reseñas',
      noSuppliers: 'No hay proveedores disponibles',
      loadingSuppliers: 'Cargando proveedores...',
      supplierAdded: 'Proveedor agregado exitosamente',
      supplierUpdated: 'Proveedor actualizado exitosamente',
      supplierDeleted: 'Proveedor eliminado exitosamente'
    },
    
    // Participantes
    participants: {
      title: 'Participantes',
      participantName: 'Nombre del Participante',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      event: 'Evento',
      registrationDate: 'Fecha de Registro',
      status: 'Estado',
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
      noParticipants: 'No hay participantes registrados',
      loadingParticipants: 'Cargando participantes...',
      participantAdded: 'Participante agregado exitosamente',
      participantUpdated: 'Participante actualizado exitosamente',
      participantDeleted: 'Participante eliminado exitosamente'
    },
    
    // Panel de Administración
    admin: {
      title: 'Panel de Administración',
      dashboard: 'Panel Principal',
      users: 'Usuarios',
      events: 'Eventos',
      suppliers: 'Proveedores',
      participants: 'Participantes',
      reports: 'Reportes',
      settings: 'Configuraciones',
      statistics: 'Estadísticas',
      totalUsers: 'Total de Usuarios',
      totalEvents: 'Total de Eventos',
      totalSuppliers: 'Total de Proveedores',
      totalParticipants: 'Total de Participantes',
      recentActivity: 'Actividad Reciente',
      systemHealth: 'Estado del Sistema',
      online: 'En Línea',
      offline: 'Fuera de Línea'
    },
    
    // Formularios
    forms: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      invalidDate: 'Fecha inválida',
      invalidNumber: 'Número inválido',
      invalidUrl: 'URL inválida',
      selectOption: 'Selecciona una opción',
      uploadImage: 'Subir Imagen',
      dragDropImage: 'Arrastra y suelta una imagen aquí',
      maxFileSize: 'El archivo debe ser menor a 5MB',
      allowedFormats: 'Formatos permitidos: JPG, PNG, GIF'
    },
    
    // Mensajes de Error
    errors: {
      generic: 'Ha ocurrido un error inesperado',
      networkError: 'Error de conexión. Verifica tu internet.',
      unauthorized: 'No tienes permisos para realizar esta acción',
      forbidden: 'Acceso denegado',
      notFound: 'Recurso no encontrado',
      serverError: 'Error interno del servidor',
      validationError: 'Error de validación',
      duplicateError: 'Ya existe un registro con estos datos',
      loginError: 'Credenciales incorrectas',
      registerError: 'Error al registrar usuario',
      eventError: 'Error al procesar evento',
      supplierError: 'Error al procesar proveedor',
      participantError: 'Error al procesar participante'
    },
    
    // Mensajes de Éxito
    success: {
      saved: 'Guardado exitosamente',
      updated: 'Actualizado exitosamente',
      deleted: 'Eliminado exitosamente',
      created: 'Creado exitosamente',
      sent: 'Enviado exitosamente',
      uploaded: 'Subido exitosamente'
    },
    
    // Configuración
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      security: 'Seguridad',
      account: 'Cuenta',
      preferences: 'Preferencias',
      save: 'Guardar Cambios',
      cancel: 'Cancelar',
      reset: 'Restablecer',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema'
    },
    
    // Disponibilidad 24/7
    availability: {
      title: 'Disponibilidad 24/7',
      status: 'Estado del Sistema',
      uptime: 'Tiempo de Actividad',
      lastCheck: 'Última Verificación',
      responseTime: 'Tiempo de Respuesta',
      serverStatus: 'Estado del Servidor',
      databaseStatus: 'Estado de la Base de Datos',
      apiStatus: 'Estado de la API',
      monitoring: 'Monitoreo en Tiempo Real',
      alerts: 'Alertas',
      maintenance: 'Mantenimiento Programado',
      scheduled: 'Programado',
      inProgress: 'En Progreso',
      completed: 'Completado'
    },
    
    // Seguridad
    security: {
      title: 'Seguridad de Datos',
      dataProtection: 'Protección de Datos',
      encryption: 'Encriptación',
      privacy: 'Privacidad',
      compliance: 'Cumplimiento',
      gdpr: 'GDPR',
      dataRetention: 'Retención de Datos',
      accessControl: 'Control de Acceso',
      auditLog: 'Registro de Auditoría',
      securityAlerts: 'Alertas de Seguridad',
      passwordPolicy: 'Política de Contraseñas',
      twoFactorAuth: 'Autenticación de Dos Factores',
      sessionManagement: 'Gestión de Sesiones'
    }
  },
  
  en: {
    // Navigation
    navigation: {
      home: 'Home',
      events: 'Events',
      createEvent: 'Create Event',
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      dashboard: 'Dashboard',
      admin: 'Administration',
      suppliers: 'Suppliers',
      participants: 'Participants'
    },
    
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      logoutSuccess: 'Logout successful'
    },
    
    // Events
    events: {
      title: 'Events',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      eventName: 'Event Name',
      description: 'Description',
      date: 'Date',
      endDate: 'End Date',
      location: 'Location',
      capacity: 'Capacity',
      price: 'Price',
      category: 'Category',
      type: 'Type',
      status: 'Status',
      visibility: 'Visibility',
      tags: 'Tags',
      image: 'Image',
      organizer: 'Organizer',
      duration: 'Duration (minutes)',
      streamingUrl: 'Streaming URL',
      public: 'Public',
      private: 'Private',
      active: 'Active',
      inactive: 'Inactive',
      cancelled: 'Cancelled',
      completed: 'Completed',
      musical: 'Musical',
      sports: 'Sports',
      cultural: 'Cultural',
      business: 'Business',
      entertainment: 'Entertainment',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      attend: 'Attend',
      favorite: 'Favorite',
      comment: 'Comment',
      comments: 'Comments',
      noEvents: 'No events available',
      loadingEvents: 'Loading events...',
      eventCreated: 'Event created successfully',
      eventUpdated: 'Event updated successfully',
      eventDeleted: 'Event deleted successfully',
      eventAttended: 'You have registered for the event',
      eventFavorited: 'Event added to favorites',
      eventUnfavorited: 'Event removed from favorites'
    },
    
    // Suppliers
    suppliers: {
      title: 'Suppliers',
      addSupplier: 'Add Supplier',
      editSupplier: 'Edit Supplier',
      deleteSupplier: 'Delete Supplier',
      supplierName: 'Supplier Name',
      services: 'Services',
      description: 'Description',
      contact: 'Contact',
      rating: 'Rating',
      reviews: 'Reviews',
      noSuppliers: 'No suppliers available',
      loadingSuppliers: 'Loading suppliers...',
      supplierAdded: 'Supplier added successfully',
      supplierUpdated: 'Supplier updated successfully',
      supplierDeleted: 'Supplier deleted successfully'
    },
    
    // Participants
    participants: {
      title: 'Participants',
      participantName: 'Participant Name',
      email: 'Email',
      phone: 'Phone',
      event: 'Event',
      registrationDate: 'Registration Date',
      status: 'Status',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      noParticipants: 'No participants registered',
      loadingParticipants: 'Loading participants...',
      participantAdded: 'Participant added successfully',
      participantUpdated: 'Participant updated successfully',
      participantDeleted: 'Participant deleted successfully'
    },
    
    // Administration Panel
    admin: {
      title: 'Administration Panel',
      dashboard: 'Main Dashboard',
      users: 'Users',
      events: 'Events',
      suppliers: 'Suppliers',
      participants: 'Participants',
      reports: 'Reports',
      settings: 'Settings',
      statistics: 'Statistics',
      totalUsers: 'Total Users',
      totalEvents: 'Total Events',
      totalSuppliers: 'Total Suppliers',
      totalParticipants: 'Total Participants',
      recentActivity: 'Recent Activity',
      systemHealth: 'System Status',
      online: 'Online',
      offline: 'Offline'
    },
    
    // Forms
    forms: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      invalidDate: 'Invalid date',
      invalidNumber: 'Invalid number',
      invalidUrl: 'Invalid URL',
      selectOption: 'Select an option',
      uploadImage: 'Upload Image',
      dragDropImage: 'Drag and drop an image here',
      maxFileSize: 'File must be smaller than 5MB',
      allowedFormats: 'Allowed formats: JPG, PNG, GIF'
    },
    
    // Error Messages
    errors: {
      generic: 'An unexpected error occurred',
      networkError: 'Connection error. Check your internet.',
      unauthorized: 'You do not have permission to perform this action',
      forbidden: 'Access denied',
      notFound: 'Resource not found',
      serverError: 'Internal server error',
      validationError: 'Validation error',
      duplicateError: 'A record with this data already exists',
      loginError: 'Invalid credentials',
      registerError: 'Error registering user',
      eventError: 'Error processing event',
      supplierError: 'Error processing supplier',
      participantError: 'Error processing participant'
    },
    
    // Success Messages
    success: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      created: 'Created successfully',
      sent: 'Sent successfully',
      uploaded: 'Uploaded successfully'
    },
    
    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      privacy: 'Privacy',
      security: 'Security',
      account: 'Account',
      preferences: 'Preferences',
      save: 'Save Changes',
      cancel: 'Cancel',
      reset: 'Reset',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },
    
    // 24/7 Availability
    availability: {
      title: '24/7 Availability',
      status: 'System Status',
      uptime: 'Uptime',
      lastCheck: 'Last Check',
      responseTime: 'Response Time',
      serverStatus: 'Server Status',
      databaseStatus: 'Database Status',
      apiStatus: 'API Status',
      monitoring: 'Real-time Monitoring',
      alerts: 'Alerts',
      maintenance: 'Scheduled Maintenance',
      scheduled: 'Scheduled',
      inProgress: 'In Progress',
      completed: 'Completed'
    },
    
    // Security
    security: {
      title: 'Data Security',
      dataProtection: 'Data Protection',
      encryption: 'Encryption',
      privacy: 'Privacy',
      compliance: 'Compliance',
      gdpr: 'GDPR',
      dataRetention: 'Data Retention',
      accessControl: 'Access Control',
      auditLog: 'Audit Log',
      securityAlerts: 'Security Alerts',
      passwordPolicy: 'Password Policy',
      twoFactorAuth: 'Two-Factor Authentication',
      sessionManagement: 'Session Management'
    }
  }
};

// Función para obtener traducción
export const t = (key, language = 'es') => {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key; // Devolver la clave si no se encuentra la traducción
    }
  }
  
  return translation;
};

// Función para cambiar idioma
export const setLanguage = (language) => {
  if (translations[language]) {
    localStorage.setItem('mainevents_language', language);
    return true;
  }
  return false;
};

// Función para obtener idioma actual
export const getCurrentLanguage = () => {
  return localStorage.getItem('mainevents_language') || 'es';
};

// Hook para React (requiere importar useState)
export const useTranslation = () => {
  // Nota: useState debe ser importado desde React en el componente que use este hook
  const [language, setLanguageState] = React.useState(getCurrentLanguage());
  
  const changeLanguage = (newLanguage) => {
    if (setLanguage(newLanguage)) {
      setLanguageState(newLanguage);
    }
  };
  
  const translate = (key) => t(key, language);
  
  return { t: translate, language, changeLanguage };
};
