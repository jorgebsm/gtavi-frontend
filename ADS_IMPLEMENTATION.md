# 🚀 Implementación de Anuncios - GTA VI Countdown

## 📋 Resumen

Este documento describe la implementación completa del sistema de anuncios intersticiales para la app GTA VI Countdown, siguiendo el patrón de navegación estilo TikTok.

## 🎯 Características Principales

### ✅ **Anuncios Intersticiales Inteligentes**
- **Transición Leaks → More**: **100% probabilidad** (SIEMPRE)
- **Otras transiciones**: 20% probabilidad (configurable)
- **Tiempo mínimo entre anuncios**: 3 minutos
- **Máximo por sesión**: 5 anuncios

### ✅ **Sistema de Probabilidades**
- **Home → Trailers**: 20%
- **Trailers → News**: 20%
- **News → Leaks**: 20%
- **Leaks → More**: **100%** ⭐

### ✅ **Gestión Inteligente**
- Prevención de spam de anuncios
- Carga automática en background
- Fallback y manejo de errores
- Estadísticas detalladas

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TikTokNavigator │───▶│   AdService      │───▶│   AdConfig      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ useAds Hook     │    │ InterstitialAd   │    │ Platform Config │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Estructura de Archivos

```
frontend/
├── services/
│   └── adService.js          # Servicio principal de anuncios
├── components/
│   └── InterstitialAdScreen.js # Pantalla de anuncio intersticial
├── config/
│   └── adConfig.js           # Configuración de anuncios
├── hooks/
│   └── useAds.js             # Hook personalizado para anuncios
└── components/
    └── TikTokNavigator.js    # Navegador principal (modificado)
```

## 🚀 Implementación Paso a Paso

### 1. **Instalación de Dependencias**

```bash
# Para Google AdMob
expo install expo-ads-admob

# Para gradientes (ya incluido)
expo install expo-linear-gradient
```

### 2. **Configuración de AdMob**

#### **Android (app.json)**
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
      }
    }
  }
}
```

#### **iOS (app.json)**
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
      }
    }
  }
}
```

### 3. **Configuración de IDs de Anuncios**

Edita `frontend/config/adConfig.js`:

```javascript
android: {
  adMob: {
    appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy', // Tu App ID
    interstitialId: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz', // Tu Interstitial ID
  }
}
```

### 4. **Integración en el Navegador**

El `TikTokNavigator` ya está modificado para:
- Detectar transiciones entre pantallas
- Mostrar anuncios según la configuración
- Manejar estados de carga y finalización

## ⚙️ Configuración Avanzada

### **Modificar Probabilidades**

```javascript
// En adConfig.js
screenTransitions: {
  'Leaks-More': {
    probability: 1.0,        // 100% - SIEMPRE
    minTimeBetween: 2,       // 2 minutos mínimo
    priority: 'high',
    forceShow: true,         // Forzar mostrar
  },
  'Home-Trailers': {
    probability: 0.3,        // 30% en lugar de 20%
    minTimeBetween: 3,
    priority: 'low',
  }
}
```

### **Configurar Tiempos**

```javascript
general: {
  minTimeBetweenAds: 5,     // 5 minutos entre anuncios
  maxAdsPerSession: 8,      // 8 anuncios máximo por sesión
  adDuration: 7,            // 7 segundos de duración
}
```

### **Eventos Especiales**

```javascript
specialEvents: {
  launchDate: {
    enabled: true,
    multiplier: 2.0,        // Doble de anuncios
    startDate: '2024-11-01', // 2 meses antes
    endDate: '2024-12-31',
  }
}
```

## 📊 Monitoreo y Analytics

### **Estadísticas Disponibles**

```javascript
const { adStats } = useAds();

console.log(adStats);
// {
//   totalShown: 15,
//   totalSkipped: 3,
//   totalCompleted: 12,
//   lastAdTime: 1703123456789,
//   remainingAds: 2
// }
```

### **Logs en Consola**

