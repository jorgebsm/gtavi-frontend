import es from './es';
import en from './en';
import fr from './fr';
import ar from './ar';
import pl from './pl';
import pt from './pt';

export const translations = {
  es,
  en,
  fr,
  ar,
  pl,
  pt
};

export const supportedLanguages = ['es', 'en', 'fr', 'ar', 'pl', 'pt'];

export const languageNames = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  pl: 'Polski',
  pt: 'Português'
};

// Mapeo de regiones a idiomas
export const regionLanguageMapping = {
  // África francófona
  'CI': 'fr', // Costa de Marfil
  'GN': 'fr', // Guinea
  'SN': 'fr', // Senegal
  'ML': 'fr', // Mali
  'BF': 'fr', // Burkina Faso
  
  // Países anglófonos
  'KE': 'en', // Kenia
  'PK': 'en', // Pakistán
  'AU': 'en', // Australia
  'PH': 'en', // Filipinas
  'NG': 'en', // Nigeria
  'ZA': 'en', // Sudáfrica
  'IN': 'en', // India
  'US': 'en', // Estados Unidos
  'GB': 'en', // Reino Unido
  'CA': 'en', // Canadá
  
  // Países específicos
  'PL': 'pl', // Polonia
  'BR': 'pt', // Brasil
  'PT': 'pt', // Portugal
  'IL': 'ar', // Israel (preferimos árabe por región)
  'TH': 'en', // Tailandia (inglés como fallback)
  
  // Países árabes
  'SA': 'ar', // Arabia Saudita
  'EG': 'ar', // Egipto
  'AE': 'ar', // Emiratos Árabes Unidos
  'JO': 'ar', // Jordania
  'LB': 'ar', // Líbano
  'SY': 'ar', // Siria
  'IQ': 'ar', // Irak
  'MA': 'ar', // Marruecos
  'TN': 'ar', // Túnez
  'DZ': 'ar', // Argelia
  
  // América Latina
  'MX': 'es', // México
  'AR': 'es', // Argentina
  'CO': 'es', // Colombia
  'PE': 'es', // Perú
  'CL': 'es', // Chile
  'VE': 'es', // Venezuela
  'EC': 'es', // Ecuador
  'BO': 'es', // Bolivia
  'UY': 'es', // Uruguay
  'PY': 'es', // Paraguay
  
  // Europa francófona
  'FR': 'fr', // Francia
  'BE': 'fr', // Bélgica (francés)
  'CH': 'fr', // Suiza (francés)
};
