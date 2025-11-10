import React, { createContext, useContext, useState, useEffect } from 'react';

const DebugLanguageContext = createContext();

export const useDebugLanguage = () => {
  const context = useContext(DebugLanguageContext);
  if (!context) {
    throw new Error('useDebugLanguage must be used within a DebugLanguageProvider');
  }
  return context;
};

const translations = {
  es: {
    nav: {
      home: 'Inicio',
      events: 'Eventos',
      language: 'Idioma'
    },
    test: {
      title: 'Prueba de Idioma',
      description: 'Este es un texto de prueba en español'
    }
  },
  en: {
    nav: {
      home: 'Home',
      events: 'Events',
      language: 'Language'
    },
    test: {
      title: 'Language Test',
      description: 'This is a test text in English'
    }
  }
};

export const DebugLanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('debug-language');
    return stored && ['es', 'en'].includes(stored) ? stored : 'es';
  });

  useEffect(() => {
    localStorage.setItem('debug-language', language);
    console.log('🔧 DebugLanguageProvider: Language changed to', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    console.log(`🔧 DebugLanguageProvider: Translating "${key}" in ${language} = "${value}"`);
    return value || key;
  };

  const changeLanguage = (newLanguage) => {
    console.log('🔧 DebugLanguageProvider: Changing language from', language, 'to', newLanguage);
    setLanguage(newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  console.log('🔧 DebugLanguageProvider: Rendering with language', language);

  return (
    <DebugLanguageContext.Provider value={value}>
      {children}
    </DebugLanguageContext.Provider>
  );
};

export default DebugLanguageContext;
