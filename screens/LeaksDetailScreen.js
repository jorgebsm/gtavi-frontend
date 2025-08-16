import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Removemos el import de fuentes que no existe
import { useLocalization } from '../hooks/useLocalization';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LeaksDetailScreen = ({ route, navigation }) => {
  const { leak } = route.params;

  // Hook de localización
  const { translations, isRTL, formatDate } = useLocalization();

  // Función para obtener color de credibilidad (igual que en LeaksScreen)
  const getCredibilityColor = (credibility) => {
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

  // Función para localizar credibilidad (igual que en LeaksScreen)
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

  // No necesitamos cargar fuentes personalizadas

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      const shareText = `${leak.title}\n\n${translations.shareLeakText}\nhttps://play.google.com/store/apps/details?id=com.douapps.gtavicountdown`;
      
      await Share.share({
        message: shareText,
        title: `${translations.leakTitle} GTA VI`,
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
        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.leakTitle}</Text>
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
          <Text style={[styles.leakTitle, isRTL && styles.rtlText]}>{leak.title}</Text>
        </View>

        {/* Metadatos */}
        <View style={[styles.metaContainer, isRTL && styles.rtlContainer]}>
          <View style={[styles.metaRow, isRTL && styles.rtlContainer]}>
            <Text style={[styles.leakDate, isRTL && styles.rtlText]}>{formatDate(leak.publishDate)}</Text>
            <Text style={[styles.leakSource, isRTL && styles.rtlText]}>• {leak.source}</Text>
          </View>
          <View style={[styles.credibilityContainer, isRTL && styles.rtlContainer]}>
            <Ionicons name="shield-checkmark" size={16} color={getCredibilityColor(leak.credibility)} />
            <Text style={[styles.credibilityText, isRTL && styles.rtlText]}>{translations.credibility}: {getLocalizedCredibility(leak.credibility)}</Text>
          </View>
        </View>

        {/* Contenido expandido */}
        <View style={styles.contentContainer}>
          <Text style={[styles.leakContent, isRTL && styles.rtlText]}>
            {leak.content || leak.excerpt}
          </Text>
        </View>

        {/* Advertencia de filtración */}
        <View style={[styles.warningContainer, isRTL && styles.rtlContainer]}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={[styles.warningText, isRTL && styles.rtlText]}>
            {translations.unofficialWarning}
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, isRTL && styles.rtlContainer]} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, isRTL && styles.rtlText]}>{translations.shareButton}</Text>
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
    backgroundColor: '#252525',
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
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
});

export default LeaksDetailScreen; 