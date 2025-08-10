import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../locales';

/**
 * Hook personalizado para usar traducciones
 * @returns {Object} Objeto con función t() para traducir y currentLanguage
 */
export const useTranslation = () => {
  try {
    const context = useContext(LanguageContext);
    
    // Si no hay contexto, usar valores por defecto
    if (!context || !context.selectedLanguage) {
      console.warn('useTranslation: No context available, using default values');
      return {
        t: (key) => {
          const defaultTranslations = translations['es'] || {};
          return defaultTranslations[key] || key;
        },
        currentLanguage: 'es',
        translations: translations['es'] || {}
      };
    }
    
    const { selectedLanguage } = context;
    
    // Obtener las traducciones del idioma actual
    const currentTranslations = translations[selectedLanguage] || translations['es'];
    
    /**
     * Función para traducir texto usando la clave
     * @param {string} key - Clave de traducción
     * @param {Object} params - Parámetros para interpolación (opcional)
     * @returns {string} Texto traducido
     */
    const t = (key, params = {}) => {
      if (!key || typeof key !== 'string') {
        console.warn('useTranslation: key must be a string');
        return '';
      }
      
      if (!currentTranslations) {
        console.warn(`No se encontraron traducciones para el idioma: ${selectedLanguage}`);
        return key;
      }
      
      let translation = currentTranslations[key];
      
      if (!translation) {
        console.warn(`Clave de traducción no encontrada: ${key} en idioma ${selectedLanguage}`);
        // Fallback al español
        translation = translations['es']?.[key] || key;
      }
      
      // Interpolación de parámetros si es necesario
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(paramKey => {
          const regex = new RegExp(`{{${paramKey}}}`, 'g');
          translation = translation.replace(regex, params[paramKey]);
        });
      }
      
      return translation;
    };
    
    return {
      t,
      currentLanguage: selectedLanguage || 'es',
      translations: currentTranslations
    };
  } catch (error) {
    console.error('useTranslation error:', error);
    // Fallback completo en caso de error
    return {
      t: (key) => key,
      currentLanguage: 'es',
      translations: {}
    };
  }
};
