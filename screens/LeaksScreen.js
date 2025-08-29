import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Linking, Image, Alert, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useLeaks } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Indicadores (ventana de 5 puntos)
const VISIBLE_DOTS = 5;
const DOT_GAP = 15;                 // margen horizontal entre puntos (4 a cada lado, total 8)
const DOT_INACTIVE = 8;            // diámetro punto inactivo
const DOT_ACTIVE = 12;             // diámetro punto activo
const STEP = DOT_ACTIVE + DOT_GAP; // paso constante de la "pista" (track)
const ANIM_MS = 220;               // duración animación desplazamiento

export default function LeaksScreen({ navigation }) {
  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();
  const { height: screenHeight } = Dimensions.get('window');
  const isSmall = screenHeight < 730;
  const CARD_HEIGHT = Math.round(screenHeight * (isSmall ? 0.65 : 0.70));
  const IMAGE_HEIGHT = isSmall ? Math.round(screenHeight * 0.28) : 200;

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener filtraciones desde el backend con soporte multiidioma
  const { data: leaksData, loading, error, currentLanguage } = useLeaks();
  const defaultLeaks = [];
  // Usar datos del backend o datos por defecto
  const finalLeaksData = leaksData || defaultLeaks;

  // Estado para el índice actual del scroll horizontal
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // ---------- Animación del indicador deslizante ----------
  const windowStart = useRef(new Animated.Value(0)).current; // índice de inicio de ventana (0..total - VISIBLE_DOTS)

  // Helper clamp
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const getCredibilityColor = (credibility) => {
    // Normalizar la credibilidad para ser independiente del idioma
    const normalizedCredibility = credibility?.toLowerCase();
    switch (normalizedCredibility) {
      case 'alta':
      case 'high':
      case 'haute':
      case 'عالية':
      case 'wysoka':
        return '#4CAF50';
      case 'media':
      case 'medium':
      case 'moyenne':
      case 'متوسطة':
      case 'średnia':
      case 'média':
        return '#FF9800';
      case 'baja':
      case 'low':
      case 'faible':
      case 'منخفضة':
      case 'niska':
      case 'baixa':
        return '#F44336';
      default: 
        return '#999';
    }
  };

  // Índice al terminar el paginado
  const handlePageChange = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffset / (screenWidth - 40));
    setCurrentPageIndex(pageIndex);
  };

  // --- ANIMACIÓN: mover la "ventana" cuando cambia currentPageIndex ---
  useEffect(() => {
    const total = finalLeaksData.length;
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
  }, [currentPageIndex, finalLeaksData.length]);

  const getLocalizedCredibility = (credibility) => {
    const normalizedCredibility = credibility?.toLowerCase();
    switch (normalizedCredibility) {
      case 'alta':
      case 'high':
      case 'haute':
      case 'عالية':
      case 'wysoka':
        return translations.high;
      case 'media':
      case 'medium':
      case 'moyenne':
      case 'متوسطة':
      case 'średnia':
      case 'média':
        return translations.medium;
      case 'baja':
      case 'low':
      case 'faible':
      case 'منخفضة':
      case 'niska':
      case 'baixa':
        return translations.low;
      default: 
        return credibility;
    }
  };

  const renderLeak = ({ item }) => {
    // Formatear fecha para mostrar usando el hook de localización
    const formatLeakDate = (dateString) => {
      if (!dateString) return translations.dateNotAvailable;
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return `1 ${translations.daysAgo}`;
      if (diffDays < 7) return `${diffDays} ${translations.daysAgo}`;
      return formatDate(dateString);
    };

    return (
      <View style={styles.leakContainer}>
        <TouchableOpacity 
          style={[styles.leakCard, { height: CARD_HEIGHT }]}
          onPress={() => navigation.navigate('LeaksDetail', { leak: item })}
          activeOpacity={0.8}
        >
          {item.image && (
            <View style={[styles.leakImageContainer, { height: IMAGE_HEIGHT }]}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.leakImage}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={[styles.leakContentInner, isRTL && styles.rtlContainer]}>
            <View style={styles.leakHeader}>
              <Text style={[styles.leakTitle, isRTL && styles.rtlText]}>{item.title}</Text>
              <View style={[styles.credibilityBadge, { backgroundColor: getCredibilityColor(item.credibility) }]}>
                <Text style={[styles.credibilityText, isRTL && styles.rtlText]}>{getLocalizedCredibility(item.credibility)}</Text>
              </View>
            </View>
            <Text style={[styles.leakDate, isRTL && styles.rtlText]}>{formatLeakDate(item.publishDate)}</Text>
            <Text style={[styles.leakContent, isRTL && styles.rtlText]}>{item.excerpt}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Indicadores de página (ANIMADOS)
  const renderPageIndicators = () => {
    const totalPages = finalLeaksData.length;
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
      <View style={[styles.pageIndicatorsViewport, { width: viewportWidth }]}>
        <Animated.View style={[styles.pageIndicatorsTrack, { transform: [{ translateX }] }]}>
          {dots}
        </Animated.View>
      </View>
    );
  };

  // Mostrar loading mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradiente de fondo */}
      <View style={styles.backgroundGradient} />
      {/* Imagen de fondo */}
      {getBackgroundFor('Leaks') && (
        <Image
          source={getBackgroundFor('Leaks')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      {/* Contenido principal */}
      <View style={[styles.content, isSmall && styles.contentSmall]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.leaksTitle}</Text>
          {/* <Text style={styles.headerSubtitle}>GTA VI</Text> */}
          {/* <Text style={[styles.headerWarning, isRTL && styles.rtlText]}>{translations.unofficialInfo}</Text> */}
        </View>

        {/* Indicador de scroll */}
        <View style={[styles.scrollIndicator, isRTL && styles.rtlContainer]}>
          <Text style={[styles.scrollText, isRTL && styles.rtlText]}>{translations.swipeForMore}</Text>
          <Ionicons 
            name={isRTL ? "chevron-back" : "chevron-forward"} 
            size={20} 
            color="#ff6b35" 
          />
        </View>

        {/* Lista de filtraciones con paginación */}
        <View style={styles.leaksWrapper}>
          <FlatList
            data={finalLeaksData}
            renderItem={renderLeak}
            keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 40}
            decelerationRate="fast"
            contentContainerStyle={styles.leaksContent}
            onMomentumScrollEnd={handlePageChange}
          />

          {/* Indicadores con animación de "desplazamiento" */}
          {renderPageIndicators()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    // paddingHorizontal: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: '#0f0f23',
    backgroundColor: '#000000',
    zIndex: 0,
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
    zIndex: 2,
    paddingTop: 60,
    paddingHorizontal: 20,
    // justifyContent: 'center',
  },
  contentSmall: {
    paddingTop: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    zIndex: 2,
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
    marginBottom: 5,
  },
  headerWarning: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    fontStyle: 'italic',
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
  leaksWrapper: {
    // flex: 1,
  },
  leaksContent: {
    alignItems: 'flex-start',
  },
  leakContainer: {
    width: screenWidth - 40,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  leakCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: screenWidth - 40,
    // altura asignada dinámicamente en runtime (CARD_HEIGHT)
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  leakImageContainer: {
    width: '100%',
    // altura asignada dinámicamente (IMAGE_HEIGHT)
  },
  leakImage: {
    width: '100%',
    height: '100%',
  },
  leakContentInner: {
    padding: 20,
  },
  leakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leakTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
    lineHeight: 24,
  },
  credibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  credibilityText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  leakDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginBottom: 10,
  },
  leakContent: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ccc',
    lineHeight: 20,
  },
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
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
  },

  // ----- Indicadores (viewport + track + slots) -----
  pageIndicatorsViewport: {
    alignSelf: 'center',
    overflow: 'hidden',
    marginTop: 20,
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
}); 