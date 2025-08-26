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
  adsEnabled = true // Nuevo parámetro para habilitar/deshabilitar anuncios
}) => {
  const { isRewardedAdLoaded, isLibraryLoaded, showRewardedAd } = useAds();
  const [isShowingAd, setIsShowingAd] = useState(false);
  const { translations } = useLocalization();

  // Debug: verificar el valor recibido
  const handleAdDownload = async () => {
    try {
      // Si los anuncios están deshabilitados, proceder directamente con la descarga
      if (!adsEnabled) {
        await onDownload(wallpaper);
        return;
      }

      if (!isLibraryLoaded) {
        Alert.alert(
          translations.adSystemNotAvailable || 'Sistema de anuncios no disponible',
          translations.adSystemInitializing || 'El sistema de anuncios aún se está inicializando. Por favor, espera un momento.',
          [{ text: translations.ok || 'OK' }]
        );
        return;
      }

      if (!isRewardedAdLoaded) {
        Alert.alert(
          translations.adNotAvailable || 'Anuncio no disponible',
          translations.adStillLoading || 'El anuncio aún se está cargando. Por favor, espera un momento e inténtalo de nuevo.',
          [{ text: translations.ok || 'OK' }]
        );
        return;
      }

      setIsShowingAd(true);

      // Mostrar anuncio recompensado
      // console.log('🎬 Llamando a showRewardedAd con:', {
      //   wallpaper: wallpaper?.id,
      //   onDownload: typeof onDownload
      // });
      
      const success = showRewardedAd(wallpaper, onDownload);
      
      if (success) {
        // Usuario completó el anuncio, ahora proceder con la descarga
        // console.log('🎁 Usuario completó el anuncio, procediendo con descarga...');
        
        // El anuncio se está mostrando, esperar a que se complete
        // Los permisos se solicitarán automáticamente en downloadService cuando se llame a onDownload
        // No necesitamos hacer nada aquí, solo esperar a que el anuncio termine
      } else {
        Alert.alert(
          translations.adNotAvailable || 'Anuncio no disponible',
          translations.adShowError || 'No se pudo mostrar el anuncio. Inténtalo de nuevo más tarde.',
          [{ text: translations.ok || 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error con anuncio recompensado:', error);
      Alert.alert(
        translations.error || 'Error',
        translations.adUnexpectedError || 'Ocurrió un error al mostrar el anuncio. Inténtalo de nuevo.',
        [{ text: translations.ok || 'OK' }]
      );
    } finally {
      setIsShowingAd(false);
    }
  };

  // Determinar el estado del botón
  const getButtonState = () => {
    if (isDownloading || isShowingAd) {
      return {
        icon: 'hourglass',
        text: isShowingAd ? translations.viewingAd : translations.downloading,
        disabled: true,
        backgroundColor: '#666',
      };
    }

    if (!isLibraryLoaded) {
      return {
        icon: 'hourglass',
        text: translations.initializing,
        disabled: true,
        backgroundColor: '#999',
      };
    }

    if (!isRewardedAdLoaded) {
      return {
        icon: 'download',
        text: translations.loading,
        disabled: true,
        backgroundColor: '#999',
      };
    }

    return {
      icon: 'download',
      text: translations.download,
      disabled: false,
      backgroundColor: '#ff6b35',
    };
  };

  const buttonState = getButtonState();

  // Si hay algún problema, mostrar información adicional
  // if (!isLibraryLoaded) {
  //   console.log('⚠️ AdDownloadButton - Librería no cargada');
  // }
  
  // if (!isRewardedAdLoaded && isLibraryLoaded) {
  //   console.log('⚠️ AdDownloadButton - Anuncio recompensado no cargado');
  // }

  return (
    <TouchableOpacity
      style={[
        styles.downloadButton,
        { backgroundColor: buttonState.backgroundColor },
        buttonState.disabled && styles.downloadButtonDisabled,
        style
      ]}
      onPress={handleAdDownload}
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
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
    padding: 5,
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
});

export default AdDownloadButton;
