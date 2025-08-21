import { useState } from 'react';
import { Alert } from 'react-native';
import downloadService from '../services/downloadService';

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const downloadWallpaper = async (wallpaper) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Mostrar indicador de descarga
      // Alert.alert(
      //   'Descargando...',
      //   'Guardando wallpaper en la galería...',
      //   [],
      //   { cancelable: false }
      // );

      // Simular progreso
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Descargar la imagen
      let result;
      if (wallpaper.imageUrl) {
        // Si hay URL disponible, usar descarga desde URL
        result = await downloadService.downloadImage(
          wallpaper.imageUrl,
          wallpaper.title
        );
      } else {
        // Si no hay URL, usar asset local
        result = await downloadService.downloadFromAssets(
          wallpaper.image,
          wallpaper.title
        );
      }

      // Completar progreso
      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Mostrar animación de éxito en lugar de alerta
      if (result.success) {
        setShowSuccessAnimation(true);
        // Ocultar la animación después de 3 segundos
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 2000);
      } else {
        Alert.alert('Error', result.message, [{ text: 'OK' }]);
      }

      return result;
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
      Alert.alert(
        'Error',
        'No se pudo descargar el wallpaper. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
      return { success: false, message: 'Error al descargar' };
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const downloadFromUrl = async (imageUrl, fileName) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Mostrar indicador de descarga
      Alert.alert(
        'Descargando...',
        'Guardando imagen en la galería...',
        [],
        { cancelable: false }
      );

      // Simular progreso
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Descargar la imagen desde URL
      const result = await downloadService.downloadImage(imageUrl, fileName);

      // Completar progreso
      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Mostrar animación de éxito en lugar de alerta
      if (result.success) {
        setShowSuccessAnimation(true);
        // Ocultar la animación después de 3 segundos
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 3000);
      } else {
        Alert.alert('Error', result.message, [{ text: 'OK' }]);
      }

      return result;
    } catch (error) {
      console.error('Error downloading image from URL:', error);
      Alert.alert(
        'Error',
        'No se pudo descargar la imagen. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
      return { success: false, message: 'Error al descargar' };
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return {
    downloadWallpaper,
    downloadFromUrl,
    isDownloading,
    downloadProgress,
    showSuccessAnimation
  };
};
