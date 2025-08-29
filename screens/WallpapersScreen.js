import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, Share, Alert, ActivityIndicator, Animated, Easing } from 'react-native';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useLocalization } from '../hooks/useLocalization';
import { useDownload } from '../hooks/useDownload';
import { useConfig } from '../hooks/useConfig';
import DownloadProgress from '../components/DownloadProgress';
import SuccessAnimation from '../components/SuccessAnimation';
import AdDownloadButton from '../components/AdDownloadButton';
import { imagesService } from '../services/api';
import { t } from '../utils/i18n';

// ------- Constantes de layout -------
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Indicadores (ventana de 5 puntos)
const VISIBLE_DOTS = 5;
const DOT_GAP = 14;                 // margen horizontal entre puntos (4 a cada lado, total 8)
const DOT_INACTIVE = 8;            // diámetro punto inactivo
const DOT_ACTIVE = 12;             // diámetro punto activo
const STEP = DOT_ACTIVE + DOT_GAP; // paso constante de la "pista" (track)
const ANIM_MS = 220;               // duración animación desplazamiento

// ---------- Componente imagen (sin cambios de lógica) ----------
const WallpaperImage = ({ source, style, defaultSource }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { translations } = useLocalization();

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
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
        fadeDuration={300}
        progressiveRenderingEnabled
      />
      {isLoading && (
        <View style={styles.imageLoadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.imageLoadingText}>{translations.loadingImage || 'Cargando imagen...'}</Text>
        </View>
      )}
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
  const { translations, isRTL } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();
  const { downloadWallpaper, isDownloading, downloadProgress, showSuccessAnimation } = useDownload();
  const { isLoading: configLoading, getAdsEnabled } = useConfig();

  const isSmall = screenHeight < 730;
  const CARD_HEIGHT = Math.round(screenHeight * (isSmall ? 0.65 : 0.70));

  const [adsEnabled, setAdsEnabled] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [wallpapersData, setWallpapersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Animación del indicador deslizante ----------
  const windowStart = useRef(new Animated.Value(0)).current; // índice de inicio de ventana (0..total - VISIBLE_DOTS)

  // Helper clamp
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  // Cargar wallpapers
  useEffect(() => {
    loadWallpapers();
  }, []);

  // Ads config
  useEffect(() => {
    const loadAdsConfig = async () => {
      const adsConfig = await getAdsEnabled();
      setAdsEnabled(adsConfig);
    };
    if (!configLoading) {
      loadAdsConfig();
    }
  }, [configLoading]);

  const loadWallpapers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiResponse = await imagesService.getAll();
      const transformedData = imagesService.transformApiDataToWallpapers(apiResponse);
      if (transformedData.length > 0) {
        setWallpapersData(transformedData);
      } else {
        console.warn('⚠️ No se obtuvieron wallpapers de la API');
      }
    } catch (error) {
      console.error('❌ Error cargando wallpapers:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      // setError(`Error al cargar los wallpapers: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Índice al terminar el paginado
  const handlePageChange = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffset / (screenWidth - 40));
    setCurrentPageIndex(pageIndex);
  };

  // --- ANIMACIÓN: mover la “ventana” cuando cambia currentPageIndex ---
  useEffect(() => {
    const total = wallpapersData.length;
    if (total <= 0) return;

    // Si hay <= 5 páginas, la ventana siempre es 0
    if (total <= VISIBLE_DOTS) {
      Animated.timing(windowStart, {
        toValue: 0,
        duration: ANIM_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    // A partir del índice 3 (0-based), centramos el activo (posición visual 3 = idx 2)
    const targetStart = clamp(currentPageIndex - 2, 0, total - VISIBLE_DOTS);

    Animated.timing(windowStart, {
      toValue: targetStart,
      duration: ANIM_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentPageIndex, wallpapersData.length]);

  // Indicadores de página (ANIMADOS)
  const renderPageIndicators = () => {
    const totalPages = wallpapersData.length;
    if (totalPages === 0) return null;

    // Ancho del viewport para 5 puntos (5 slots - último no suma gap)
    const viewportWidth = VISIBLE_DOTS * STEP - DOT_GAP;

    // Transform animada: -windowStart * STEP
    const translateX = Animated.multiply(windowStart, -STEP);

    // Renderiza TODOS los puntos; el viewport muestra solo 5
    const dots = Array.from({ length: totalPages }, (_, i) => {
      const isActive = i === currentPageIndex;
      return (
        <View
          key={`dot-${i}`}
          style={styles.dotSlot}
          accessible
          accessibilityLabel={`Página ${i + 1} de ${totalPages}${isActive ? ', actual' : ''}`}
        >
          <View
            style={[
              styles.dotBase,
              isActive ? styles.dotActive : styles.dotInactive,
              // El círculo cambia de tamaño, pero el slot mantiene layout estable
              { width: isActive ? DOT_ACTIVE : DOT_INACTIVE, height: isActive ? DOT_ACTIVE : DOT_INACTIVE, borderRadius: (isActive ? DOT_ACTIVE : DOT_INACTIVE) / 2 },
            ]}
          />
        </View>
      );
    });

    return (
      <View style={styles.viewIndicators}>
        <View style={[styles.pageIndicatorsViewport, { width: viewportWidth}]}>
          <Animated.View style={[styles.pageIndicatorsTrack, { transform: [{ translateX }] }]}>
            {dots}
          </Animated.View>
        </View>
      </View>
    );
  };

  const handleDownload = async (wallpaper) => {
    try {
      const result = await downloadWallpaper(wallpaper);
      if (result.success) {
        try {
          if (wallpaper.id && wallpaper.id !== '1') {
            await imagesService.incrementDownloadCount(wallpaper.id);
          }
        } catch (apiError) {
          console.error('Error incrementando contador de descargas:', apiError);
        }
      } else {
        Alert.alert('Download error', result.message || 'No se pudo descargar el wallpaper. Inténtalo de nuevo.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error en handleDownload:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al descargar el wallpaper.', [{ text: 'OK' }]);
    }
  };

  const renderWallpaper = ({ item }) => {
    return (
      <View style={styles.wallpaperContainer}>
        <TouchableOpacity 
          style={[styles.wallpaperCard, { height: CARD_HEIGHT }]}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <WallpaperImage
              source={item.imageUrl ? { uri: item.imageUrl } : item.image} 
              style={[styles.wallpaperImage, { height: CARD_HEIGHT }]}
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
            <AdDownloadButton
              wallpaper={item}
              onDownload={handleDownload}
              isDownloading={isDownloading}
              adsEnabled={adsEnabled}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

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
      <DownloadProgress progress={downloadProgress} isVisible={isDownloading} />
      <SuccessAnimation isVisible={showSuccessAnimation} />

      {/* Fondo */}
      <View style={styles.backgroundGradient} />
      {getBackgroundFor('Wallpapers') && (
        <Image
          source={getBackgroundFor('Wallpapers')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      {/* Contenido */}
      <View style={[styles.content, isSmall && styles.contentSmall]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{t('fondos')}</Text>
        </View>

        <View style={[styles.scrollIndicator, isRTL && styles.rtlContainer]}>
          <Text style={[styles.scrollText, isRTL && styles.rtlText]}>{t('swipeForMore')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#ff6b35" />
        </View>

        {/* Lista + Indicadores */}
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
            onMomentumScrollEnd={handlePageChange}
          />

          {/* Indicadores con animación de “desplazamiento” */}
          {renderPageIndicators()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: '#000000' },
  backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' },
  backgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.25 },
  content: { flex: 1, zIndex: 1, paddingTop: 60, paddingHorizontal: 20 },
  contentSmall: { paddingTop: 40 },

  // Loading / error
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  loadingText: { color: '#fff', fontSize: 18, fontFamily: 'Poppins_400Regular', marginTop: 20, textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', paddingHorizontal: 20 },
  errorText: { color: '#ff6b35', fontSize: 18, fontFamily: 'Poppins_400Regular', textAlign: 'center', marginBottom: 30 },
  retryButton: { backgroundColor: '#00ff00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  retryButtonText: { color: '#000', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },

  // Header
  header: { alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#ff6b35', marginBottom: 5 },

  // Indicador de scroll
  scrollIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 16 },
  scrollText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#fff', marginHorizontal: 10 },

  // Lista
  wallpapersWrapper: {},
  wallpapersContent: { alignItems: 'center', paddingLeft: 0, paddingRight: 0 },
  wallpaperContainer: { width: screenWidth - 40, alignSelf: 'center', marginTop: 0, marginHorizontal: 0 },
  wallpaperCard: { backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'hidden', width: screenWidth - 40, alignSelf: 'center' },
  imageContainer: { position: 'relative' },
  wallpaperImage: { width: '100%', backgroundColor: '#1a1a1a' },

  downloadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0 },
  downloadText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#ff6b35', marginTop: 8 },

  resolutionBadge: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  resolutionText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#fff' },

  categoryBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,107,53,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#fff' },
  authorBold: { fontFamily: 'Poppins_700Bold', fontWeight: 'bold' },

  // Loading de imagen interna
  imageLoadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1 },
  imageLoadingText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins_400Regular', marginTop: 10 },

  // ----- Indicadores (viewport + track + slots) -----
  viewIndicators: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignSelf: 'center',
    paddingHorizontal: 32, // Espacio horizontal para los bordes
    paddingVertical: 10,   // Espacio vertical arriba y abajo
    borderRadius: 40,      // Bordes redondeados
    marginTop: 10,         // Espacio desde arriba
  },
  pageIndicatorsViewport: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  pageIndicatorsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Cada "slot" ocupa el tamaño del punto activo (para paso constante) + gap a la derecha
  dotSlot: {
    width: DOT_ACTIVE,
    height: DOT_ACTIVE,
    marginRight: DOT_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBase: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotInactive: {
    // tamaño dinámico se setea inline (width/height)
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#ff6b35',
  },

  // RTL helpers
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rtlContainer: { flexDirection: 'row-reverse' },
});
