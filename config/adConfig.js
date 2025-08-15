// Configuración de anuncios para la app GTA VI Countdown
export const AD_CONFIG = {
  // Configuración general
  general: {
    enabled: false, //JOKE: Apagar o encender los anuncios
    testMode: __DEV__, // Modo test en desarrollo
    minTimeBetweenAds: 3, // minutos
    maxAdsPerSession: 5,
    adDuration: 5, // segundos
  },

  // Configuración por plataforma
  platform: {
    android: {
      adMob: {
        appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy', // Tu App ID de AdMob
        interstitialId: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz', // Tu Interstitial ID
        testInterstitialId: 'ca-app-pub-3940256099942544/1033173712', // ID de test de Google
      },
      facebook: {
        enabled: false,
        placementId: 'YOUR_FACEBOOK_PLACEMENT_ID',
      },
    },
    ios: {
      adMob: {
        appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy', // Tu App ID de AdMob
        interstitialId: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz', // Tu Interstitial ID
        testInterstitialId: 'ca-app-pub-3940256099942544/4411468910', // ID de test de Google
      },
      facebook: {
        enabled: false,
        placementId: 'YOUR_FACEBOOK_PLACEMENT_ID',
      },
    },
  },

  // Configuración de transiciones entre pantallas
  screenTransitions: {
    'Home-Trailers': {
      probability: 0.2, // 20% probabilidad
      minTimeBetween: 5, // minutos
      priority: 'low',
    },
    'Trailers-News': {
      probability: 0.2, // 20% probabilidad
      minTimeBetween: 5, // minutos
      priority: 'low',
    },
    'News-Leaks': {
      probability: 0.2, // 20% probabilidad
      minTimeBetween: 5, // minutos
      priority: 'medium',
    },
    'Leaks-More': {
      probability: 1.0, // 100% probabilidad - SIEMPRE
      minTimeBetween: 2, // minutos
      priority: 'high',
      forceShow: true, // Forzar mostrar
    },
  },

  // Configuración de eventos especiales
  specialEvents: {
    // Mostrar más anuncios en fechas especiales
    launchDate: {
      enabled: true,
      multiplier: 1.5, // 50% más anuncios
      startDate: '2024-12-01', // 1 mes antes del lanzamiento
      endDate: '2024-12-31',
    },
    // Anuncios en días de la semana
    weekdays: {
      monday: 1.2, // 20% más anuncios los lunes
      friday: 1.3, // 30% más anuncios los viernes
      weekend: 0.8, // 20% menos anuncios en fin de semana
    },
  },

  // Configuración de fallback
  fallback: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000, // ms
    showPlaceholder: true, // Mostrar pantalla de placeholder si falla
  },

  // Configuración de analytics
  analytics: {
    enabled: true,
    trackImpressions: true,
    trackClicks: true,
    trackCompletions: true,
    trackSkips: true,
  },
};

// Configuración de test
export const TEST_CONFIG = {
  enabled: __DEV__,
  showTestBanner: true,
  testAdIds: {
    android: {
      interstitial: 'ca-app-pub-3940256099942544/1033173712',
      banner: 'ca-app-pub-3940256099942544/6300978111',
    },
    ios: {
      interstitial: 'ca-app-pub-3940256099942544/4411468910',
      banner: 'ca-app-pub-3940256099942544/2934735716',
    },
  },
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  mockAds: true, // Simular anuncios en desarrollo
  mockDelay: 2000, // ms de delay para simular carga
  logLevel: 'debug', // 'debug', 'info', 'warn', 'error'
  showAdStats: true, // Mostrar estadísticas en consola
};

// Función para obtener configuración según el entorno
export const getAdConfig = () => {
  if (__DEV__) {
    return {
      ...AD_CONFIG,
      ...DEV_CONFIG,
      testMode: true,
    };
  }
  
  return {
    ...AD_CONFIG,
    testMode: false,
  };
};

// Función para obtener IDs de anuncios según plataforma
export const getAdIds = (platform) => {
  const config = getAdConfig();
  
  if (config.testMode) {
    return TEST_CONFIG.testAdIds[platform] || TEST_CONFIG.testAdIds.android;
  }
  
  return config.platform[platform]?.adMob || config.platform.android.adMob;
};

export default AD_CONFIG;
