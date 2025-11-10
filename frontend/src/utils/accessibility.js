/**
 * Utilidades de accesibilidad para MainEvents
 * Implementación de WCAG 2.1 AA y mejores prácticas de accesibilidad
 */

// Configuración de contraste de colores
export const CONTRAST_RATIOS = {
  AA: 4.5,
  AAA: 7.0,
  LARGE_TEXT_AA: 3.0,
  LARGE_TEXT_AAA: 4.5
};

// Función para calcular contraste entre dos colores
export const calculateContrast = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// Función para verificar contraste
export const checkContrast = (foreground, background, level = 'AA') => {
  const ratio = calculateContrast(foreground, background);
  const requiredRatio = CONTRAST_RATIOS[level];
  return {
    ratio,
    requiredRatio,
    passes: ratio >= requiredRatio,
    level
  };
};

// Configuración de tamaños de fuente accesibles
export const FONT_SIZES = {
  SMALL: '0.875rem', // 14px
  BASE: '1rem', // 16px
  LARGE: '1.125rem', // 18px
  XLARGE: '1.25rem', // 20px
  XXLARGE: '1.5rem', // 24px
  XXXLARGE: '1.875rem' // 30px
};

// Configuración de espaciado accesible
export const SPACING = {
  TIGHT: '0.5rem', // 8px
  NORMAL: '1rem', // 16px
  RELAXED: '1.5rem', // 24px
  LOOSE: '2rem' // 32px
};

// Función para generar ARIA labels
export const generateARIALabel = (element, context = '') => {
  const labels = {
    button: {
      close: 'Cerrar',
      menu: 'Abrir menú',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      edit: 'Editar',
      delete: 'Eliminar',
      save: 'Guardar',
      cancel: 'Cancelar',
      submit: 'Enviar',
      next: 'Siguiente',
      previous: 'Anterior',
      play: 'Reproducir',
      pause: 'Pausar',
      stop: 'Detener'
    },
    input: {
      email: 'Dirección de correo electrónico',
      password: 'Contraseña',
      search: 'Término de búsqueda',
      name: 'Nombre',
      phone: 'Número de teléfono',
      date: 'Fecha',
      time: 'Hora'
    },
    navigation: {
      main: 'Navegación principal',
      breadcrumb: 'Navegación de migas de pan',
      pagination: 'Navegación de páginas',
      sidebar: 'Barra lateral'
    }
  };
  
  const category = labels[element] || {};
  return category[context] || `${element} ${context}`.trim();
};

// Función para generar roles ARIA
export const generateARIARole = (element, context = '') => {
  const roles = {
    button: 'button',
    link: 'link',
    input: 'textbox',
    select: 'combobox',
    textarea: 'textbox',
    img: 'img',
    heading: 'heading',
    list: 'list',
    listitem: 'listitem',
    navigation: 'navigation',
    main: 'main',
    banner: 'banner',
    contentinfo: 'contentinfo',
    complementary: 'complementary',
    search: 'search',
    form: 'form',
    group: 'group',
    region: 'region',
    alert: 'alert',
    status: 'status',
    progressbar: 'progressbar',
    slider: 'slider',
    tab: 'tab',
    tabpanel: 'tabpanel',
    dialog: 'dialog',
    tooltip: 'tooltip'
  };
  
  return roles[element] || 'generic';
};

// Función para generar estados ARIA
export const generateARIAState = (state, value = true) => {
  const states = {
    expanded: value,
    collapsed: !value,
    selected: value,
    checked: value,
    disabled: value,
    hidden: value,
    required: value,
    invalid: value,
    pressed: value,
    busy: value,
    live: value
  };
  
  return states[state] !== undefined ? states[state] : value;
};

// Función para generar descripciones ARIA
export const generateARIADescription = (element, context = '') => {
  const descriptions = {
    required: 'Campo obligatorio',
    optional: 'Campo opcional',
    error: 'Error en el campo',
    success: 'Campo válido',
    loading: 'Cargando...',
    empty: 'Campo vacío',
    invalid: 'Formato inválido',
    valid: 'Formato válido'
  };
  
  return descriptions[context] || '';
};

// Función para manejar focus
export const manageFocus = {
  // Trap focus dentro de un elemento
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => element.removeEventListener('keydown', handleTabKey);
  },
  
  // Restaurar focus a un elemento específico
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },
  
  // Obtener el siguiente elemento focusable
  getNextFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  },
  
  // Obtener el elemento focusable anterior
  getPreviousFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
  }
};

// Función para detectar preferencias de movimiento
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Función para detectar preferencias de contraste
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Función para detectar preferencias de color
export const prefersColorScheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Función para generar skip links
export const generateSkipLinks = () => {
  const skipLinks = [
    { href: '#main-content', text: 'Saltar al contenido principal' },
    { href: '#navigation', text: 'Saltar a la navegación' },
    { href: '#search', text: 'Saltar a la búsqueda' }
  ];
  
  return skipLinks.map(link => ({
    ...link,
    id: `skip-${link.href.replace('#', '')}`
  }));
};

