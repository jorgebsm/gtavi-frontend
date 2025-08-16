import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useTrailers } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth } = Dimensions.get('window');

export default function TrailersScreen() {
  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener trailers desde el backend con soporte multi-idioma
  const { data: trailersResponse, loading, error } = useTrailers();
  const defaultTrailers = [];

  // Usar datos del backend o datos por defecto
  const trailersData = trailersResponse || defaultTrailers;

  const handleTrailerPress = (youtubeUrl) => {
    Linking.openURL(youtubeUrl).catch(err => {
      console.error('Error al abrir YouTube:', err);
    });
  };

  const renderTrailer = ({ item }) => {
    // Formatear fecha para mostrar usando el hook de localización
    const formatTrailerDate = (dateString) => {
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
      <View style={styles.trailerContainer}>
        <TouchableOpacity 
          style={styles.trailerCard}
          onPress={() => handleTrailerPress(item.youtubeUrl)}
          activeOpacity={0.8}
        >
          {/* Thumbnail del trailer */}
          <View style={styles.thumbnailContainer}>
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration || '00:00'}</Text>
            </View>
          </View>
          
          <View style={[styles.trailerInfo, isRTL && styles.rtlContainer]}>
            <Text style={[styles.trailerTitle, isRTL && styles.rtlText]}>{item.title}</Text>
            <Text style={[styles.trailerDate, isRTL && styles.rtlText]}>{formatTrailerDate(item.releaseDate)}</Text>
            {/* <Text style={styles.trailerDescription}>{item.description}</Text> */}
            {/* <Text style={[styles.watchText, isRTL && styles.rtlText]}>{translations.watchTrailer}</Text> */}
          </View>
        </TouchableOpacity>
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
      {getBackgroundFor('Trailers') && (
        <Image
          source={getBackgroundFor('Trailers')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.trailerTitle}</Text>
          {/* <Text style={styles.headerSubtitle}>GTA VI</Text> */}
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

        {/* Lista de trailers con paginación */}
        <View style={styles.trailersWrapper}>
          <FlatList
            data={trailersData}
            renderItem={renderTrailer}
            keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth}
            decelerationRate="fast"
            contentContainerStyle={styles.trailersContent}
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
    // justifyContent: 'center',
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
  trailersWrapper: {
    // flex: 1,
  },
  trailersContent: {
    alignItems: 'flex-start',
  },
  trailerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    width: screenWidth - 40,
    height: '85%',
    alignSelf: 'flex-start',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 410,
    backgroundColor: '#1a1a1a',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  playIcon: {
    fontSize: 58,
    color: '#ff6b35',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  trailerInfo: {
    padding: 20,
  },
  trailerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    marginBottom: 5,
  },
  trailerDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginBottom: 8,
  },
  trailerDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ccc',
    lineHeight: 20,
  },
  watchText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginTop: 8,
  },
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },

  trailerContainer: {
    width: screenWidth - 40,
    alignSelf: 'flex-start',
    marginTop: 0,
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
}); 