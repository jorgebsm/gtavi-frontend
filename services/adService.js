import { Platform } from 'react-native';
import { getAdConfig } from '../config/adConfig';
import { InterstitialAd } from 'react-native-google-mobile-ads';
import { getAdIds } from '../config/admob';

class AdService {
  constructor() {
    this.interstitialAd = null;
    this.isAdLoading = false;
    this.adCounter = 0;
    this.lastAdShown = null;
    
    // Obtener configuración desde adConfig.js
    const config = getAdConfig();
    this.adConfig = {
      // Probabilidades de mostrar anuncios entre pantallas
      screenTransitionAds: {
        'Home-Trailers': config.general.enabled ? 0.2 : 0.0,    // 20% o 0%
        'Trailers-News': config.general.enabled ? 0.2 : 0.0,    // 20% o 0%
        'News-Leaks': config.general.enabled ? 0.2 : 0.0,       // 20% o 0%
        'Leaks-More': config.general.enabled ? 1.0 : 0.0,       // 100% o 0%
      },
      // Tiempo mínimo entre anuncios (en minutos)
      minTimeBetweenAds: config.general.minTimeBetweenAds || 3,
      // Máximo de anuncios por sesión
      maxAdsPerSession: config.general.maxAdsPerSession || 5,
    };
    
    // Log para confirmar configuración
    // console.log('🚫 Configuración de anuncios:', {
    //   enabled: config.general.enabled,
    //   probabilities: this.adConfig.screenTransitionAds
    // });
    
    // Inicializar anuncio intersticial
    this.initializeInterstitialAd();
  }

  // Inicializar el servicio de anuncios
  async initialize() {
    try {
      if (Platform.OS === 'android') {
        // Configuración para Android
        await this.initializeAndroidAds();
      } else if (Platform.OS === 'ios') {
        // Configuración para iOS
        await this.initializeIOSAds();
      }
      
      // console.log('✅ Servicio de anuncios inicializado correctamente');
      return true;
    } catch (error) {
      // console.error('❌ Error inicializando anuncios:', error);
      return false;
    }
  }

  // Inicializar anuncio intersticial
  initializeInterstitialAd() {
    try {
      // Obtener ID según plataforma y entorno
      const adUnitId = getAdIds(Platform.OS).interstitial;
      
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      
      // Configurar event listeners usando strings
      this.interstitialAd.addAdEventListener('loaded', () => {
        // console.log('✅ Anuncio intersticial cargado');
        this.isAdLoading = false;
      });
      
      this.interstitialAd.addAdEventListener('closed', () => {
        // console.log('🔒 Anuncio intersticial cerrado');
        this.isAdLoading = false;
        // Recargar automáticamente
        this.loadInterstitialAd();
      });
      
      this.interstitialAd.addAdEventListener('error', (error) => {
        // console.error('❌ Error en anuncio intersticial:', error);
        this.isAdLoading = false;
      });
      
      // console.log('📱 Anuncio intersticial inicializado para Android');
    } catch (error) {
      // console.error('❌ Error inicializando anuncio intersticial:', error);
    }
  }

  // Inicializar anuncios para Android
  async initializeAndroidAds() {
    // Ya se inicializó en el constructor
    // console.log('📱 Anuncios Android ya inicializados');
  }

  // Inicializar anuncios para iOS
  async initializeIOSAds() {
    // Aquí iría la inicialización de Google AdMob para iOS
    // console.log('🍎 Inicializando anuncios para iOS');
  }

  // Determinar si se debe mostrar un anuncio
  shouldShowAd(fromScreen, toScreen) {
    const transitionKey = `${fromScreen}-${toScreen}`;
    const probability = this.adConfig.screenTransitionAds[transitionKey];
    
    if (!probability) return false;
    
    // Verificar límites de anuncios
    if (this.adCounter >= this.adConfig.maxAdsPerSession) {
      // console.log('🚫 Límite de anuncios por sesión alcanzado');
      return false;
    }
    
    // Verificar tiempo mínimo entre anuncios
    if (this.lastAdShown) {
      const timeSinceLastAd = Date.now() - this.lastAdShown;
      const minTimeMs = this.adConfig.minTimeBetweenAds * 60 * 1000;

      // console.log("timeSinceLastAd "+ timeSinceLastAd);
      // console.log("minTimeMs "+ minTimeMs);
      
      if (timeSinceLastAd < minTimeMs) {
        // console.log('⏰ Muy pronto para mostrar otro anuncio');
        return false;
      }
    }
    
    // Aplicar probabilidad
    const shouldShow = Math.random() < probability;
    
    // if (shouldShow) {
    //   // console.log(`🎯 Mostrando anuncio para transición: ${transitionKey} (${probability * 100}% probabilidad)`);
    // }
    
    return shouldShow;
  }

  // Cargar anuncio intersticial
  async loadInterstitialAd() {
    if (this.isAdLoading || !this.interstitialAd) {
      // console.log('⏳ Ya hay un anuncio cargándose o no está inicializado');
      return false;
    }

    try {
      this.isAdLoading = true;
      // console.log('📥 Cargando anuncio intersticial...');
      
      await this.interstitialAd.load();
      return true;
    } catch (error) {
      this.isAdLoading = false;
      // console.error('❌ Error cargando anuncio:', error);
      return false;
    }
  }

  // Mostrar anuncio intersticial
  async showInterstitialAd() {
    try {
      if (!this.interstitialAd) {
        // console.log('⚠️ No hay anuncio disponible, cargando uno nuevo...');
        const loaded = await this.loadInterstitialAd();
        if (!loaded) return false;
      }
      
      // console.log('🎬 Mostrando anuncio intersticial...');
      
      await this.interstitialAd.show();
      
      // Actualizar contadores
      this.adCounter++;
      this.lastAdShown = Date.now();
      
      // console.log(`📊 Anuncio mostrado. Total en esta sesión: ${this.adCounter}`);
      
      return true;
    } catch (error) {
      // console.error('❌ Error mostrando anuncio:', error);
      return false;
    }
  }

  // Manejar transición entre pantallas
  async handleScreenTransition(fromScreen, toScreen) {
    if (this.shouldShowAd(fromScreen, toScreen)) {
      // console.log(`🔄 Transición de ${fromScreen} a ${toScreen} - Mostrando anuncio`);
      
      // Cargar anuncio si no está disponible
      if (!this.interstitialAd) {
        await this.loadInterstitialAd();
      }
      
      // Mostrar anuncio
      return await this.showInterstitialAd();
    }
    
    return false;
  }

  // Obtener estadísticas de anuncios
  getAdStats() {
    return {
      totalAdsShown: this.adCounter,
      lastAdTime: this.lastAdShown,
      maxAdsPerSession: this.adConfig.maxAdsPerSession,
      remainingAds: this.adConfig.maxAdsPerSession - this.adCounter,
    };
  }

  // Resetear contadores (útil para nueva sesión)
  resetCounters() {
    this.adCounter = 0;
    this.lastAdShown = null;
    // console.log('🔄 Contadores de anuncios reseteados');
  }
}

// Exportar instancia singleton
export default new AdService();
