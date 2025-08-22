import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getAdIds, getAdMobConfig } from '../config/admob';
import admobService from '../services/admobService';

// Contexto para anuncios
const AdContext = createContext();

// Variables globales para controlar la inicialización
let globalRewardedAd = null;
let globalInterstitialAd = null;
let globalInitialized = false;
let globalPendingDownload = null; // Variable global para descarga pendiente

export const AdProvider = ({ children }) => {
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);
  const [isInterstitialAdLoaded, setIsInterstitialAdLoaded] = useState(false);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  // Removemos pendingDownload del estado de React
  // const [pendingDownload, setPendingDownload] = useState(null);

  useEffect(() => {
    // Solo inicializar una vez globalmente
    if (globalInitialized) {
      // console.log('🔄 Sistema de anuncios ya inicializado, saltando...');
      return;
    }

    // console.log('🎯 Inicializando sistema de anuncios global...');
    // console.log('🔧 Plataforma detectada:', Platform.OS);

    const initializeAds = async () => {
      try {
        // console.log('🚀 Iniciando inicialización de anuncios...');
        
        // Primero inicializar el servicio de AdMob
        await admobService.initialize();
        // console.log('✅ Servicio de AdMob inicializado');
        
        // Importar dinámicamente para evitar conflictos
        // console.log('📦 Importando librería de anuncios...');
        const { RewardedAd, InterstitialAd, AdEventType, RewardedAdEventType } = await import('react-native-google-mobile-ads');
        
        // console.log('📱 Librería de anuncios importada correctamente');
        // console.log('🔧 Tipos de eventos disponibles:', {
        //   AdEventType: Object.keys(AdEventType),
        //   RewardedAdEventType: Object.keys(RewardedAdEventType)
        // });
        
        // Crear instancia global de anuncio recompensado
        if (!globalRewardedAd) {
          const rewardedAdUnitId = getAdIds(Platform.OS).rewarded;
          // console.log('🎬 Creando anuncio recompensado con ID:', rewardedAdUnitId);
          
          try {
            globalRewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
              requestNonPersonalizedAdsOnly: true,
            });
            // console.log('✅ Instancia de anuncio recompensado creada');
          } catch (error) {
            // console.error('❌ Error creando instancia de anuncio recompensado:', error);
            throw error;
          }

          // Configurar listeners para anuncio recompensado usando tipos correctos
          // console.log('🎧 Configurando listeners para anuncio recompensado...');
          // console.log('🔍 Variable global globalPendingDownload al configurar listeners:', globalPendingDownload);
          
          globalRewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            // console.log('✅ Anuncio recompensado cargado');
            // console.log('📝 Estado de pendingDownload en LOADED:', globalPendingDownload);
            setIsRewardedAdLoaded(true);
          });

          // Usar AdEventType.CLOSED en lugar de RewardedAdEventType.CLOSED
          globalRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            // console.log('🔒 Anuncio recompensado cerrado');
            setIsRewardedAdLoaded(false);
            
            // Verificar si hay una descarga pendiente y ejecutarla
            if (globalPendingDownload) {
              // console.log('🎁 Ejecutando descarga pendiente desde evento CLOSED...');
              const { wallpaper, onDownload } = globalPendingDownload;
              globalPendingDownload = null;
              
              // Ejecutar la descarga inmediatamente
              setTimeout(() => {
                // console.log('⏰ Ejecutando descarga desde CLOSED...');
                try {
                  onDownload(wallpaper);
                  // console.log('✅ Descarga iniciada desde CLOSED');
                } catch (error) {
                  console.error('❌ Error ejecutando descarga desde CLOSED:', error);
                }
              }, 500);
            }
            
            // Recargar automáticamente
            setTimeout(() => {
              if (globalRewardedAd) {
                globalRewardedAd.load();
              }
            }, 1000);
          });

          globalRewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
            //console.error('❌ Error en anuncio recompensado:', error);
            setIsRewardedAdLoaded(false);
            
            // Si hay un error, también ejecutar la descarga pendiente
            if (globalPendingDownload) {
              // console.log('🎁 Ejecutando descarga pendiente desde evento ERROR...');
              const { wallpaper, onDownload } = globalPendingDownload;
              globalPendingDownload = null;
              
              // Ejecutar la descarga inmediatamente
              setTimeout(() => {
                // console.log('⏰ Ejecutando descarga desde ERROR...');
                try {
                  onDownload(wallpaper);
                  // console.log('✅ Descarga iniciada desde ERROR');
                } catch (error) {
                  console.error('❌ Error ejecutando descarga desde ERROR:', error);
                }
              }, 500);
            }
          });

          globalRewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            // console.log('🏆 Recompensa ganada:', reward);
            // console.log('📝 Estado de pendingDownload:', globalPendingDownload);
            // console.log('📝 Variable global globalPendingDownload:', globalPendingDownload);
            
            // Si hay una descarga pendiente, proceder con ella
            if (globalPendingDownload) {
              // console.log('🎁 Procediendo con descarga pendiente después del anuncio...');
              // console.log('📱 Wallpaper:', globalPendingDownload.wallpaper?.id);
              // console.log('🔧 Función onDownload:', typeof globalPendingDownload.onDownload);
              
              const { wallpaper, onDownload } = globalPendingDownload;
              globalPendingDownload = null;
              
              // Ejecutar la descarga en el siguiente tick para asegurar que el anuncio se haya cerrado
              setTimeout(() => {
                // console.log('⏰ Ejecutando descarga después del timeout...');
                try {
                  onDownload(wallpaper);
                  // console.log('✅ Descarga iniciada correctamente');
                } catch (error) {
                  console.error('❌ Error ejecutando descarga:', error);
                }
              }, 100);
            } else {
              // console.log('⚠️ No hay descarga pendiente para ejecutar');
              // console.log('🔍 Debug: globalPendingDownload es null o undefined');
            }
          });

          // Cargar el primer anuncio recompensado
          // console.log('📥 Cargando anuncio recompensado...');
          try {
            globalRewardedAd.load();
            // console.log('✅ Comando de carga enviado para anuncio recompensado');
          } catch (error) {
            console.error('❌ Error enviando comando de carga para anuncio recompensado:', error);
          }
        }

        // Crear instancia global de anuncio intersticial
        if (!globalInterstitialAd) {
          const interstitialAdUnitId = getAdIds(Platform.OS).interstitial;
          // console.log('🎬 Creando anuncio intersticial con ID:', interstitialAdUnitId);
          
          try {
            globalInterstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
              requestNonPersonalizedAdsOnly: true,
            });
            // console.log('✅ Instancia de anuncio intersticial creada');
          } catch (error) {
            // console.error('❌ Error creando instancia de anuncio intersticial:', error);
            throw error;
          }

          // Configurar listeners para anuncio intersticial usando tipos correctos
          // console.log('🎧 Configurando listeners para anuncio intersticial...');
          
          globalInterstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            // console.log('✅ Anuncio intersticial cargado');
            setIsInterstitialAdLoaded(true);
          });

          globalInterstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            // console.log('🔒 Anuncio intersticial cerrado, recargando...');
            setIsInterstitialAdLoaded(false);
            // Recargar automáticamente
            setTimeout(() => {
              if (globalInterstitialAd) {
                globalInterstitialAd.load();
              }
            }, 1000);
          });

          globalInterstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('❌ Error en anuncio intersticial:', error);
            setIsInterstitialAdLoaded(false);
          });

          // Cargar el primer anuncio intersticial
          // console.log('📥 Cargando anuncio intersticial...');
          try {
            globalInterstitialAd.load();
            // console.log('✅ Comando de carga enviado para anuncio intersticial');
          } catch (error) {
            console.error('❌ Error enviando comando de carga para anuncio intersticial:', error);
          }
        }

        globalInitialized = true;
        setIsLibraryLoaded(true);
        // console.log('✅ Sistema de anuncios inicializado correctamente');
        // console.log('🎯 Estado final:', {
        //   globalRewardedAd: !!globalRewardedAd,
        //   globalInterstitialAd: !!globalInterstitialAd,
        //   globalInitialized,
        //   isLibraryLoaded: true
        // });
      } catch (error) {
        // console.error('❌ Error inicializando sistema de anuncios:', error);
        // console.error('❌ Stack trace:', error.stack);
        // console.error('❌ Error name:', error.name);
        // console.error('❌ Error message:', error.message);
        setIsLibraryLoaded(false);
      }
    };

    // Ejecutar la inicialización
    // console.log('🚀 Ejecutando inicialización de anuncios...');
    initializeAds();
    
    // Cleanup function
    return () => {
      // console.log('🧹 Cleanup del AdContext');
    };
  }, []);

  const showRewardedAd = (wallpaper, onDownload) => {
    // console.log('🎬 showRewardedAd llamado - Estado:', {
    //   globalRewardedAd: !!globalRewardedAd,
    //   isLibraryLoaded,
    //   isRewardedAdLoaded,
    //   wallpaper: wallpaper?.id,
    //   onDownload: typeof onDownload
    // });
    
    if (!globalRewardedAd || !isLibraryLoaded) {
      // console.log('⚠️ Anuncio recompensado no está inicializado');
      return false;
    }

    if (isRewardedAdLoaded) {
      // console.log('🎬 Mostrando anuncio recompensado...');
      
      // Guardar la descarga pendiente para ejecutarla cuando se complete el anuncio
      if (wallpaper && onDownload) {
        // console.log('📝 Guardando descarga pendiente:', {
        //   wallpaperId: wallpaper.id,
        //   onDownloadType: typeof onDownload
        // });
        globalPendingDownload = { wallpaper, onDownload };
        // console.log('📝 Descarga guardada como pendiente en variable global');
        // console.log('📝 Variable global después de guardar:', globalPendingDownload);
      } else {
        // console.log('⚠️ No se pudo guardar descarga pendiente:', {
        //   hasWallpaper: !!wallpaper,
        //   hasOnDownload: !!onDownload
        // });
      }
      
      try {
        globalRewardedAd.show();
        // console.log('✅ Anuncio recompensado mostrado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error mostrando anuncio recompensado:', error);
        globalPendingDownload = null;
        return false;
      }
    } else {
      // console.log('⚠️ Anuncio recompensado no está cargado');
      return false;
    }
  };

  const showInterstitialAd = () => {
    if (!globalInterstitialAd || !isLibraryLoaded) {
      // console.log('⚠️ Anuncio intersticial no está inicializado');
      return false;
    }

    if (isInterstitialAdLoaded) {
      // console.log('🎬 Mostrando anuncio intersticial...');
      globalInterstitialAd.show();
      return true;
    } else {
      // console.log('⚠️ Anuncio intersticial no está cargado');
      return false;
    }
  };

  const loadRewardedAd = () => {
    if (globalRewardedAd && isLibraryLoaded) {
      // console.log('📥 Cargando anuncio recompensado...');
      try {
        globalRewardedAd.load();
      } catch (error) {
        console.error('❌ Error cargando anuncio recompensado:', error);
      }
    } else {
      // console.log('⚠️ No se puede cargar anuncio recompensado:', {
      //   globalRewardedAd: !!globalRewardedAd,
      //   isLibraryLoaded
      // });
    }
  };

  const loadInterstitialAd = () => {
    if (globalInterstitialAd && isLibraryLoaded) {
      // console.log('📥 Cargando anuncio intersticial...');
      try {
        globalInterstitialAd.load();
      } catch (error) {
        console.error('❌ Error cargando anuncio intersticial:', error);
      }
    } else {
      // console.log('⚠️ No se puede cargar anuncio intersticial:', {
      //   globalInterstitialAd: !!globalInterstitialAd,
      //   isLibraryLoaded
      // });
    }
  };

  const value = {
    // Estados
    isRewardedAdLoaded,
    isInterstitialAdLoaded,
    isLibraryLoaded,
    
    // Funciones
    showRewardedAd,
    showInterstitialAd,
    loadRewardedAd,
    loadInterstitialAd,
  };

  // Log del estado actual del contexto
  // console.log('🔍 AdContext - Estado actual:', {
  //   isRewardedAdLoaded,
  //   isInterstitialAdLoaded,
  //   isLibraryLoaded,
  //   globalInitialized,
  //   globalRewardedAd: !!globalRewardedAd,
  //   globalInterstitialAd: !!globalInterstitialAd
  // });

  // Log del valor del contexto
  // console.log('🔍 AdContext - Valor del contexto:', {
  //   isRewardedAdLoaded: value.isRewardedAdLoaded,
  //   isInterstitialAdLoaded: value.isInterstitialAdLoaded,
  //   isLibraryLoaded: value.isLibraryLoaded
  // });

  // Log de las funciones del contexto
  // console.log('🔍 AdContext - Funciones disponibles:', {
  //   showRewardedAd: typeof value.showRewardedAd,
  //   showInterstitialAd: typeof value.showInterstitialAd,
  //   loadRewardedAd: typeof value.loadRewardedAd,
  //   loadInterstitialAd: typeof value.loadInterstitialAd
  // });

  // Log de las variables globales
  // console.log('🔍 AdContext - Variables globales:', {
  //   globalRewardedAd: !!globalRewardedAd,
  //   globalInterstitialAd: !!globalInterstitialAd,
  //   globalInitialized
  // });

  // Log de la plataforma
  // console.log('🔍 AdContext - Plataforma:', Platform.OS);

  // Log de la configuración de AdMob
  try {
    const config = getAdMobConfig();
    // console.log('🔍 AdContext - Configuración de AdMob:', {
    //   isTestMode: config.isTestMode,
    //   platform: Platform.OS,
    //   ids: config.ids[Platform.OS]
    // });
  } catch (error) {
    // console.error('❌ Error obteniendo configuración de AdMob:', error);
  }

  // Log de los IDs de anuncios
  try {
    const adIds = getAdIds(Platform.OS);
    // console.log('🔍 AdContext - IDs de anuncios:', adIds);
  } catch (error) {
    // console.error('❌ Error obteniendo IDs de anuncios:', error);
  }

  // Log del estado del servicio de AdMob
  try {
    const admobStatus = admobService.getStatus();
    // console.log('🔍 AdContext - Estado del servicio de AdMob:', admobStatus);
  } catch (error) {
    console.error('❌ Error obteniendo estado del servicio de AdMob:', error);
  }

  // Log del estado del servicio de AdMob
  try {
    const admobReady = admobService.isReady();
    // console.log('🔍 AdContext - Servicio de AdMob listo:', admobReady);
  } catch (error) {
    console.error('❌ Error verificando estado del servicio de AdMob:', error);
  }

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    console.error('❌ useAds debe ser usado dentro de AdProvider');
    throw new Error('useAds debe ser usado dentro de AdProvider');
  }
  
  // Log del hook useAds
  // console.log('🔍 useAds - Hook llamado, contexto disponible');
  
  return context;
};
