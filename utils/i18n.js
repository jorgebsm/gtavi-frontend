import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { translations, supportedLanguages, regionLanguageMapping } from '../locales';

// Crear instancia de i18n
const i18n = new I18n(translations);

// Configuración por defecto
i18n.defaultLocale = 'es';
i18n.locale = 'es';
i18n.fallbacks = true;

// Función para detectar el idioma del dispositivo
export const detectDeviceLanguage = () => {
  try {
    // Obtener la configuración regional del dispositivo
    const deviceLocales = Localization.getLocales();
    const primaryLocale = deviceLocales[0];
    
    if (!primaryLocale) return 'es';
    
    const languageCode = primaryLocale.languageCode;
    const regionCode = primaryLocale.regionCode;
        
    // 1. Verificar si tenemos mapeo específico para la región
    if (regionCode && regionLanguageMapping[regionCode]) {
      const mappedLanguage = regionLanguageMapping[regionCode];
      if (supportedLanguages.includes(mappedLanguage)) {
        return mappedLanguage;
      }
    }
    
    // 2. Verificar si soportamos directamente el idioma del dispositivo
    if (supportedLanguages.includes(languageCode)) {
      return languageCode;
    }
    
    // 3. Mapeos especiales para idiomas similares
    const languageFallbacks = {
      'he': 'ar', // Hebreo -> Árabe (ambos RTL y región similar)
      'ur': 'ur', // Urdu soportado
      'fa': 'ar', // Persa -> Árabe (ambos RTL)
      'ca': 'es', // Catalán -> Español
      'eu': 'es', // Euskera -> Español
      'gl': 'es', // Gallego -> Español
      'it': 'it', // Italiano soportado
      'ro': 'es', // Rumano -> Español (idiomas latinos)
      'de': 'de', // Alemán soportado
      'nl': 'en', // Holandés -> Inglés
      'sv': 'en', // Sueco -> Inglés
      'no': 'en', // Noruego -> Inglés
      'da': 'en', // Danés -> Inglés
      'fi': 'en', // Finlandés -> Inglés
      'hu': 'en', // Húngaro -> Inglés
      'cs': 'pl', // Checo -> Polaco (región similar)
      'sk': 'pl', // Eslovaco -> Polaco (región similar)
      'uk': 'pl', // Ucraniano -> Polaco (región similar)
      'ru': 'ru', // Ruso soportado
      'hi': 'hi', // Hindi soportado
      'th': 'th', // Tailandés soportado
      'fil': 'fil', // Filipino soportado
    };
    
    if (languageFallbacks[languageCode]) {
      const fallbackLanguage = languageFallbacks[languageCode];
      return fallbackLanguage;
    }
    
    // 4. Fallback por región geográfica
    const regionFallbacks = {
      'EU': 'en', // Europa -> Inglés
      'AS': 'en', // Asia -> Inglés
      'AF': 'fr', // África -> Francés (muchos países francófonos)
      'NA': 'en', // Norte América -> Inglés
      'SA': 'es', // Sud América -> Español
      'OC': 'en', // Oceanía -> Inglés
    };
    
    // Intentar detectar región por código de país
    const continentByCountry = {
      // Europa
      'DE': 'EU', 'IT': 'EU', 'NL': 'EU', 'SE': 'EU', 'NO': 'EU',
      // Asia
      'CN': 'AS', 'JP': 'AS', 'KR': 'AS', 'VN': 'AS', 'MY': 'AS',
      // África (países no francófonos)
      'ZA': 'AF', 'ET': 'AF', 'GH': 'AF',
    };
    
    if (regionCode && continentByCountry[regionCode]) {
      const continent = continentByCountry[regionCode];
      const continentFallback = regionFallbacks[continent];
      if (continentFallback) {
        return continentFallback;
      }
    }
    
    return 'es';
    
  } catch (error) {
    console.error('Error detecting device language:', error);
    return 'es';
  }
};

// Función para establecer el idioma
export const setLanguage = (languageCode) => {
  if (supportedLanguages.includes(languageCode)) {
    i18n.locale = languageCode;
  } else {
    console.warn('Unsupported language:', languageCode, 'Falling back to default');
    i18n.locale = i18n.defaultLocale;
  }
};

// Función para obtener el idioma actual
export const getCurrentLanguage = () => {
  return i18n.locale;
};

// Función para obtener traducciones
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};

// Función para verificar si el idioma actual es RTL
export const isRTL = () => {
  const currentTranslations = translations[getCurrentLanguage()];
  return currentTranslations?.isRTL || false;
};

// Función para formatear fechas según el idioma
export const formatDate = (date, options = {}) => {
  if (!date) return t('dateNotAvailable');
  
  const dateObj = new Date(date);
  const currentLanguage = getCurrentLanguage();
  
  // Mapeo de idiomas a locales para formateo de fechas
  const localeMap = {
    'es': 'es-ES',
    'en': 'en-US',
    'fr': 'fr-FR',
    'ar': 'ar-SA',
    'pl': 'pl-PL',
    'pt': 'pt-BR',
    'ru': 'ru-RU',
    'it': 'it-IT',
    'ur': 'ur-PK',
    'hi': 'hi-IN',
    'th': 'th-TH',
    'de': 'de-DE',
    'fil': 'fil-PH'
  };
  
  const locale = localeMap[currentLanguage] || 'es-ES';
  const currentTranslations = translations[currentLanguage];
  const formatOptions = { 
    ...currentTranslations.dateFormat, 
    ...options 
  };
  
  try {
    return dateObj.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleDateString('es-ES', formatOptions);
  }
};

// Inicializar idioma
const initializeLanguage = () => {
  const detectedLanguage = detectDeviceLanguage();
  setLanguage(detectedLanguage);
};

// Inicializar automáticamente
initializeLanguage();

export default i18n;
