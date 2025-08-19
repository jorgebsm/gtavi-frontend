import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useNews } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
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

  // Obtener noticias desde el backend con soporte multi-idioma
  const { data: newsResponse, loading, error } = useNews();
  const defaultNews = [];

  // Usar datos del backend o datos por defecto
  const newsData = newsResponse || defaultNews;
  
  const handleNewsPress = (news) => {
    // Navegar a la pantalla de detalle de la noticia
    navigation.navigate('NewsDetail', { news });
  };

  const renderNews = ({ item }) => {
    // Formatear fecha para mostrar usando el hook de localización
    const formatNewsDate = (dateString) => {
      if (!dateString) return translations.dateNotAvailable;
      return formatDate(dateString);
    };

    return (
      <View style={styles.newsContainer}>
        <TouchableOpacity 
          style={[styles.newsCard, { height: CARD_HEIGHT }]}
          onPress={() => handleNewsPress(item)}
          activeOpacity={0.8}
        >
          {item.image && (
            <View style={styles.newsImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={[styles.newsImage, { height: IMAGE_HEIGHT }]}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={[styles.newsContentInner, isRTL && styles.rtlContainer]}>
            <View style={styles.newsHeader}>
              <Text style={[styles.newsTitle, isRTL && styles.rtlText]}>{item.title}</Text>
              <View style={[styles.newsMeta, isRTL && styles.rtlContainer]}>
                <Text style={[styles.newsDate, isRTL && styles.rtlText]}>{formatNewsDate(item.publishDate)}</Text>
                <Text style={[styles.newsSource, isRTL && styles.rtlText]}>• {item.source}</Text>
              </View>
            </View>
            <Text style={[styles.newsExcerpt, isRTL && styles.rtlText]}>{item.excerpt}</Text>
            <Text style={[styles.readMore, isRTL && styles.rtlText]}>{translations.tapToReadMore}</Text>
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
      {getBackgroundFor('News') && (
        <Image
          source={getBackgroundFor('News')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
      {/* Contenido principal */}
      <View style={[styles.content, isSmall && styles.contentSmall]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.news}</Text>
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

        {/* Lista de noticias con paginación */}
        <View style={styles.newsWrapper}>
          <FlatList
            data={newsData}
            renderItem={renderNews}
            keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 40}
            decelerationRate="fast"
            contentContainerStyle={styles.newsContent}
            getItemLayout={(data, index) => ({
              length: screenWidth - 40,
              offset: (screenWidth - 40) * index,
              index,
            })}
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
  newsWrapper: {
    // flex: 1,
  },
  newsContainer: {
    width: screenWidth - 40,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  newsContent: {
    alignItems: 'flex-start',
  },
  newsCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: screenWidth - 40,
    // altura asignada dinámicamente por dispositivo (CARD_HEIGHT)
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  newsImageContainer: {
    width: '100%',
    // altura asignada dinámicamente (IMAGE_HEIGHT)
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsContentInner: {
    padding: 20,
  },
  newsHeader: {
    marginBottom: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginRight: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ccc',
    lineHeight: 20,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
  },
  readMore: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginTop: 10,
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
}); 