```
🚀 Servicio de anuncios inicializado correctamente
📱 Inicializando anuncios para Android
🎯 Mostrando anuncio para transición: Leaks-More (100% probabilidad)
📥 Cargando anuncio intersticial...
✅ Anuncio intersticial cargado
🎬 Mostrando anuncio intersticial...
📊 Anuncio mostrado. Total en esta sesión: 1
```

## 🔧 Personalización

### **Modificar Diseño del Anuncio**

Edita `InterstitialAdScreen.js`:
- Colores y estilos
- Duración del anuncio
- Animaciones
- Textos y branding

### **Añadir Nuevas Transiciones**

```javascript
// En adService.js
screenTransitionAds: {
  'Home-More': 0.5,         // 50% probabilidad
  'News-More': 0.8,         // 80% probabilidad
}
```

### **Integrar Otras Redes de Anuncios**

```javascript
// Facebook Audience Network
facebook: {
  enabled: true,
  placementId: 'YOUR_FACEBOOK_PLACEMENT_ID',
}

// AppLovin MAX
appLovin: {
  enabled: true,
  sdkKey: 'YOUR_APPLOVIN_SDK_KEY',
}
```

## 🧪 Testing

### **Modo Desarrollo**

```javascript
// Automático en __DEV__
testMode: true,
mockAds: true,
mockDelay: 2000,
```

### **IDs de Test de Google**

```javascript
// Android
testInterstitialId: 'ca-app-pub-3940256099942544/1033173712'

// iOS  
testInterstitialId: 'ca-app-pub-3940256099942544/4411468910'
```

## 📱 Plataformas Soportadas

- ✅ **Android**: Google AdMob nativo
- ✅ **iOS**: Google AdMob nativo
- 🔄 **Web**: Preparado para futura implementación
- 🔄 **Expo Go**: Limitado (requiere EAS Build)

## 🚨 Consideraciones Importantes

### **Políticas de Google Play Store**
- No mostrar anuncios en pantallas de carga
- Respetar límites de frecuencia
- Proporcionar opción de saltar después de 5 segundos

### **Políticas de App Store**
- Cumplir con App Tracking Transparency (ATT)
- Respetar límites de frecuencia de anuncios
- No interrumpir experiencia del usuario

### **Experiencia del Usuario**
- Anuncios no intrusivos
- Tiempo mínimo entre anuncios
- Opción de saltar disponible
- Carga en background para fluidez

## 🔮 Futuras Mejoras

### **Próximas Funcionalidades**
- [ ] Anuncios banner en pantallas
- [ ] Anuncios nativos personalizados
- [ ] A/B testing de configuraciones
- [ ] Analytics avanzados
- [ ] Medición de engagement

### **Optimizaciones**
- [ ] Precarga inteligente de anuncios
- [ ] Algoritmo de frecuencia adaptativo
- [ ] Machine learning para timing óptimo
- [ ] Cache de anuncios offline

## 📞 Soporte

### **Problemas Comunes**

1. **Anuncios no se muestran**
   - Verificar IDs de AdMob
   - Comprobar conexión a internet
   - Revisar logs de consola

2. **Errores de inicialización**
   - Verificar configuración de app.json
   - Comprobar permisos de red
   - Revisar versión de Expo

3. **Anuncios se muestran muy frecuentemente**
   - Ajustar `minTimeBetweenAds`
   - Reducir probabilidades
   - Verificar lógica de `maxAdsPerSession`

### **Recursos Útiles**

- [Documentación de Expo AdMob](https://docs.expo.dev/versions/latest/sdk/admob/)
- [Google AdMob Console](https://admob.google.com/)
- [Políticas de Google Play](https://play.google.com/about/developer-content-policy/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 🎉 ¡Implementación Completada!

Tu app GTA VI Countdown ahora incluye un sistema completo de anuncios intersticiales que:

- ✅ Respeta la experiencia del usuario
- ✅ Maximiza ingresos en transiciones clave
- ✅ Es fácil de configurar y mantener
- ✅ Cumple con políticas de las tiendas
- ✅ Proporciona analytics detallados

¡Los anuncios se mostrarán automáticamente en la transición a "MoreScreen" y ocasionalmente en otras transiciones!
