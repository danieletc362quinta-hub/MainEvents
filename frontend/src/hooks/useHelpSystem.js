import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook para manejar el sistema de ayuda global
 * Proporciona funcionalidades para mostrar tooltips, abrir la ayuda y manejar atajos de teclado
 */
export const useHelpSystem = () => {
  const { t } = useLanguage();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState(0);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [helpHistory, setHelpHistory] = useState([]);

  // Abrir el sistema de ayuda
  const openHelp = useCallback((tab = 0) => {
    setHelpTab(tab);
    setHelpOpen(true);
    
    // Agregar a historial
    setHelpHistory(prev => [...prev, { tab, timestamp: Date.now() }]);
  }, []);

  // Cerrar el sistema de ayuda
  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);

  // Cambiar pestaña de ayuda
  const setHelpTab = useCallback((tab) => {
    setHelpTab(tab);
  }, []);

  // Alternar tooltips
  const toggleTooltips = useCallback(() => {
    setTooltipsEnabled(prev => !prev);
  }, []);

  // Obtener tooltip para un elemento
  const getTooltip = useCallback((key, fallback = '') => {
    if (!tooltipsEnabled) return '';
    return t(`help.tooltips.${key}`) || fallback;
  }, [t, tooltipsEnabled]);

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + / para abrir ayuda
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        openHelp();
      }
      
      // Esc para cerrar ayuda
      if (event.key === 'Escape' && helpOpen) {
        closeHelp();
      }
      
      // Ctrl + Shift + H para alternar tooltips
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        toggleTooltips();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openHelp, closeHelp, toggleTooltips, helpOpen]);

  // Obtener estadísticas de uso de ayuda
  const getHelpStats = useCallback(() => {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);
    
    return {
      totalUses: helpHistory.length,
      last24h: helpHistory.filter(h => h.timestamp > last24h).length,
      last7d: helpHistory.filter(h => h.timestamp > last7d).length,
      mostUsedTab: helpHistory.reduce((acc, h) => {
        acc[h.tab] = (acc[h.tab] || 0) + 1;
        return acc;
      }, {}),
      lastUsed: helpHistory[helpHistory.length - 1]?.timestamp || null
    };
  }, [helpHistory]);

  // Limpiar historial de ayuda
  const clearHelpHistory = useCallback(() => {
    setHelpHistory([]);
  }, []);

  // Obtener sugerencias de ayuda basadas en la página actual
  const getContextualHelp = useCallback((currentPath) => {
    const contextualHelp = {
      '/': { tab: 0, suggestions: ['help.faq.howToCreateEvent', 'help.tutorials.gettingStarted'] },
      '/events': { tab: 0, suggestions: ['help.faq.howToBuyTicket', 'help.tutorials.managingTickets'] },
      '/create-event': { tab: 1, suggestions: ['help.tutorials.creatingEvents', 'help.faq.howToCreateEvent'] },
      '/profile': { tab: 0, suggestions: ['help.faq.howToChangeLanguage', 'help.accessibility.title'] },
      '/dashboard': { tab: 0, suggestions: ['help.tutorials.gettingStarted', 'help.shortcuts.title'] }
    };
    
    return contextualHelp[currentPath] || { tab: 0, suggestions: [] };
  }, []);

  // Mostrar notificación de ayuda contextual
  const showContextualHelp = useCallback((currentPath) => {
    const context = getContextualHelp(currentPath);
    if (context.suggestions.length > 0) {
      // Aquí podrías implementar una notificación o modal
      console.log('Contextual help suggestions:', context.suggestions);
    }
  }, [getContextualHelp]);

  return {
    // Estado
    helpOpen,
    helpTab,
    tooltipsEnabled,
    helpHistory,
    
    // Acciones
    openHelp,
    closeHelp,
    setHelpTab,
    toggleTooltips,
    
    // Utilidades
    getTooltip,
    getHelpStats,
    clearHelpHistory,
    getContextualHelp,
    showContextualHelp
  };
};

export default useHelpSystem;
