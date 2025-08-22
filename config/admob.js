// Configuración de AdMob para GTA VI Countdown
export const ADMOB_CONFIG = {
  // IDs de test de Google para desarrollo
  testIds: {
    android: {
      appId: 'ca-app-pub-3940256099942544~3347511713',
      banner: 'ca-app-pub-3940256099942544/6300978111',
      interstitial: 'ca-app-pub-3940256099942544/1033173712',
      rewarded: 'ca-app-pub-3940256099942544/5224354917',
    },
    ios: {
      appId: 'ca-app-pub-3940256099942544~1458002511',
      banner: 'ca-app-pub-3940256099942544/2934735716',
      interstitial: 'ca-app-pub-3940256099942544/4411468910',
      rewarded: 'ca-app-pub-3940256099942544/1712485313',
    },
  },
  
  // IDs de producción (reemplazar con los tuyos)
  productionIds: {
    android: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // Reemplazar
      banner: 'ca-app-pub-3940256099942544/6300978111', // Reemplazar
      interstitial: 'ca-app-pub-3940256099942544/1033173712', // Reemplazar
      rewarded: 'ca-app-pub-3940256099942544/5224354917', // Reemplazar
    },
    ios: {
      appId: 'ca-app-pub-3940256099942544~1458002511', // Reemplazar
      banner: 'ca-app-pub-3940256099942544/2934735716', // Reemplazar
      interstitial: 'ca-app-pub-3940256099942544/4411468910', // Reemplazar
      rewarded: 'ca-app-pub-3940256099942544/1712485313', // Reemplazar
    },
  },
};

// Función para obtener la configuración según el entorno
export const getAdMobConfig = () => {
  const isDevelopment = __DEV__;
  // console.log('🔧 getAdMobConfig - Entorno de desarrollo:', isDevelopment);
  
  if (isDevelopment) {
    return {
      ...ADMOB_CONFIG,
      isTestMode: true,
      ids: ADMOB_CONFIG.testIds,
    };
  }
  
  return {
    ...ADMOB_CONFIG,
    isTestMode: false,
    ids: ADMOB_CONFIG.productionIds,
  };
};

// Función para obtener IDs según plataforma
export const getAdIds = (platform = 'android') => {
  const config = getAdMobConfig();
  const ids = config.ids[platform] || config.ids.android;
  
  // console.log('🔧 getAdIds - Plataforma:', platform);
  // console.log('🔧 getAdIds - Configuración:', config);
  // console.log('🔧 getAdIds - IDs obtenidos:', ids);
  
  return ids;
};

export default ADMOB_CONFIG;
