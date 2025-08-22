# 🚀 Configuración de Google AdMob

## 📋 Requisitos Previos

1. **Cuenta de Google AdMob**: [admob.google.com](https://admob.google.com)
2. **Aplicación registrada** en Google Play Console o App Store
3. **Librería instalada**: `react-native-google-mobile-ads`

## 🔧 Instalación

```bash
npm install react-native-google-mobile-ads
```

## ⚙️ Configuración

### 1. **Configurar IDs de Anuncios**

Edita `frontend/config/admob.js` y reemplaza los IDs de prueba con los tuyos:

```javascript
production: {
  rewarded: 'ca-app-pub-XXXXXXXXXX/YYYYYYYYYY', // Tu ID real
  banner: 'ca-app-pub-XXXXXXXXXX/ZZZZZZZZZZ',
  interstitial: 'ca-app-pub-XXXXXXXXXX/WWWWWWWWWW',
},
```

### 2. **Configurar Android**

En `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- Configuración de AdMob -->
  <meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXX~YYYYYYYYYY"/>
</application>
```

### 3. **Configurar iOS**

En `ios/YourApp/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXX~YYYYYYYYYY</string>

<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

## 🎯 Funcionalidad Implementada

### **Anuncios Recompensados**
- ✅ **Trigger**: Al presionar "Descargar" en cualquier wallpaper
- ✅ **Recompensa**: Descarga gratuita del wallpaper
- ✅ **Duración mínima**: 15 segundos de visualización
- ✅ **Fallback**: Si falla AdMob, se permite descarga directa

### **Estados del Botón**
- 🔄 **Cargando**: "Cargando anuncio..."
- 📺 **Listo**: "Descargar"
- ⏳ **Reproduciendo**: "Viendo anuncio..."
- ⬇️ **Descargando**: "Descargando..."

## 🧪 Modo de Prueba

En desarrollo, se usan automáticamente los **IDs de prueba oficiales** de Google:

```javascript
// IDs de prueba (automático en __DEV__)
test: {
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
}
```

## 📱 Flujo de Usuario

1. **Usuario presiona "Descargar"**
2. **Se muestra anuncio recompensado**
3. **Usuario debe ver anuncio completo (15s mínimo)**
4. **Al completar, se inicia descarga automáticamente**
5. **Si no completa, se muestra mensaje de error**

## 🚨 Solución de Problemas

### **Anuncio no se carga**
```bash
# Verificar logs
console.log('AdMob Status:', admobService.getStatus());
```

### **Error de permisos**
- Verificar configuración en Google AdMob
- Comprobar IDs de aplicación
- Verificar políticas de contenido

### **Anuncio no se muestra**
- Verificar conexión a internet
- Comprobar que el anuncio esté cargado
- Verificar configuración de dispositivo

## 📊 Monitoreo

### **Logs de Consola**
```javascript
// Estado de AdMob
✅ AdMob inicializado correctamente
✅ Anuncio recompensado cargado
🎁 Usuario ganó recompensa
🔒 Anuncio recompensado cerrado
```

### **Métricas Recomendadas**
- Tasa de visualización de anuncios
- Tasa de finalización de anuncios
- Ingresos por anuncio
- Tasa de conversión (anuncio → descarga)

## 🔒 Privacidad y Cumplimiento

- ✅ **GDPR**: `requestNonPersonalizedAdsOnly: true`
- ✅ **COPPA**: Configuración para audiencia general
- ✅ **Transparencia**: Usuario sabe que debe ver anuncio
- ✅ **Consentimiento**: Anuncio solo se muestra tras acción del usuario

## 📚 Recursos Adicionales

- [Documentación oficial de AdMob](https://developers.google.com/admob)
- [Políticas de AdMob](https://support.google.com/admob/answer/6128543)
- [Guía de implementación](https://developers.google.com/admob/react-native/quick-start)

## 🎉 ¡Listo!

Con esta implementación, cada descarga de wallpaper requerirá que el usuario vea un anuncio recompensado, generando ingresos para tu aplicación mientras mantienes la funcionalidad gratuita para los usuarios.
