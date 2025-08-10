import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Linking, Image, Alert } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useNews } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener noticias desde el backend con soporte multi-idioma
  const { data: newsResponse, loading, error } = useNews();

  // Datos por defecto si no hay conexión
  // const defaultNews = [
  //   {
  //     id: 1,
  //     title: "GTA VI: Rockstar lanza el segundo trailer oficial",
  //     date: "Diciembre 2024",
  //     excerpt: "Rockstar Games ha lanzado el segundo trailer oficial de Grand Theft Auto VI, mostrando más detalles del mundo de Vice City y las actividades criminales. El trailer confirma que el juego llegará en 2025.",
  //     source: "Rockstar Games",
  //     image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop"
  //   },
  //   {
  //     id: 2,
  //     title: "GTA VI confirmado para 2025: Fecha de lanzamiento oficial",
  //     date: "Diciembre 2024",
  //     excerpt: "Take-Two Interactive ha confirmado oficialmente que Grand Theft Auto VI se lanzará en 2025. El CEO Strauss Zelnick confirmó la fecha durante una conferencia de inversores, generando gran expectativa en la comunidad gaming.",
  //     source: "Take-Two Interactive",
  //     image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop"
  //   }
  // ];

  const defaultNews = [];

  // Usar datos del backend o datos por defecto
  const newsData = newsResponse || defaultNews;

  // Mostrar error si hay problemas con la API
  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       'Error de conexión',
  //       'No se pudo conectar con el servidor. Mostrando noticias por defecto.',
  //       [{ text: 'OK' }]
  //     );
  //   }
  // }, [error]);

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
          style={styles.newsCard}
          onPress={() => handleNewsPress(item)}
          activeOpacity={0.8}
        >
          {item.image && (
            <View style={styles.newsImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.newsImage}
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
      
      {/* Efectos de partículas */}
      <View style={styles.particlesContainer}>
        {/* <View style={[styles.particle, styles.particle1]} /> */}
        {/* <View style={[styles.particle, styles.particle2]} /> */}
        {/* <View style={[styles.particle, styles.particle3]} /> */}
        {/* <View style={[styles.particle, styles.particle4]} /> */}
        {/* <View style={[styles.particle, styles.particle5]} /> */}
        {/* <View style={[styles.particle, styles.particle6]} /> */}
      </View>
      
      {/* Contenido principal */}
      <View style={styles.content}>
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
    paddingHorizontal: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f23',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 50,
  },
  particle1: {
    width: 8,
    height: 8,
    top: '20%',
    left: '15%',
  },
  particle2: {
    width: 12,
    height: 12,
    top: '60%',
    right: '20%',
  },
  particle3: {
    width: 8,
    height: 8,
    top: '90%',
    left: '25%',
  },
  particle4: {
    width: 10,
    height: 10,
    top: '14%',
    left: '14%',
  },
  particle5: {
    width: 6,
    height: 6,
    top: '16%',
    left: '10%',
  },
  particle6: {
    width: 15,
    height: 15,
    top: '6%',
    right: '6%',
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingTop: 60,
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
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: screenWidth - 40,
    height: '85%',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  newsImageContainer: {
    width: '100%',
    height: 200,
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