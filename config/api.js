// Configuración de la API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'https://gtavi-backend-production.up.railway.app/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://gtavi-backend-production.up.railway.app/api', // <-- así debe estar
    timeout: 15000,
  },
};

// Determinar el entorno actual
const getEnvironment = () => {
  // En desarrollo con Expo, usar development
  if (__DEV__) {
    return 'development';
  }
  // En producción, usar production
  return 'production';
};

// Obtener configuración actual
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// URL base para desarrollo local
export const DEV_API_URL = 'https://gtavi-backend-production.up.railway.app/api';

// URL base para emulador Android
export const ANDROID_EMULATOR_API_URL = 'http://10.0.2.2:5000/api';

// URL base para dispositivo físico (cambiar por tu IP local)
export const PHYSICAL_DEVICE_API_URL = 'https://gtavi-backend-production.up.railway.app/api'; // URL de Railway

// Función para obtener la URL correcta según la plataforma
export const getApiUrl = () => {
  if (__DEV__) {
    return PHYSICAL_DEVICE_API_URL;
  }
  // En producción, usar la URL configurada
  return getApiConfig().baseURL;
}; 