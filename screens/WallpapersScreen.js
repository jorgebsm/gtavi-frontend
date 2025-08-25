import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, Share, Alert, ActivityIndicator } from 'react-native';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useLocalization } from '../hooks/useLocalization';
import { useDownload } from '../hooks/useDownload';
import DownloadProgress from '../components/DownloadProgress';
import SuccessAnimation from '../components/SuccessAnimation';
import AdDownloadButton from '../components/AdDownloadButton';
import { imagesService } from '../services/api';
import { t } from '../utils/i18n';
// import admobService from '../services/admobService';

const { width: screenWidth } = Dimensions.get('window');

// Componente de imagen mejorado que maneja el estado de carga
const WallpaperImage = ({ source, style, defaultSource }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { translations } = useLocalization();

  // useEffect(() => {
  //   // Timeout para evitar que la imagen se quede cargando indefinidamente
  //   const timeoutId = setTimeout(() => {
  //     if (isLoading) {
  //       console.log('⏰ Timeout de carga de imagen alcanzado, usando fallback');
  //       setIsLoading(false);
  //       setHasError(true);
  //     }
  //   }, 10000); // 10 segundos de timeout

  //   return () => clearTimeout(timeoutId);
  // }, [isLoading]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    // console.log('❌ Error cargando imagen, usando fallback');
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
      <Image 
        source={source}
        style={[style, { position: 'absolute' }]}
        resizeMode="cover"
        defaultSource={defaultSource}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        // Propiedades adicionales para mejorar la carga
        fadeDuration={300}
        progressiveRenderingEnabled={true}
      />
      
      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.imageLoadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.imageLoadingText}>{translations.loadingImage || 'Cargando imagen...'}</Text>
        </View>
      )}
      
      {/* Imagen de fallback en caso de error */}
      {hasError && (
        <Image 
          source={defaultSource}
          style={style}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default function WallpapersScreen() {
  // Hook de localización
  const { translations, isRTL } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();
  const { downloadWallpaper, isDownloading, downloadProgress, showSuccessAnimation } = useDownload();
  
  const { height: screenHeight } = Dimensions.get('window');
  const isSmall = screenHeight < 730;
  const CARD_HEIGHT = Math.round(screenHeight * (isSmall ? 0.65 : 0.70));
  const IMAGE_HEIGHT = isSmall ? Math.round(screenHeight * 0.36) : 410;

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Estado para los datos dinámicos de wallpapers
  const [wallpapersData, setWallpapersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de wallpapers desde la API
  useEffect(() => {
    loadWallpapers();
  }, []);

  const loadWallpapers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiResponse = await imagesService.getAll();
      
      const transformedData = imagesService.transformApiDataToWallpapers(apiResponse);
      
      if (transformedData.length > 0) {
        setWallpapersData(transformedData);
      } else {
        console.warn('⚠️ No se obtuvieron wallpapers de la API, usando fallback');
        // setWallpapersData([
        //   {
        //     id: '1',
        //     title: 'GTA VI Wallpaper 1',
        //     image: require('../assets/backgrounds/1.jpg'),
        //     imageUrl: 'https://images.unsplash.com/1.jpg',
        //     resolution: '1920x1080',
        //     author: 'Rockstar Games'
        //   }
        // ]);
      }
    } catch (error) {
      console.error('❌ Error cargando wallpapers:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // setError(`Error al cargar los wallpapers: ${error.message}`);
      
      // Fallback a datos estáticos en caso de error
      // setWallpapersData([
      //   {
      //     id: '1',
      //     title: 'GTA VI Wallpaper 1',
      //     image: require('../assets/backgrounds/1.jpg'),
      //     imageUrl: 'https://images.unsplash.com/1.jpg',
      //     resolution: '1920x1080',
      //     author: 'Rockstar Games'
      //   }
      // ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWallpaperPress = async (wallpaper) => {
    try {
      // Mostrar opciones: descargar o compartir
      Alert.alert(
        wallpaper.title,
        '¿Qué te gustaría hacer con este wallpaper?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Compartir',
            onPress: async () => {
              try {
                await Share.share({
                  message: `${translations.wallpaperShareMessage || 'Compartir wallpaper'}: ${wallpaper.title}`,
                  title: wallpaper.title
                });
              } catch (error) {
                console.error('Error sharing wallpaper:', error);
              }
            },
          },
          {
            text: 'Descargar',
            onPress: async () => {
              await handleDownload(wallpaper);
            },
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error handling wallpaper press:', error);
    }
  };

  const handleDownload = async (wallpaper) => {
    try {
      const result = await downloadWallpaper(wallpaper);
      
      if (result.success) {
        // Incrementar contador de descargas en la API
        try {
          if (wallpaper.id && wallpaper.id !== '1') { // No incrementar para el fallback
            await imagesService.incrementDownloadCount(wallpaper.id);
          }
        } catch (apiError) {
          console.error('Error incrementando contador de descargas:', apiError);
        }
        
        
      } else {
        Alert.alert(
          'Error en la descarga',
          result.message || 'No se pudo descargar el wallpaper. Inténtalo de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error en handleDownload:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error inesperado al descargar el wallpaper.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderWallpaper = ({ item }) => {
    return (
      <View style={styles.wallpaperContainer}>
        <TouchableOpacity 
          style={[styles.wallpaperCard, { height: CARD_HEIGHT }]}
          // onPress={() => handleWallpaperPress(item)}
          activeOpacity={0.8}
        >
          {/* Imagen del wallpaper */}
          <View style={styles.imageContainer}>
            <WallpaperImage
              source={item.imageUrl ? { uri: item.imageUrl } : item.image} 
              style={[styles.wallpaperImage, { height: CARD_HEIGHT }]}
              // defaultSource={require('../assets/backgrounds/1.jpg')}
            />
            <View style={styles.downloadOverlay}>
              <Ionicons name="download-outline" size={32} color="#ff6b35" />
              <Text style={styles.downloadText}>{translations.download}</Text>
            </View>
            <View style={styles.resolutionBadge}>
              <Text style={styles.resolutionText}>{item.resolution}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {t('autoria')}: <Text style={styles.authorBold}>{item.author}</Text>
              </Text>
            </View>
            
            {/* Botón de descarga con anuncio recompensado */}
            <AdDownloadButton
              wallpaper={item}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Mostrar loading mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // Mostrar indicador de scroll
  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <StatusBar style="light" />
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#00ff00" />
  //         <Text style={styles.loadingText}>Cargando wallpapers...</Text>
  //       </View>
  //     </View>
  //   );
  // }

  // Mostrar error si no se pudieron cargar los datos
  if (error && wallpapersData.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWallpapers}>
            <Text style={styles.retryButtonText}>{translations.retryButton || 'Reintentar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
             {/* Componente de progreso de descarga */}
       <DownloadProgress 
         progress={downloadProgress} 
         isVisible={isDownloading} 
       />
       
       {/* Componente de animación de éxito */}
       <SuccessAnimation isVisible={showSuccessAnimation} />
      

      {/* Gradiente de fondo */}
      <View style={styles.backgroundGradient} />
      {/* Imagen de fondo */}
      {getBackgroundFor('Wallpapers') && (
        <Image
          source={getBackgroundFor('Wallpapers')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      {/* Contenido principal */}
      <View style={[styles.content, isSmall && styles.contentSmall]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{t('fondos')}</Text>
        </View>

        {/* Indicador de scroll */}
        <View style={[styles.scrollIndicator, isRTL && styles.rtlContainer]}>
          <Text style={[styles.scrollText, isRTL && styles.rtlText]}>{t('swipeForMore')}</Text>
          <Ionicons 
            name={isRTL ? "chevron-back" : "chevron-forward"} 
            size={20} 
            color="#ff6b35" 
          />
        </View>

        {/* Lista de wallpapers con paginación */}
        <View style={styles.wallpapersWrapper}>
          <FlatList
            data={wallpapersData}
            renderItem={renderWallpaper}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 40}
            snapToAlignment="center"
            decelerationRate="fast"
            removeClippedSubviews={false}
            getItemLayout={(data, index) => ({
              length: screenWidth - 40,
              offset: (screenWidth - 40) * index,
              index,
            })}
            contentContainerStyle={styles.wallpapersContent}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.25,
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  contentSmall: {
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff6b35',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#ff6b35',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    letterSpacing: 2,
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  scrollText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#fff',
    marginHorizontal: 10,
  },
  wallpapersWrapper: {
    // flex: 1,
  },
  wallpapersContent: {
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },
  wallpaperCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    width: screenWidth - 40,
    // height dinámico por dispositivo en runtime (ver CARD_HEIGHT)
    alignSelf: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  wallpaperImage: {
    width: '100%',
    backgroundColor: '#1a1a1a',
  },
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    opacity: 0,
  },
  downloadText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ff6b35',
    marginTop: 8,
  },
  resolutionBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resolutionText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
     categoryText: {
     fontSize: 12,
     fontFamily: 'Poppins_400Regular',
     color: '#fff',
   },
   authorBold: {
     fontFamily: 'Poppins_700Bold',
     fontWeight: 'bold',
   },
  wallpaperInfo: {
    padding: 20,
  },
  wallpaperTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    marginBottom: 5,
  },
  wallpaperCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ff6b35',
    marginBottom: 8,
  },
  wallpaperResolution: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ccc',
    marginBottom: 8,
  },
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },

  wallpaperContainer: {
    width: screenWidth - 40,
    alignSelf: 'center',
    marginTop: 0,
    marginHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#ff6b35',
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
    // height: 60,
    // width: 150,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
    padding: 8
  },
  downloadButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  imageLoadingText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginTop: 10,
  },
  adStatusContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  adStatusText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
  },
});
