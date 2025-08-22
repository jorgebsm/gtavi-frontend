import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Configuración base de la API
const API_BASE_URL = API_CONFIG.BASE_URL;

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.REQUEST_CONFIG.timeout,
  headers: API_CONFIG.REQUEST_CONFIG.headers,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios para cada endpoint
export const launchDateService = {
  // Obtener fecha de lanzamiento actual
  getCurrent: async () => {
    const response = await api.get('/launch-date');
    return response.data;
  },
  
  // Crear nueva fecha de lanzamiento
  create: async (data) => {
    const response = await api.post('/launch-date', data);
    return response.data;
  },
  
  // Actualizar fecha de lanzamiento
  update: async (id, data) => {
    const response = await api.put(`/launch-date/${id}`, data);
    return response.data;
  },
  
  // Eliminar fecha de lanzamiento
  delete: async (id) => {
    const response = await api.delete(`/launch-date/${id}`);
    return response.data;
  },
};

export const trailersService = {
  // Obtener todos los trailers
  getAll: async (params = {}) => {
    const response = await api.get('/trailers', { params });
    return response.data;
  },
  
  // Obtener trailer por ID
  getById: async (id) => {
    const response = await api.get(`/trailers/${id}`);
    return response.data;
  },
  
  // Crear nuevo trailer
  create: async (data) => {
    const response = await api.post('/trailers', data);
    return response.data;
  },
  
  // Actualizar trailer
  update: async (id, data) => {
    const response = await api.put(`/trailers/${id}`, data);
    return response.data;
  },
  
  // Eliminar trailer
  delete: async (id) => {
    const response = await api.delete(`/trailers/${id}`);
    return response.data;
  },
  
  // Reordenar trailers
  reorder: async (trailers) => {
    const response = await api.patch('/trailers/reorder', { trailers });
    return response.data;
  },
};

export const newsService = {
  // Obtener todas las noticias
  getAll: async (params = {}) => {
    const response = await api.get('/news', { params });
    return response.data;
  },
  
  // Obtener noticia por ID
  getById: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
  
  // Crear nueva noticia
  create: async (data) => {
    const response = await api.post('/news', data);
    return response.data;
  },
  
  // Actualizar noticia
  update: async (id, data) => {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },
  
  // Eliminar noticia
  delete: async (id) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },
  
  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/news/categories/list');
    return response.data;
  },
};

export const leaksService = {
  // Obtener todas las filtraciones
  getAll: async (params = {}) => {
    const response = await api.get('/leaks', { params });
    return response.data;
  },
  
  // Obtener filtración por ID
  getById: async (id) => {
    const response = await api.get(`/leaks/${id}`);
    return response.data;
  },
  
  // Crear nueva filtración
  create: async (data) => {
    const response = await api.post('/leaks', data);
    return response.data;
  },
  
  // Actualizar filtración
  update: async (id, data) => {
    const response = await api.put(`/leaks/${id}`, data);
    return response.data;
  },
  
  // Eliminar filtración
  delete: async (id) => {
    const response = await api.delete(`/leaks/${id}`);
    return response.data;
  },
  
  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/leaks/categories/list');
    return response.data;
  },
  
  // Obtener niveles de credibilidad
  getCredibilityLevels: async () => {
    const response = await api.get('/leaks/credibility/list');
    return response.data;
  },
};

// Función para probar la conexión con el backend
export const testBackendConnection = async () => {
  try {   
    const response = await api.get('/');
    return {
      success: true,
      data: response.data,
      message: 'Backend conectado correctamente'
    };
  } catch (error) {
    console.error('❌ Error conectando con el backend:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Error conectando con el backend'
    };
  }
};

// Función para probar el estado de las notificaciones
export const testNotificationsStatus = async () => {
  try {
    const response = await api.get('/notifications/status');
    return {
      success: true,
      data: response.data,
      message: 'Estado de notificaciones obtenido'
    };
  } catch (error) {
    console.error('❌ Error obteniendo estado de notificaciones:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Error obteniendo estado de notificaciones'
    };
  }
};

// Configurations service
export const configurationsService = {
  getByKey: async (key) => {
    const response = await api.get(`/configurations/${key}`);
    return response.data;
  }
};

// Images service
export const imagesService = {
  // Obtener todas las imágenes
  getAll: async () => {
    const response = await api.get('/images');
    return response.data;
  },
  
  // Obtener imagen por ID
  getById: async (id) => {
    const response = await api.get(`/images/${id}`);
    return response.data;
  },
  
  // Crear nueva imagen
  create: async (data) => {
    const response = await api.post('/images', data);
    return response.data;
  },
  
  // Actualizar imagen
  update: async (id, data) => {
    const response = await api.put(`/images/${id}`, data);
    return response.data;
  },
  
  // Eliminar imagen (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/images/${id}`);
    return response.data;
  },
  
  // Incrementar contador de descargas
  incrementDownloadCount: async (id) => {
    const response = await api.post(`/images/${id}/download`);
    return response.data;
  },
  
  // Transformar datos de la API al formato esperado por WallpapersScreen
  transformApiDataToWallpapers: (apiData) => {
    
    // Verificar que apiData existe y tiene la estructura esperada
    if (!apiData) {
      console.warn('⚠️ apiData es undefined o null');
      return [];
    }
    
    if (!apiData.data) {
      console.warn('⚠️ apiData.data es undefined o null');
      return [];
    }
    
    if (!Array.isArray(apiData.data)) {
      console.warn('⚠️ apiData.data no es un array:', typeof apiData.data);
      return [];
    }
    
    return apiData.data.map((image, index) => ({
      id: image._id || String(index + 1),
      title: image.title || `Wallpaper ${index + 1}`,
      image: null, // No podemos usar require dinámico, usaremos solo imageUrl
      imageUrl: image.imageUrl || '',
      resolution: image.resolution || '1920x1080',
      author: image.author || 'Rockstar Games',
      downloadCount: image.downloadCount || 0
    }));
  }
};

export default api;