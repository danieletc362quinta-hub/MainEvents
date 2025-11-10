/**
 * Utilidades SEO para MainEvents
 * Optimización para motores de búsqueda siguiendo las mejores prácticas
 */

// Metadatos por defecto
export const defaultSEO = {
  title: 'MainEvents - Descubre y Crea Eventos Increíbles',
  description: 'Plataforma líder para descubrir, crear y gestionar eventos. Conecta con tu audiencia y vive experiencias únicas.',
  keywords: 'eventos, tickets, conciertos, festivales, conferencias, networking, entretenimiento',
  author: 'MainEvents Team',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0',
  charset: 'UTF-8',
  language: 'es',
  canonical: 'https://mainevents.com',
  ogType: 'website',
  twitterCard: 'summary_large_image'
};

// Metadatos específicos por página
export const pageSEO = {
  home: {
    title: 'MainEvents - Descubre y Crea Eventos Increíbles',
    description: 'Plataforma líder para descubrir, crear y gestionar eventos. Conecta con tu audiencia y vive experiencias únicas.',
    keywords: 'eventos, tickets, conciertos, festivales, conferencias, networking, entretenimiento',
    path: '/'
  },
  events: {
    title: 'Eventos - MainEvents',
    description: 'Explora cientos de eventos increíbles. Desde conciertos hasta conferencias, encuentra tu próximo evento perfecto.',
    keywords: 'eventos, conciertos, festivales, conferencias, tickets, entretenimiento',
    path: '/events'
  },
  login: {
    title: 'Iniciar Sesión - MainEvents',
    description: 'Accede a tu cuenta de MainEvents y gestiona tus eventos favoritos.',
    keywords: 'iniciar sesión, login, cuenta, MainEvents',
    path: '/login'
  },
  register: {
    title: 'Registrarse - MainEvents',
    description: 'Crea tu cuenta en MainEvents y comienza a descubrir eventos increíbles.',
    keywords: 'registrarse, crear cuenta, MainEvents, eventos',
    path: '/register'
  },
  dashboard: {
    title: 'Dashboard - MainEvents',
    description: 'Gestiona tus eventos, tickets y configuraciones desde tu panel personal.',
    keywords: 'dashboard, panel, gestión, eventos, tickets',
    path: '/dashboard'
  },
  createEvent: {
    title: 'Crear Evento - MainEvents',
    description: 'Crea y promociona tu evento en MainEvents. Llega a miles de personas interesadas.',
    keywords: 'crear evento, promocionar, organizar, MainEvents',
    path: '/create-event'
  },
  profile: {
    title: 'Perfil - MainEvents',
    description: 'Gestiona tu perfil y configuraciones en MainEvents.',
    keywords: 'perfil, configuración, cuenta, MainEvents',
    path: '/profile'
  }
};

// Estructura de datos JSON-LD para eventos
export const generateEventJSONLD = (event) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.title,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    '@type': 'Place',
    name: event.location,
    address: event.address
  },
  organizer: {
    '@type': 'Organization',
    name: event.organizer || 'MainEvents',
    url: 'https://mainevents.com'
  },
  offers: {
    '@type': 'Offer',
    url: `https://mainevents.com/events/${event.id}`,
    price: event.price,
    priceCurrency: 'ARS',
    availability: event.availability || 'https://schema.org/InStock'
  },
  image: event.image,
  url: `https://mainevents.com/events/${event.id}`
});

// Estructura de datos JSON-LD para organización
export const generateOrganizationJSONLD = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MainEvents',
  description: 'Plataforma líder para descubrir, crear y gestionar eventos',
  url: 'https://mainevents.com',
  logo: 'https://mainevents.com/logo.png',
  sameAs: [
    'https://facebook.com/mainevents',
    'https://twitter.com/mainevents',
    'https://instagram.com/mainevents'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+54-11-1234-5678',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'English']
  }
});

// Estructura de datos JSON-LD para breadcrumbs
export const generateBreadcrumbJSONLD = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `https://mainevents.com${crumb.path}`
  }))
});

// Función para actualizar metadatos de la página
export const updatePageSEO = (page, customData = {}) => {
  const seoData = { ...pageSEO[page], ...customData };
  
  // Actualizar título
  document.title = `${seoData.title} | MainEvents`;
  
  // Actualizar meta description
  updateMetaTag('description', seoData.description);
  
  // Actualizar meta keywords
  updateMetaTag('keywords', seoData.keywords);
  
  // Actualizar meta author
  updateMetaTag('author', seoData.author || defaultSEO.author);
  
  // Actualizar meta robots
  updateMetaTag('robots', seoData.robots || defaultSEO.robots);
  
  // Actualizar canonical URL
  updateLinkTag('canonical', `https://mainevents.com${seoData.path}`);
  
  // Actualizar Open Graph
  updateMetaTag('og:title', seoData.title);
  updateMetaTag('og:description', seoData.description);
  updateMetaTag('og:url', `https://mainevents.com${seoData.path}`);
  updateMetaTag('og:type', seoData.ogType || defaultSEO.ogType);
  
  // Actualizar Twitter Card
  updateMetaTag('twitter:card', seoData.twitterCard || defaultSEO.twitterCard);
  updateMetaTag('twitter:title', seoData.title);
  updateMetaTag('twitter:description', seoData.description);
  
  // Actualizar meta viewport
  updateMetaTag('viewport', defaultSEO.viewport);
  
  // Actualizar meta charset
  updateMetaTag('charset', defaultSEO.charset);
  
  // Actualizar meta language
  updateMetaTag('language', seoData.language || defaultSEO.language);
};

// Función auxiliar para actualizar meta tags
const updateMetaTag = (name, content) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

// Función auxiliar para actualizar link tags
const updateLinkTag = (rel, href) => {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

// Función para generar sitemap
export const generateSitemap = () => {
  const baseUrl = 'https://mainevents.com';
  const pages = Object.values(pageSEO);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
    <url>
      <loc>${baseUrl}${page.path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`;
};

// Función para generar robots.txt
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

Sitemap: https://mainevents.com/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
`;
};

// Función para validar SEO
export const validateSEO = (page) => {
  const seoData = pageSEO[page];
  const issues = [];
  
  // Validar título
  if (!seoData.title || seoData.title.length < 30 || seoData.title.length > 60) {
    issues.push('El título debe tener entre 30 y 60 caracteres');
  }
  
  // Validar descripción
  if (!seoData.description || seoData.description.length < 120 || seoData.description.length > 160) {
    issues.push('La descripción debe tener entre 120 y 160 caracteres');
  }
  
  // Validar keywords
  if (!seoData.keywords || seoData.keywords.split(',').length < 3) {
    issues.push('Debe incluir al menos 3 palabras clave');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Hook personalizado para SEO
export const useSEO = (page, customData = {}) => {
  React.useEffect(() => {
    updatePageSEO(page, customData);
  }, [page, customData]);
};

export default {
  defaultSEO,
  pageSEO,
  generateEventJSONLD,
  generateOrganizationJSONLD,
  generateBreadcrumbJSONLD,
  updatePageSEO,
  generateSitemap,
  generateRobotsTxt,
  validateSEO,
  useSEO
};

