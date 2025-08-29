import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import adService from '../services/adService';
import admobService from '../services/admobService';
import { getAdConfig, getAdIds } from '../config/adConfig';

export const useAds = () => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isInFallbackMode, setIsInFallbackMode] = useState(false);
  const [adStats, setAdStats] = useState({
    totalShown: 0,
    totalSkipped: 0,
    totalCompleted: 0,
    totalErrors: 0,
    lastAdTime: null,
  });
  
  const adConfig = useRef(getAdConfig());
  const adIds = useRef(getAdIds(Platform.OS));
  const isInitialized = useRef(false);
  const errorCount = useRef(0);
  const maxErrors = 3;

  // Inicializar servicio de anuncios con error handling robusto
  const initializeAds = useCallback(async () => {
    if (isInitialized.current) return true;
    
    try {
      setIsAdLoading(true);
      
      // Verificar si AdMob está en modo fallback
      if (admobService.isInFallbackMode()) {
        console.warn('⚠️ AdMob en modo fallback, ads deshabilitados');
        setIsInFallbackMode(true);
        isInitialized.current = true;
        return false;
      }
      
      const success = await adService.initialize();
      
      if (success) {
        isInitialized.current = true;
        setIsAdReady(true);
        errorCount.current = 0; // Resetear contador de errores
        console.log('🚀 Hook de anuncios inicializado correctamente');
      } else {
        // Verificar si el servicio está en modo fallback
        const status = adService.getStatus();
        if (status.isInFallbackMode) {
          setIsInFallbackMode(true);
          console.warn('⚠️ Servicio de ads en modo fallback');
        }
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error inicializando anuncios en hook:', error);
      errorCount.current++;
      
      // Activar modo fallback si hay muchos errores
      if (errorCount.current >= maxErrors) {
        setIsInFallbackMode(true);
        console.warn('🚨 Demasiados errores, activando modo fallback');
      }
      
      return false;
    } finally {
      setIsAdLoading(false);
    }
  }, []);

  // Cargar anuncio intersticial con error handling
  const loadInterstitial = useCallback(async () => {
    if (isInFallbackMode) {
      console.warn('⚠️ Modo fallback activo, saltando carga de anuncios');
      return false;
    }
    
    if (!isInitialized.current) {
      await initializeAds();
    }
    
    try {
      setIsAdLoading(true);
      const success = await adService.loadInterstitialAd();
      
      if (success) {
        setIsAdReady(true);
        errorCount.current = 0; // Resetear contadores en éxito
      } else {
        // Verificar si el servicio entró en modo fallback
        const status = adService.getStatus();
        if (status.isInFallbackMode) {
          setIsInFallbackMode(true);
        }
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error cargando anuncio intersticial:', error);
      errorCount.current++;
      
      // Activar modo fallback si hay muchos errores
      if (errorCount.current >= maxErrors) {
        setIsInFallbackMode(true);
        console.warn('🚨 Demasiados errores de carga, activando modo fallback');
      }
      
      return false;
    } finally {
      setIsAdLoading(false);
    }
  }, [initializeAds, isInFallbackMode]);

  // Mostrar anuncio intersticial con error handling
  const showInterstitial = useCallback(async () => {
    if (isInFallbackMode) {
      console.warn('⚠️ Modo fallback activo, no se pueden mostrar anuncios');
      return false;
    }
    
    try {
      const success = await adService.showInterstitialAd();
      
      if (success) {
        setAdStats(prev => ({
          ...prev,
          totalShown: prev.totalShown + 1,
          lastAdTime: Date.now(),
        }));
        errorCount.current = 0; // Resetear contadores en éxito
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error mostrando anuncio intersticial:', error);
      setAdStats(prev => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
      }));
      errorCount.current++;
      
      // Activar modo fallback si hay muchos errores
      if (errorCount.current >= maxErrors) {
        setIsInFallbackMode(true);
        console.warn('🚨 Demasiados errores de visualización, activando modo fallback');
      }
      
      return false;
    }
  }, [isInFallbackMode]);

  // Determinar si se debe mostrar anuncio en transición
  const shouldShowAdInTransition = useCallback((fromScreen, toScreen) => {
    if (isInFallbackMode) {
      return false;
    }
    
    const transitionKey = `${fromScreen}-${toScreen}`;
    const probability = adConfig.current.screenTransitions[transitionKey]?.probability || 0;
    
    if (!probability) return false;
    
    // Verificar límites de anuncios
    if (adStats.totalShown >= adConfig.current.general.maxAdsPerSession) {
      return false;
    }
    
    // Verificar tiempo mínimo entre anuncios
    if (adStats.lastAdTime) {
      const timeSinceLastAd = Date.now() - adStats.lastAdTime;
      const minTimeMs = adConfig.current.general.minTimeBetweenAds * 60 * 1000;
      
      if (timeSinceLastAd < minTimeMs) {
        return false;
      }
    }
    
    // Aplicar probabilidad
    return Math.random() < probability;
  }, [isInFallbackMode, adStats, adConfig]);

  // Manejar transición entre pantallas con error handling
  const handleScreenTransition = useCallback(async (fromScreen, toScreen) => {
    if (isInFallbackMode) {
      return false;
    }
    
    if (shouldShowAdInTransition(fromScreen, toScreen)) {
      try {
        // Cargar anuncio si no está disponible
        if (!adService.getStatus().hasInterstitialAd) {
          await loadInterstitial();
        }
        
        // Mostrar anuncio
        return await showInterstitial();
      } catch (error) {
        console.error('❌ Error en transición de pantalla:', error);
        return false;
      }
    }
    
    return false;
  }, [isInFallbackMode, shouldShowAdInTransition, loadInterstitial, showInterstitial]);

  // Obtener estadísticas completas
  const getAdStats = useCallback(() => {
    const serviceStats = adService.getStatus();
    const admobStats = admobService.getStatus();
    
    return {
      ...adStats,
      ...serviceStats,
      admobStatus: admobStats,
      isInFallbackMode,
      errorCount: errorCount.current,
      maxErrors,
    };
  }, [adStats, isInFallbackMode]);

  // Resetear contadores y estado
  const resetAdCounters = useCallback(() => {
    adService.resetCounters();
    errorCount.current = 0;
    setAdStats({
      totalShown: 0,
      totalSkipped: 0,
      totalCompleted: 0,
      totalErrors: 0,
      lastAdTime: null,
    });
    console.log('🔄 Contadores de anuncios reseteados en hook');
  }, []);

  // Precargar anuncios con error handling
  const preloadAds = useCallback(async () => {
    if (isInFallbackMode) {
      console.warn('⚠️ Modo fallback activo, saltando precarga');
      return;
    }
    
    if (!isInitialized.current) {
      await initializeAds();
    }
    
    // Precargar anuncio intersticial
    await loadInterstitial();
    
    console.log('📥 Anuncios precargados');
  }, [initializeAds, loadInterstitial, isInFallbackMode]);

  // Efecto para inicialización automática
  useEffect(() => {
    if (adConfig.current.general.enabled && !isInFallbackMode) {
      initializeAds();
    }
  }, [initializeAds, isInFallbackMode]);

  // Efecto para precargar anuncios cuando esté listo
  useEffect(() => {
    if (isAdReady && !isAdLoading && !isInFallbackMode) {
      preloadAds();
    }
  }, [isAdReady, isAdLoading, isInFallbackMode, preloadAds]);

  // Efecto para monitorear cambios en el modo fallback
  useEffect(() => {
    const checkFallbackStatus = () => {
      const admobFallback = admobService.isInFallbackMode();
      const adServiceFallback = adService.getStatus().isInFallbackMode;
      
      if (admobFallback || adServiceFallback) {
        setIsInFallbackMode(true);
        console.warn('🔄 Modo fallback detectado, ads deshabilitados');
      }
    };
    
    // Verificar cada 5 segundos
    const interval = setInterval(checkFallbackStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    // Estado
    isAdReady,
    isAdLoading,
    isInFallbackMode,
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
