import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Linking, Image, Alert } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useLeaks } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth } = Dimensions.get('window');

export default function LeaksScreen({ navigation }) {
  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener filtraciones desde el backend con soporte multiidioma
  const { data: leaksData, loading, error, currentLanguage } = useLeaks();

  // Datos por defecto si no hay conexión
  // const defaultLeaks = [
  //   {
  //     id: 1,
  //     title: "Nuevos vehículos confirmados",
  //     date: "Hace 1 día",
  //     credibility: "Alta",
  //     source: "Código fuente filtrado",
  //     excerpt: "Filtración de código fuente revela nuevos vehículos incluyendo motos voladoras y barcos de alta velocidad con tecnología futurista.",
  //     content: "Filtración de código fuente revela nuevos vehículos incluyendo motos voladoras y barcos de alta velocidad con tecnología futurista.",
  //     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop"
  //   },
  //   {
  //     id: 2,
  //     title: "Mapa completo filtrado",
  //     date: "Hace 3 días",
  //     credibility: "Media",
  //     source: "Desarrollador anónimo",
  //     excerpt: "Un desarrollador anónimo ha compartido detalles del mapa completo de Vice City y sus alrededores con nuevas ubicaciones.",
  //     content: "Un desarrollador anónimo ha compartido detalles del mapa completo de Vice City y sus alrededores con nuevas ubicaciones.",
  //     image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop"
  //   }
  // ];
  const defaultLeaks = [];

  // Usar datos del backend o datos por defecto
  const finalLeaksData = leaksData || defaultLeaks;

  // Mostrar error si hay problemas con la API
  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       'Error de conexión',
  //       'No se pudo conectar con el servidor. Mostrando filtraciones por defecto.',
  //       [{ text: 'OK' }]
  //     );
  //   }
  // }, [error]);

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
          style={styles.leakCard}
          onPress={() => navigation.navigate('LeaksDetail', { leak: item })}
          activeOpacity={0.8}
        >
          {item.image && (
            <View style={styles.leakImageContainer}>
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
        {/* <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
        <View style={[styles.particle, styles.particle6]} /> */}
      </View>
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.leaksTitle}</Text>
          {/* <Text style={styles.headerSubtitle}>GTA VI</Text> */}
          <Text style={[styles.headerWarning, isRTL && styles.rtlText]}>{translations.unofficialInfo}</Text>
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
    zIndex: 0,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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
    zIndex: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: screenWidth - 40,
    height: '85%',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  leakImageContainer: {
    width: '100%',
    height: 200,
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
}); 