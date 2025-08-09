import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, Linking, Alert } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { trailersService } from '../services/api';
import { useApi } from '../hooks/useApi';

const { width: screenWidth } = Dimensions.get('window');

export default function TrailersScreen() {
  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener trailers desde el backend
  const { data: trailersResponse, loading, error } = useApi(trailersService.getAll);

  // Datos por defecto si no hay conexión
  // const defaultTrailers = [
  //   {
  //     id: 2,
  //     title: "Grand Theft Auto VI - Trailer Oficial #2",
  //     date: "Diciembre 2024",
  //     duration: "1:31",
  //     description: "El segundo trailer oficial que muestra más detalles del mundo de Vice City, las actividades criminales y la vida en las calles de Florida.",
  //     youtubeUrl: "https://www.youtube.com/watch?v=VQRLujxTm3c",
  //     thumbnail: "https://img.youtube.com/vi/VQRLujxTm3c/maxresdefault.jpg"
  //   },
  //   {
  //     id: 1,
  //     title: "Grand Theft Auto VI - Trailer Oficial #1",
  //     date: "Diciembre 2023",
  //     duration: "1:31",
  //     description: "El primer trailer oficial de Grand Theft Auto VI que revela Vice City y presenta a los protagonistas Lucia y Jason en un mundo lleno de crimen y oportunidades.",
  //     youtubeUrl: "https://www.youtube.com/watch?v=QdBZY2fkU-0",
  //     thumbnail: "https://img.youtube.com/vi/QdBZY2fkU-0/maxresdefault.jpg"
  //   }
  // ];

  const defaultTrailers = [];

  // Usar datos del backend o datos por defecto
  const trailersData = trailersResponse?.data || defaultTrailers;

  // Mostrar error si hay problemas con la API
  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       'Error de conexión',
  //       'No se pudo conectar con el servidor. Mostrando trailers por defecto.',
  //       [{ text: 'OK' }]
  //     );
  //   }
  // }, [error]);

  const handleTrailerPress = (youtubeUrl) => {
    Linking.openURL(youtubeUrl).catch(err => {
      console.error('Error al abrir YouTube:', err);
    });
  };

  const renderTrailer = ({ item }) => {
    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
      if (!dateString) return 'Fecha no disponible';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
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
          
          <View style={styles.trailerInfo}>
            <Text style={styles.trailerTitle}>{item.title}</Text>
            <Text style={styles.trailerDate}>{formatDate(item.releaseDate)}</Text>
            {/* <Text style={styles.trailerDescription}>{item.description}</Text> */}
            {/* <Text style={styles.watchText}>Toca para ver en YouTube</Text> */}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Mostrar loading mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
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
        <View style={[styles.particle, styles.particle3]} /> */}
        {/* <View style={[styles.particle, styles.particle4]} /> */}
        {/* <View style={[styles.particle, styles.particle5]} /> */}
        {/* <View style={[styles.particle, styles.particle6]} /> */}
      </View>
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TRAILERS</Text>
          {/* <Text style={styles.headerSubtitle}>GTA VI</Text> */}
        </View>

        {/* Indicador de scroll */}
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollText}>Desliza para ver más</Text>
          <Ionicons name="chevron-forward" size={20} color="#ff6b35" />
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
  trailersWrapper: {
    // flex: 1,
  },
  trailersContent: {
    alignItems: 'flex-start',
  },
  trailerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    fontSize: 48,
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

  trailerContainer: {
    width: screenWidth - 40,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
}); 