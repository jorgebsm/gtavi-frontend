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
  getCurrent: () => api.get('/launch-date'),
  
  // Crear nueva fecha de lanzamiento
  create: (data) => api.post('/launch-date', data),
  
  // Actualizar fecha de lanzamiento
  update: (id, data) => api.put(`/launch-date/${id}`, data),
  
  // Eliminar fecha de lanzamiento
  delete: (id) => api.delete(`/launch-date/${id}`),
};

export const trailersService = {
  // Obtener todos los trailers
  getAll: (params = {}) => api.get('/trailers', { params }),
  
  // Obtener trailer por ID
  getById: (id) => api.get(`/trailers/${id}`),
  
  // Crear nuevo trailer
  create: (data) => api.post('/trailers', data),
  
  // Actualizar trailer
  update: (id, data) => api.put(`/trailers/${id}`, data),
  
  // Eliminar trailer
  delete: (id) => api.delete(`/trailers/${id}`),
  
  // Reordenar trailers
  reorder: (trailers) => api.patch('/trailers/reorder', { trailers }),
};

export const newsService = {
  // Obtener todas las noticias
  getAll: (params = {}) => api.get('/news', { params }),
  
  // Obtener noticia por ID
  getById: (id) => api.get(`/news/${id}`),
  
  // Crear nueva noticia
  create: (data) => api.post('/news', data),
  
  // Actualizar noticia
  update: (id, data) => api.put(`/news/${id}`, data),
  
  // Eliminar noticia
  delete: (id) => api.delete(`/news/${id}`),
  
  // Obtener categorías
  getCategories: () => api.get('/news/categories/list'),
};

export const leaksService = {
  // Obtener todas las filtraciones
  getAll: (params = {}) => api.get('/leaks', { params }),
  
  // Obtener filtración por ID
  getById: (id) => api.get(`/leaks/${id}`),
  
  // Crear nueva filtración
  create: (data) => api.post('/leaks', data),
  
  // Actualizar filtración
  update: (id, data) => api.put(`/leaks/${id}`, data),
  
  // Eliminar filtración
  delete: (id) => api.delete(`/leaks/${id}`),
  
  // Obtener categorías
  getCategories: () => api.get('/leaks/categories/list'),
  
  // Obtener niveles de credibilidad
  getCredibilityLevels: () => api.get('/leaks/credibility/list'),
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

export default api; 

// Configurations service
export const configurationsService = {
  getByKey: (key) => api.get(`/configurations/${key}`)
};