import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { getAdIds } from '../config/admob';
import admobService from './admobService';

class AdService {
  constructor() {
    this.interstitialAd = null;
    this.isLoading = false;
    this.lastLoadTime = 0;
    this.loadAttempts = 0;
    this.maxLoadAttempts = 3;
    this.fallbackMode = false;

    // No llamar a initializeInterstitialAd aquí - se hará cuando se necesite
    console.log('📱 AdService inicializado');
  }

  // Inicializar el servicio de anuncios con error handling
  async initialize() {
    try {
      // Usar el servicio de AdMob mejorado
      const success = await admobService.initialize();
      
      if (!success && admobService.isInFallbackMode()) {
        console.warn('⚠️ AdMob en modo fallback, ads deshabilitados');
        this.fallbackMode = true;
        return false;
      }
      
      if (Platform.OS === 'android') {
        await this.initializeAndroidAds();
      } else if (Platform.OS === 'ios') {
        await this.initializeIOSAds();
      }
      
      console.log('✅ Servicio de anuncios inicializado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando anuncios:', error);
      
      // Activar modo fallback para errores críticos
      if (this.isCriticalError(error)) {
        this.fallbackMode = true;
        console.warn('🚨 Error crítico detectado, activando modo fallback');
      }
      
      return false;
    }
  }

  // Verificar si es un error crítico que requiere fallback
  isCriticalError(error) {
    const criticalErrors = [
      'JNI',
      'native',
      'CallVoidMethod',
      'libreactnative.so',
      'TurboModule'
    ];
    
    return criticalErrors.some(keyword => 
      error.message?.includes(keyword) || 
      error.stack?.includes(keyword)
    );
  }

  // Inicializar anuncios de Android con error handling
  async initializeAndroidAds() {
    try {
      const adIds = getAdIds('android');
      console.log('📱 Configurando anuncios para Android');
      
      // Verificar que los IDs sean válidos
      if (!adIds.interstitial || adIds.interstitial.includes('xxxxxxxx')) {
        throw new Error('IDs de anuncios no configurados para Android');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error configurando anuncios Android:', error);
      return false;
    }
  }

  // Inicializar anuncios de iOS con error handling
  async initializeIOSAds() {
    try {
      const adIds = getAdIds('ios');
      console.log('📱 Configurando anuncios para iOS');
      
      // Verificar que los IDs sean válidos
      if (!adIds.interstitial || adIds.interstitial.includes('xxxxxxxx')) {
        throw new Error('IDs de anuncios no configurados para iOS');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error configurando anuncios iOS:', error);
      return false;
    }
  }

  // Cargar anuncio intersticial con error handling robusto
  async loadInterstitialAd() {
    if (this.fallbackMode) {
      console.warn('⚠️ Modo fallback activo, saltando carga de anuncios');
      return false;
    }

    if (this.isLoading) {
      console.log('⏳ Anuncio ya se está cargando...');
      return false;
    }

    // Verificar límite de intentos
    if (this.loadAttempts >= this.maxLoadAttempts) {
      console.warn('⚠️ Máximo de intentos de carga alcanzado');
      this.fallbackMode = true;
      return false;
    }

    try {
      this.isLoading = true;
      this.loadAttempts++;
      
      console.log(`🔄 Cargando anuncio intersticial (intento ${this.loadAttempts})`);
      
      const adIds = getAdIds(Platform.OS);
      const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : adIds.interstitial;
      
      // Crear nuevo anuncio
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
      
      // Configurar listeners con error handling
      const unsubscribeLoaded = this.interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          console.log('✅ Anuncio intersticial cargado correctamente');
          this.isLoading = false;
          this.loadAttempts = 0; // Resetear contadores en éxito
        }
      );

      const unsubscribeError = this.interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error('❌ Error cargando anuncio intersticial:', error);
          this.isLoading = false;
          this.handleAdError(error);
        }
      );

      const unsubscribeClosed = this.interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log('🔒 Anuncio intersticial cerrado');
          this.interstitialAd = null;
          unsubscribeLoaded();
          unsubscribeError();
          unsubscribeClosed();
        }
      );

      // Cargar anuncio con timeout
      const loadPromise = this.interstitialAd.load();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout cargando anuncio')), 15000)
      );
      
      await Promise.race([loadPromise, timeoutPromise]);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error en carga de anuncio:', error);
      this.isLoading = false;
      this.handleAdError(error);
      return false;
    }
  }

  // Manejar errores de anuncios
  handleAdError(error) {
    if (this.isCriticalError(error)) {
      console.warn('🚨 Error crítico de anuncios, activando modo fallback');
      this.fallbackMode = true;
    }
    
    // Incrementar contador de intentos
    this.loadAttempts++;
    
    // Limpiar anuncio fallido
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
  }

  // Mostrar anuncio intersticial con error handling
  async showInterstitialAd() {
    if (this.fallbackMode) {
      console.warn('⚠️ Modo fallback activo, no se pueden mostrar anuncios');
      return false;
    }

    if (!this.interstitialAd) {
      console.warn('⚠️ No hay anuncio intersticial cargado');
      return false;
    }

    try {
      console.log('🎬 Mostrando anuncio intersticial...');
      
      // Verificar que el anuncio esté listo
      if (!this.interstitialAd.loaded) {
        console.warn('⚠️ Anuncio no está listo para mostrar');
        return false;
      }
      
      await this.interstitialAd.show();
      this.lastLoadTime = Date.now();
      return true;
      
    } catch (error) {
      console.error('❌ Error mostrando anuncio intersticial:', error);
      this.handleAdError(error);
      return false;
    }
  }

  // Verificar si se debe mostrar anuncio
  shouldShowAd() {
    if (this.fallbackMode) {
      return false;
    }
    
    const minTimeBetweenAds = 3 * 60 * 1000; // 3 minutos
    const timeSinceLastAd = Date.now() - this.lastLoadTime;
    
    return timeSinceLastAd >= minTimeBetweenAds;
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      isInitialized: !this.fallbackMode,
      isInFallbackMode: this.fallbackMode,
      isLoading: this.isLoading,
      hasInterstitialAd: !!this.interstitialAd,
      loadAttempts: this.loadAttempts,
      lastLoadTime: this.lastLoadTime,
      shouldShowAd: this.shouldShowAd(),
    };
  }

  // Resetear contadores
  resetCounters() {
    this.loadAttempts = 0;
    this.lastLoadTime = 0;
    console.log('🔄 Contadores de anuncios reseteados');
  }

  // Limpiar recursos
  cleanup() {
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
    this.isLoading = false;
    console.log('🧹 Recursos de anuncios limpiados');
  }
}

export default new AdService();
