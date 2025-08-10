import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_CONFIG } from '../config/api';

export const useApiMultiLang = (endpoint, options = {}) => {
  const { selectedLanguage } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL con parámetros de idioma
      const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
      url.searchParams.append('lang', selectedLanguage);
      
      // Agregar otros parámetros si existen
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers: {
          ...API_CONFIG.REQUEST_CONFIG.headers,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Error en la API');
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, selectedLanguage, options.params, options.method, options.body, options.headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { 
    data, 
    loading, 
    error, 
    refetch,
    currentLanguage: selectedLanguage 
  };
};

export const useApiMutationMultiLang = (endpoint, options = {}) => {
  const { selectedLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (body = {}, customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL con parámetros de idioma
      const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
      url.searchParams.append('lang', selectedLanguage);
      
      // Agregar parámetros personalizados
      Object.entries(customParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method: options.method || 'POST',
        headers: {
          ...API_CONFIG.REQUEST_CONFIG.headers,
          ...options.headers,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la API');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      console.error('API Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, selectedLanguage, options.method, options.headers]);

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { 
    execute, 
    loading, 
    error, 
    data, 
    reset,
    currentLanguage: selectedLanguage 
  };
};

// Hooks específicos para cada endpoint
export const useLeaks = (params = {}) => {
  return useApiMultiLang('/leaks', { params });
};

export const useLeak = (id) => {
  return useApiMultiLang(`/leaks/${id}`);
};

export const useNews = (params = {}) => {
  return useApiMultiLang('/news', { params });
};

export const useNewsItem = (id) => {
  return useApiMultiLang(`/news/${id}`);
};

export const useTrailers = (params = {}) => {
  return useApiMultiLang('/trailers', { params });
};

export const useTrailer = (id) => {
  return useApiMultiLang(`/trailers/${id}`);
};

export const useLaunchDate = () => {
  return useApiMultiLang('/launch-date');
};

// Hooks para mutaciones
export const useAddTranslation = () => {
  return useApiMutationMultiLang('/leaks/:id/translations', { method: 'POST' });
};

export const useAddNewsTranslation = () => {
  return useApiMutationMultiLang('/news/:id/translations', { method: 'POST' });
};

export const useAddTrailerTranslation = () => {
  return useApiMutationMultiLang('/trailers/:id/translations', { method: 'POST' });
};
