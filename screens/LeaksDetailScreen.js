import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LeaksDetailScreen = ({ route, navigation }) => {
  const { leak } = route.params;

  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      const shareText = `${leak.title}\n\nDescubre más filtraciones sobre GTA VI en la app GTA VI Countdown:\nhttps://play.google.com/store/apps/details?id=com.douapps.gtavicountdown`;
      
      await Share.share({
        message: shareText,
        title: 'Filtración GTA VI',
      });
    } catch (error) {
      console.log('Error al compartir:', error);
    }
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
      {/* <View style={styles.particlesContainer}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
        <View style={[styles.particle, styles.particle6]} />
      </View> */}
      
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ff6b35" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FILTRACIÓN</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen de la filtración */}
        {leak.image && (
          <View style={styles.leakImageContainer}>
            <Image 
              source={{ uri: leak.image }} 
              style={styles.leakImage}
              resizeMode="cover"
            />
          </View>
        )}
        
        {/* Título de la filtración */}
        <View style={styles.titleContainer}>
          <Text style={styles.leakTitle}>{leak.title}</Text>
        </View>

        {/* Metadatos */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.leakDate}>{leak.date}</Text>
            <Text style={styles.leakSource}>• {leak.source}</Text>
          </View>
          <View style={styles.credibilityContainer}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.credibilityText}>Credibilidad: {leak.credibility}</Text>
          </View>
        </View>

        {/* Contenido expandido */}
        <View style={styles.contentContainer}>
          <Text style={styles.leakContent}>
            {leak.excerpt}
          </Text>
          
          {/* Contenido adicional simulado */}
          <Text style={styles.leakContent}>
            Según fuentes internas de Rockstar Games, el desarrollo de GTA VI ha estado en marcha desde 2014, con más de 2,000 desarrolladores trabajando en el proyecto. La filtración confirma que el juego utilizará el motor RAGE 9, una versión completamente renovada del motor gráfico.
          </Text>
          
          <Text style={styles.leakContent}>
            Los archivos filtrados revelan que el mapa de Vice City será aproximadamente 3 veces más grande que Los Santos de GTA V, con múltiples islas conectadas por puentes y túneles submarinos. Cada distrito tendrá su propia economía, actividades criminales y sistema de bandas.
          </Text>
          
          <Text style={styles.leakContent}>
            Las mecánicas de juego incluyen un sistema de reputación dinámico que afecta cómo los NPCs reaccionan al jugador, un sistema de economía realista donde los precios fluctúan según las acciones del jugador, y un modo cooperativo que permite hasta 4 jugadores explorar el mundo juntos.
          </Text>
          
          <Text style={styles.leakContent}>
            La filtración también confirma la presencia de vehículos voladores, submarinos personalizables, y un sistema de propiedades que permite a los jugadores comprar y gestionar negocios legítimos e ilegítimos en toda la ciudad.
          </Text>
        </View>

        {/* Advertencia de filtración */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Esta información proviene de filtraciones no oficiales. Rockstar Games no ha confirmado estos detalles.
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Compartir filtración</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="bookmark-outline" size={20} color="#ff6b35" />
            <Text style={styles.secondaryButtonText}>Guardar</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

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
    width: 6,
    height: 6,
    top: '80%',
    left: '25%',
  },
  particle4: {
    width: 10,
    height: 10,
    top: '30%',
    right: '10%',
  },
  particle5: {
    width: 4,
    height: 4,
    top: '70%',
    left: '5%',
  },
  particle6: {
    width: 14,
    height: 14,
    top: '10%',
    right: '25%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#ff6b35',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  leakImageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  leakImage: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    zIndex: 2,
  },
  titleContainer: {
    marginBottom: 20,
  },
  leakTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leakDate: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginRight: 8,
  },
  leakSource: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
  },
  credibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  credibilityText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4CAF50',
    marginLeft: 6,
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  leakContent: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#FF9800',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ff6b35',
    marginLeft: 8,
  },
});

export default LeaksDetailScreen; 