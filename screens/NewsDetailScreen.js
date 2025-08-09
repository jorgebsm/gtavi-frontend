import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const NewsDetailScreen = ({ route, navigation }) => {
  const { news } = route.params;

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
      const shareText = `${news.title}\n\nDescubre más noticias sobre GTA VI en la app GTA VI Countdown:\nhttps://play.google.com/store/apps/details?id=com.douapps.gtavicountdown`;
      
      await Share.share({
        message: shareText,
        title: 'Noticia GTA VI',
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
        <Text style={styles.headerTitle}>NOTICIA</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen de la noticia */}
        {news.image && (
          <View style={styles.newsImageContainer}>
            <Image 
              source={{ uri: news.image }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
          </View>
        )}
        
        {/* Título de la noticia */}
        <View style={styles.titleContainer}>
          <Text style={styles.newsTitle}>{news.title}</Text>
        </View>

        {/* Metadatos */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.newsDate}>{news.date}</Text>
            <Text style={styles.newsSource}>• {news.source}</Text>
          </View>
        </View>

        {/* Contenido expandido */}
        <View style={styles.contentContainer}>
          <Text style={styles.newsContent}>
            {news.excerpt}
          </Text>
          
          {/* Contenido adicional simulado */}
          <Text style={styles.newsContent}>
            Rockstar Games ha confirmado oficialmente que Grand Theft Auto VI será uno de los juegos más ambiciosos jamás creados. Con un presupuesto que supera los $2 mil millones, el desarrollo ha involucrado a más de 2,000 desarrolladores durante varios años.
          </Text>
          
          <Text style={styles.newsContent}>
            El juego presenta una recreación completamente nueva de Vice City, inspirada en la moderna Miami, con un nivel de detalle sin precedentes. Los jugadores podrán explorar múltiples islas, cada una con su propia personalidad y actividades únicas.
          </Text>
          
          <Text style={styles.newsContent}>
            Las nuevas mecánicas incluyen un sistema de redes sociales in-game que permite a los jugadores compartir fotos y videos de sus aventuras, un sistema de economía dinámico, y NPCs con inteligencia artificial avanzada que reaccionan de manera realista a las acciones del jugador.
          </Text>
          
          <Text style={styles.newsContent}>
            Los protagonistas, Lucia y Jason, representan una nueva era para la franquicia, siendo la primera vez que GTA presenta una protagonista femenina principal. Su historia de amor y crimen se desarrolla en un mundo donde las oportunidades y los peligros están en cada esquina.
          </Text>
        </View>

        {/* Botón de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Compartir noticia</Text>
          </TouchableOpacity>
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
  newsImageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  newsImage: {
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
  newsTitle: {
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
  },
  newsDate: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
    marginRight: 8,
  },
  newsSource: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ff6b35',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  newsContent: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
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
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default NewsDetailScreen; 