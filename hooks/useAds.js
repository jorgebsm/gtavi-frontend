import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import adService from '../services/adService';
import { getAdConfig, getAdIds } from '../config/adConfig';

export const useAds = () => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adStats, setAdStats] = useState({
    totalShown: 0,
    totalSkipped: 0,
    totalCompleted: 0,
    lastAdTime: null,
  });
  
  const adConfig = useRef(getAdConfig());
  const adIds = useRef(getAdIds(Platform.OS));
  const isInitialized = useRef(false);

  // Inicializar servicio de anuncios
  const initializeAds = useCallback(async () => {
    if (isInitialized.current) return true;
    
    try {
      setIsAdLoading(true);
      const success = await adService.initialize();
      
      if (success) {
        isInitialized.current = true;
        setIsAdReady(true);
        // console.log('🚀 Hook de anuncios inicializado correctamente');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error inicializando anuncios en hook:', error);
      return false;
    } finally {
      setIsAdLoading(false);
    }
  }, []);

  // Cargar anuncio intersticial
  const loadInterstitial = useCallback(async () => {
    if (!isInitialized.current) {
      await initializeAds();
    }
    
    try {
      setIsAdLoading(true);
      const success = await adService.loadInterstitialAd();
      
      if (success) {
        setIsAdReady(true);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error cargando anuncio intersticial:', error);
      return false;
    } finally {
      setIsAdLoading(false);
    }
  }, [initializeAds]);

  // Mostrar anuncio intersticial
  const showInterstitial = useCallback(async () => {
    if (!isAdReady) {
      // console.log('⚠️ Anuncio no está listo, cargando...');
      const loaded = await loadInterstitial();
      if (!loaded) return false;
    }
    
    try {
      const success = await adService.showInterstitialAd();
      
      if (success) {
        // Actualizar estadísticas
        setAdStats(prev => ({
          ...prev,
          totalShown: prev.totalShown + 1,
          lastAdTime: Date.now(),
        }));
        
        // Cargar siguiente anuncio en background
        setTimeout(() => {
          loadInterstitial();
        }, 1000);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error mostrando anuncio intersticial:', error);
      return false;
    }
  }, [isAdReady, loadInterstitial]);

  // Verificar si se debe mostrar anuncio en transición
  const shouldShowAdInTransition = useCallback(async (fromScreen, toScreen) => {
    if (!isInitialized.current) {
      await initializeAds();
    }
    
    return await adService.handleScreenTransition(fromScreen, toScreen);
  }, [initializeAds]);

  // Manejar transición de pantalla con anuncio
  const handleScreenTransition = useCallback(async (fromScreen, toScreen) => {
    const shouldShow = await shouldShowAdInTransition(fromScreen, toScreen);
    
    if (shouldShow) {
      return await showInterstitial();
    }
    
    return false;
  }, [shouldShowAdInTransition, showInterstitial]);

  // Obtener estadísticas actualizadas
  const getAdStats = useCallback(() => {
    const serviceStats = adService.getAdStats();
    return {
      ...adStats,
      ...serviceStats,
    };
  }, [adStats]);

  // Resetear contadores
  const resetAdCounters = useCallback(() => {
    adService.resetCounters();
    setAdStats({
      totalShown: 0,
      totalSkipped: 0,
      totalCompleted: 0,
      lastAdTime: null,
    });
    // console.log('🔄 Contadores de anuncios reseteados en hook');
  }, []);

  // Precargar anuncios
  const preloadAds = useCallback(async () => {
    if (!isInitialized.current) {
      await initializeAds();
    }
    
    // Precargar anuncio intersticial
    await loadInterstitial();
    
    // console.log('📥 Anuncios precargados');
  }, [initializeAds, loadInterstitial]);

  // Efecto para inicialización automática
  useEffect(() => {
    if (adConfig.current.general.enabled) {
      initializeAds();
    }
  }, [initializeAds]);

  // Efecto para precargar anuncios cuando esté listo
  useEffect(() => {
    if (isAdReady && !isAdLoading) {
      preloadAds();
    }
  }, [isAdReady, isAdLoading, preloadAds]);

  return {
    // Estado
    isAdReady,
    isAdLoading,
    adStats,
    
    // Métodos
    initializeAds,
    loadInterstitial,
    showInterstitial,
    shouldShowAdInTransition,
    handleScreenTransition,
    getAdStats,
    resetAdCounters,
    preloadAds,
    
    // Configuración
    adConfig: adConfig.current,
    adIds: adIds.current,
  };
};

export default useAds;
