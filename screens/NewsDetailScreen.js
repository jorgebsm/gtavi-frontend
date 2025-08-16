import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Removemos el import de fuentes que no existe
import { useLocalization } from '../hooks/useLocalization';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const NewsDetailScreen = ({ route, navigation }) => {
  const { news } = route.params;

  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();

  // No necesitamos cargar fuentes personalizadas

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      const shareText = `${news.title}\n\n${translations.shareNewsText}\nhttps://play.google.com/store/apps/details?id=com.douapps.gtavicountdown`;
      
      await Share.share({
        message: shareText,
        title: `${translations.newsTitle} GTA VI`,
      });
    } catch (error) {}
  };

  // No necesitamos verificar fuentes

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradiente de fondo */}
      <View style={styles.backgroundGradient} />
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ff6b35" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.newsTitle}</Text>
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
          <Text style={[styles.newsTitle, isRTL && styles.rtlText]}>{news.title}</Text>
        </View>

        {/* Metadatos */}
        <View style={[styles.metaContainer, isRTL && styles.rtlContainer]}>
          <View style={[styles.metaRow, isRTL && styles.rtlContainer]}>
            <Text style={[styles.newsDate, isRTL && styles.rtlText]}>{formatDate(news.publishDate)}</Text>
            <Text style={[styles.newsSource, isRTL && styles.rtlText]}>• {news.source}</Text>
          </View>
        </View>

        {/* Contenido expandido */}
        <View style={styles.contentContainer}>
          <Text style={[styles.newsContent, isRTL && styles.rtlText]}>
            {news.content || news.excerpt}
          </Text>
        </View>

        {/* Botón de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, isRTL && styles.rtlContainer]} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, isRTL && styles.rtlText]}>{translations.shareButton}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#141414',
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
    backgroundColor: '#252525',
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
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
});

export default NewsDetailScreen; 