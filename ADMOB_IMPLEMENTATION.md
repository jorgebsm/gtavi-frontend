# Implementación de Google AdMob en GTA VI Countdown

## Resumen
Esta implementación de Google AdMob está basada en la implementación exitosa del proyecto "chilenizador" y utiliza `react-native-google-mobile-ads` versión 15.5.0.

## Configuración

### 1. app.json
La configuración del plugin está en `app.json`:
```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-3940256099942544~3347511713"
  }
]
```

### 2. Archivos de Configuración
- `config/admob.js` - Configuración centralizada de IDs de anuncios
- `config/adConfig.js` - Configuración de comportamiento de anuncios

## Hooks Disponibles

### useInterstitialAd
```javascript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const { isAdLoaded, showAd, loadAd } = useInterstitialAd();
```

### useRewardedAd
```javascript
import { useRewardedAd } from '../hooks/useRewardedAd';

const { isAdLoaded, isAdShowing, showAd, loadAd } = useRewardedAd();
```

## Componentes Disponibles

### AdBanner
```javascript
import AdBanner from '../components/AdBanner';

<AdBanner />
```

### AdDownloadButton
```javascript
import AdDownloadButton from '../components/AdDownloadButton';

<AdDownloadButton
  wallpaper={wallpaperData}
  onDownload={handleDownload}
  isDownloading={isDownloading}
/>
```

## Servicios

### adService
El servicio principal que maneja anuncios intersticiales entre pantallas:
```javascript
import adService from '../services/adService';

// Inicializar
await adService.initialize();

// Mostrar anuncio en transición
const shouldShow = await adService.handleScreenTransition(fromScreen, toScreen);
```

## IDs de Test vs Producción

### Desarrollo (__DEV__ = true)
- Usa IDs de test oficiales de Google
- No genera ingresos reales
- Perfecto para desarrollo y testing

### Producción (__DEV__ = false)
- Usa IDs de producción configurados en `config/admob.js`
- Genera ingresos reales
- Requiere configuración de IDs reales

## Configuración de IDs de Producción

Para usar en producción, reemplaza los IDs en `config/admob.js`:

```javascript
productionIds: {
  android: {
    appId: 'ca-app-pub-TU_APP_ID_AQUI~TU_SUFFIX',
    banner: 'ca-app-pub-TU_APP_ID/TU_BANNER_ID',
    interstitial: 'ca-app-pub-TU_APP_ID/TU_INTERSTITIAL_ID',
    rewarded: 'ca-app-pub-TU_APP_ID/TU_REWARDED_ID',
  },
  // ... iOS
}
```

## Características

- ✅ Anuncios intersticiales entre pantallas
- ✅ Anuncios recompensados para descargas
- ✅ Banners adaptativos
- ✅ Manejo automático de carga/recarga
- ✅ Manejo de errores robusto
- ✅ Configuración centralizada
- ✅ IDs de test automáticos en desarrollo
- ✅ Soporte para Android e iOS

## Solución de Problemas

### La app se cierra al abrir
1. Verificar que `newArchEnabled` esté en `true` en app.json
2. Limpiar build: `npx expo prebuild --clean`
3. Reconstruir: `npx expo run:android`

### Anuncios no se muestran
1. Verificar conexión a internet
2. Verificar IDs de anuncios
3. Verificar configuración del plugin en app.json

### Errores de compilación
1. Verificar versión de `react-native-google-mobile-ads`
2. Limpiar cache: `npx expo start --clear`
3. Reinstalar dependencias: `npm install`

## Notas Importantes

- Los anuncios se cargan automáticamente al inicializar
- Los anuncios intersticiales se recargan automáticamente después de mostrarse
- Los anuncios recompensados requieren verificación de completado
- En desarrollo, siempre usa IDs de test para evitar violaciones de políticas