// Función para generar breadcrumbs accesibles
export const generateBreadcrumbs = (items) => {
  return items.map((item, index) => ({
    ...item,
    position: index + 1,
    isLast: index === items.length - 1,
    ariaLabel: `Ir a ${item.name}${index === items.length - 1 ? ' (página actual)' : ''}`
  }));
};

// Función para generar paginación accesible
export const generatePagination = (currentPage, totalPages) => {
  const pages = [];
  
  // Página anterior
  if (currentPage > 1) {
    pages.push({
      type: 'previous',
      page: currentPage - 1,
      ariaLabel: `Ir a la página ${currentPage - 1}`,
      disabled: false
    });
  }
  
  // Páginas numeradas
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push({
      type: 'page',
      page: i,
      current: i === currentPage,
      ariaLabel: i === currentPage ? `Página ${i} (página actual)` : `Ir a la página ${i}`,
      disabled: false
    });
  }
  
  // Página siguiente
  if (currentPage < totalPages) {
    pages.push({
      type: 'next',
      page: currentPage + 1,
      ariaLabel: `Ir a la página ${currentPage + 1}`,
      disabled: false
    });
  }
  
  return pages;
};

// Función para generar alertas accesibles
export const generateAlert = (type, message, options = {}) => {
  const alertTypes = {
    success: { role: 'alert', ariaLive: 'polite' },
    error: { role: 'alert', ariaLive: 'assertive' },
    warning: { role: 'alert', ariaLive: 'polite' },
    info: { role: 'status', ariaLive: 'polite' }
  };
  
  const config = alertTypes[type] || alertTypes.info;
  
  return {
    ...config,
    message,
    id: options.id || `alert-${Date.now()}`,
    dismissible: options.dismissible !== false,
    autoHide: options.autoHide || false,
    autoHideDelay: options.autoHideDelay || 5000
  };
};

// Función para validar accesibilidad de formularios
export const validateFormAccessibility = (form) => {
  const issues = [];
  
  // Verificar labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.id;
    const label = form.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Input sin etiqueta accesible: ${id}`);
    }
  });
  
  // Verificar grupos de campos
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach(fieldset => {
    const legend = fieldset.querySelector('legend');
    if (!legend) {
      issues.push('Fieldset sin leyenda');
    }
  });
  
  // Verificar mensajes de error
  const errorMessages = form.querySelectorAll('[role="alert"]');
  errorMessages.forEach(message => {
    const associatedInput = form.querySelector(`#${message.getAttribute('aria-describedby')}`);
    if (!associatedInput) {
      issues.push('Mensaje de error sin input asociado');
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Función para generar texto alternativo para imágenes
export const generateAltText = (image, context = '') => {
  const altTexts = {
    logo: 'Logo de MainEvents',
    avatar: 'Foto de perfil del usuario',
    event: 'Imagen del evento',
    banner: 'Imagen promocional',
    icon: 'Icono',
    decorative: '' // Imagen decorativa
  };
  
  return altTexts[context] || `Imagen: ${image.alt || 'Sin descripción'}`;
};

// Función para generar descripciones de video
export const generateVideoDescription = (video, context = '') => {
  const descriptions = {
    tutorial: 'Video tutorial explicativo',
    promotional: 'Video promocional',
    event: 'Video del evento',
    testimonial: 'Testimonio de usuario'
  };
  
  return descriptions[context] || 'Video multimedia';
};

// Función para generar descripciones de audio
export const generateAudioDescription = (audio, context = '') => {
  const descriptions = {
    music: 'Música de fondo',
    narration: 'Narración',
    sound: 'Efecto de sonido',
    interview: 'Entrevista de audio'
  };
  
  return descriptions[context] || 'Audio multimedia';
};

// Hook personalizado para accesibilidad
export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);
  const [prefersColorScheme, setPrefersColorScheme] = React.useState('light');
  
  React.useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    setPrefersReducedMotion(motionQuery.matches);
    setPrefersHighContrast(contrastQuery.matches);
    setPrefersColorScheme(colorQuery.matches ? 'dark' : 'light');
    
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handleContrastChange = (e) => setPrefersHighContrast(e.matches);
    const handleColorChange = (e) => setPrefersColorScheme(e.matches ? 'dark' : 'light');
    
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    colorQuery.addEventListener('change', handleColorChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      colorQuery.removeEventListener('change', handleColorChange);
    };
  }, []);
  
  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersColorScheme
  };
};

export default {
  CONTRAST_RATIOS,
  calculateContrast,
  checkContrast,
  FONT_SIZES,
  SPACING,
  generateARIALabel,
  generateARIARole,
  generateARIAState,
  generateARIADescription,
  manageFocus,
  prefersReducedMotion,
  prefersHighContrast,
  prefersColorScheme,
  generateSkipLinks,
  generateBreadcrumbs,
  generatePagination,
  generateAlert,
  validateFormAccessibility,
  generateAltText,
  generateVideoDescription,
  generateAudioDescription,
  useAccessibility
};

