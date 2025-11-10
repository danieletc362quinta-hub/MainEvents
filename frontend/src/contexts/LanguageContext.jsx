import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  es: {
    navigation: {
      home: 'Inicio',
      events: 'Eventos',
      createEvent: 'Crear Evento',
      dashboard: 'Dashboard',
      profile: 'Perfil',
      payments: 'Pagos',
      coupons: 'Cupones'
    },
    events: {
      description: 'Descripción',
      comments: 'Comentarios',
      participants: 'Participantes'
    },
    participants: {
      title: 'Asistentes'
    }
  },
  en: {
    navigation: {
      home: 'Home',
      events: 'Events',
      createEvent: 'Create Event',
      dashboard: 'Dashboard',
      profile: 'Profile',
      payments: 'Payments',
      coupons: 'Coupons'
    },
    events: {
      description: 'Description',
      comments: 'Comments',
      participants: 'Participants'
    },
    participants: {
      title: 'Attendees'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
