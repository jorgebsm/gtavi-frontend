import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Linking, Image, Alert } from 'react-native';
import { useBackgrounds } from '../contexts/BackgroundContext';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// Removemos el import de fuentes que no existe
import { useLeaks } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth } = Dimensions.get('window');

export default function LeaksScreen({ navigation }) {
  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();

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
      {/* Imagen de fondo */}
      {getBackgroundFor('Leaks') && (
        <Image
          source={getBackgroundFor('Leaks')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
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