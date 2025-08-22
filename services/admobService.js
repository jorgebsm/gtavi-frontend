import mobileAds from 'react-native-google-mobile-ads';
import { getAdMobConfig } from '../config/admob';

class AdMobService {
  constructor() {
    this.isInitialized = false;
  }

  // Inicializar AdMob
  async initialize() {
    if (this.isInitialized) {
      // console.log('✅ AdMob ya está inicializado');
      return;
    }

    try {
      // console.log('🚀 Inicializando Google AdMob...');
      
      // Configurar AdMob - solo la inicialización básica
      await mobileAds().initialize();
      
      this.isInitialized = true;
      // console.log('✅ Google AdMob inicializado correctamente');
      
      // Mostrar información de configuración
      const config = getAdMobConfig();
    //   console.log('📱 Configuración de AdMob:', {
    //     isTestMode: config.isTestMode,
    //     platform: config.ids,
    //   });
      
    } catch (error) {
      // console.error('❌ Error inicializando AdMob:', error);
      throw error;
    }
  }

  // Verificar si AdMob está inicializado
  isReady() {
    return this.isInitialized;
  }

  // Obtener información de estado
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      config: getAdMobConfig(),
    };
  }
}

// Exportar instancia singleton
export default new AdMobService();
