import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../contexts/AdContext';
import { useLocalization } from '../hooks/useLocalization';

const AdDownloadButton = ({ 
  wallpaper, 
  onDownload, 
  isDownloading, 
  style, 
  textStyle,
  adsEnabled = true
}) => {
  const { isRewardedAdLoaded, isLibraryLoaded, showRewardedAd } = useAds();
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const { translations } = useLocalization();

  // Lógica simple: intentar ads primero, si fallan -> descarga directa
  const handleDownload = async () => {
    try {
      // Si los ads están deshabilitados, ir directo a descarga
      if (!adsEnabled) {
        await onDownload(wallpaper);
        return;
      }

      // Si la librería no está lista, ir directo a descarga
      if (!isLibraryLoaded) {
        // console.log('⚠️ Librería de ads no disponible, descarga directa');
        await onDownload(wallpaper);
        return;
      }

      // Si no hay ads cargados, ir directo a descarga
      if (!isRewardedAdLoaded) {
        // console.log('⚠️ Ads no disponibles, descarga directa');
        await onDownload(wallpaper);
        return;
      }

      // Intentar mostrar el ad
      setIsShowingAd(true);
      setAdFailed(false);
      
      const adSuccess = await showRewardedAd(wallpaper, onDownload);
      
      if (adSuccess) {
        // console.log('✅ Ad mostrado exitosamente');
        // El ad se mostró, la descarga se maneja automáticamente
      } else {
        // console.log('❌ Ad falló, activando fallback');
        setAdFailed(true);
        // Fallback: descarga directa
        await onDownload(wallpaper);
      }

    } catch (error) {
      console.error('❌ Error en ads, activando fallback:', error);
      setAdFailed(true);
      // Fallback: descarga directa
      await onDownload(wallpaper);
    } finally {
      setIsShowingAd(false);
    }
  };

  // Estado del botón basado en la situación
  const getButtonState = () => {
    if (isDownloading || isShowingAd) {
      return {
        icon: 'hourglass',
        text: isShowingAd ? (translations.viewingAd || 'Viendo anuncio...') : (translations.downloading || 'Descargando...'),
        disabled: true,
        backgroundColor: '#666',
        showFallback: false
      };
    }

    // Si los ads fallaron o no están disponibles, mostrar estado de fallback
    if (adFailed || !adsEnabled || !isLibraryLoaded || !isRewardedAdLoaded) {
      return {
        icon: 'download',
        text: translations.downloadDirect || 'Descargar',
        disabled: false,
        backgroundColor: '#28a745', // Verde para indicar descarga directa
        showFallback: true
      };
    }

    // Estado normal con ads disponibles
    return {
      icon: 'download',
      text: translations.download || 'Descargar',
      disabled: false,
      backgroundColor: '#ff6b35', // Naranja para ads
      showFallback: false
    };
  };

  const buttonState = getButtonState();

  return (
    <TouchableOpacity
      style={[
        styles.downloadButton,
        { backgroundColor: buttonState.backgroundColor },
        buttonState.disabled && styles.downloadButtonDisabled,
        style
      ]}
      onPress={handleDownload}
      activeOpacity={0.8}
      disabled={buttonState.disabled}
    >
      {isShowingAd ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons 
          name={buttonState.icon} 
          size={20} 
          color="#fff" 
          style={styles.buttonIcon}
        />
      )}
      
      <Text style={[styles.buttonText, textStyle]}>
        {buttonState.text}
      </Text>
      
      {/* Mostrar mensaje de fallback si es necesario */}
      {buttonState.showFallback && (
        <Text style={styles.fallbackMessage}>
          {translations.fallbackMessage || 'Descarga directa'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
    padding: 5,
  },
  fallbackMessage: {
    position: 'absolute',
    bottom: -20,
    right: 0,
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default AdDownloadButton;
