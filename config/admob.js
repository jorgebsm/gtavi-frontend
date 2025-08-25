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
    // iOS se configurará cuando tengas los IDs reales
  },
  
  // IDs de producción (REEMPLAZAR CON LOS TUYOS REALES)
  productionIds: {
    android: {
      appId: 'ca-app-pub-8096470331985565~8673949283', // Ejemplo: ca-app-pub-1234567890123456~1234567890
      banner: 'ca-app-pub-8096470331985565/2287971502', // Ejemplo: ca-app-pub-1234567890123456/1234567890
      interstitial: 'ca-app-pub-8096470331985565/8490417776', // Ejemplo: ca-app-pub-1234567890123456/1234567890
      rewarded: 'ca-app-pub-8096470331985565/5828595415', // Ejemplo: ca-app-pub-1234567890123456/1234567890
    },
    // ios: {
    //   appId: 'TU_IOS_APP_ID_AQUI', // Ejemplo: ca-app-pub-1234567890123456~0987654321
    //   banner: 'TU_IOS_BANNER_ID_AQUI', // Ejemplo: ca-app-pub-1234567890123456/0987654321
    //   interstitial: 'TU_IOS_INTERSTITIAL_ID_AQUI', // Ejemplo: ca-app-pub-1234567890123456/0987654321
    //   rewarded: 'TU_IOS_REWARDED_ID_AQUI', // Ejemplo: ca-app-pub-1234567890123456/0987654321
    // },
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
