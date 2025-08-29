import mobileAds from 'react-native-google-mobile-ads';
import { getAdMobConfig } from '../config/admob';

class AdMobService {
  constructor() {
    this.isInitialized = false;
    this.initializationAttempts = 0;
    this.maxInitializationAttempts = 3;
    this.fallbackMode = false;
    this.lastError = null;
  }

  // Inicializar AdMob con error handling robusto
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    // Evitar múltiples intentos simultáneos
    if (this.initializationAttempts >= this.maxInitializationAttempts) {
      // console.warn('⚠️ Máximo de intentos de inicialización alcanzado, usando modo fallback');
      this.fallbackMode = true;
      return false;
    }

    this.initializationAttempts++;

    try {
      // console.log(`🚀 Intento ${this.initializationAttempts} de inicialización de Google AdMob...`);
      
      // Timeout de seguridad para evitar bloqueos
      const initPromise = mobileAds().initialize();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de inicialización')), 10000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      
      this.isInitialized = true;
      this.lastError = null;
      // console.log('✅ Google AdMob inicializado correctamente');
      
      return true;
      
    } catch (error) {
      this.lastError = error;
      // console.error(`❌ Error en intento ${this.initializationAttempts}:`, error);
      
      // Si es el último intento, activar modo fallback
      if (this.initializationAttempts >= this.maxInitializationAttempts) {
        // console.warn('🔄 Activando modo fallback - ads deshabilitados');
        this.fallbackMode = true;
        return false;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000 * this.initializationAttempts));
      
      // Reintentar
      return this.initialize();
    }
  }

  // Verificar si AdMob está listo o en modo fallback
  isReady() {
    return this.isInitialized || this.fallbackMode;
  }

  // Verificar si está en modo fallback
  isInFallbackMode() {
    return this.fallbackMode;
  }

  // Obtener información de estado detallada
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isInFallbackMode: this.fallbackMode,
      initializationAttempts: this.initializationAttempts,
      lastError: this.lastError?.message || null,
      config: getAdMobConfig(),
    };
  }

  // Resetear el servicio (útil para testing)
  reset() {
    this.isInitialized = false;
    this.initializationAttempts = 0;
    this.fallbackMode = false;
    this.lastError = null;
  }

  // Método seguro para operaciones de ads
  async safeOperation(operation, fallbackValue = null) {
    try {
      if (!this.isReady()) {
        await this.initialize();
      }
      
      if (this.fallbackMode) {
        // console.warn('⚠️ Operación de ads en modo fallback');
        return fallbackValue;
      }
      
      return await operation();
      
    } catch (error) {
      // console.error('❌ Error en operación de ads:', error);
      this.lastError = error;
      
      // Activar modo fallback si es un error crítico
      if (error.message?.includes('JNI') || error.message?.includes('native')) {
        // console.warn('🚨 Error nativo detectado, activando modo fallback');
        this.fallbackMode = true;
      }
      
      return fallbackValue;
    }
  }
}

// Exportar instancia singleton
export default new AdMobService();
