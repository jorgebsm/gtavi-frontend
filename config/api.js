// Configuración de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: 'https://gtavi-backend-production.up.railway.app/api', // Siempre usar producción
  
  // Endpoints
  ENDPOINTS: {
    LEAKS: '/leaks',
    NEWS: '/news',
    TRAILERS: '/trailers',
    TRANSLATIONS: '/translations',
  },
  
  // Configuración de requests
  REQUEST_CONFIG: {
    timeout: 10000, // 10 segundos
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Configuración de paginación por defecto
  DEFAULT_PAGINATION: {
    page: 1,
    limit: 10,
  },
  
  // Idiomas soportados
  SUPPORTED_LANGUAGES: ['es', 'en', 'fr', 'ar', 'pl', 'pt'],
  
  // Idioma por defecto
  DEFAULT_LANGUAGE: 'es',
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  // Agregar parámetros de query
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

// Función para construir URL con idioma
export const buildApiUrlWithLanguage = (endpoint, language, params = {}) => {
  return buildApiUrl(endpoint, { lang: language, ...params });
};

export default API_CONFIG; 