import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Share, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// Removemos el import de fuentes que no existe
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import BackendConnectionTest from '../components/BackendConnectionTest';
import { useLocalization } from '../hooks/useLocalization';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MoreScreen = () => {
  // Hook de localización
  const { translations, isRTL } = useLocalization();
  
  // Hook de idioma
  const { currentLanguageInfo } = useLanguage();
  
  // Estado para el selector de idioma
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const handleRate = () => {
    // Redirigir a la Play Store (reemplazar con el ID real de la app)
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.douapps.gtavicountdown';
    Linking.openURL(playStoreUrl).catch(err => {
      console.error('Error al abrir Play Store:', err);
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${translations.shareMessage}\n\nhttps://play.google.com/store/apps/details?id=com.douapps.gtavicountdown`,
        title: translations.appTitle,
      });
    } catch (error) {
      console.error(`${translations.shareError}`, error);
    }
  };

  const handleLanguageSelect = () => {
    setLanguageSelectorVisible(true);
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
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{translations.extrasTitle}</Text>
          <Text style={[styles.headerSubtitle, isRTL && styles.rtlText]}>{translations.additionalOptions}</Text>
        </View>
        
        {/* Botones principales */}
        <View style={styles.buttonsContainer}>
          {/* Botón Califícanos */}
          <TouchableOpacity 
            style={styles.buttonWrapper} 
            onPress={handleRate}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient}>
              <View style={[styles.buttonContent, isRTL && styles.rtlContainer]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="star" size={32} color="#FFFFFF" />
                </View>
                <Text style={[styles.buttonTitle, isRTL && styles.rtlText]}>{translations.rateApp}</Text>
                <Text style={[styles.buttonSubtitle, isRTL && styles.rtlText]}>{translations.rateDescription}</Text>
              </View>
              <View style={styles.buttonGlow} />
            </View>
          </TouchableOpacity>

          {/* Botón Comparte */}
          <TouchableOpacity 
            style={styles.buttonWrapper} 
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <View style={[styles.buttonGradient, styles.buttonGradientGreen]}>
              <View style={[styles.buttonContent, isRTL && styles.rtlContainer]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="share-social" size={32} color="#FFFFFF" />
                </View>
                <Text style={[styles.buttonTitle, isRTL && styles.rtlText]}>{translations.shareApp}</Text>
                <Text style={[styles.buttonSubtitle, isRTL && styles.rtlText]}>{translations.shareDescription}</Text>
              </View>
              <View style={styles.buttonGlow} />
            </View>
          </TouchableOpacity>

          {/* Botón Seleccionar Idioma */}
          <TouchableOpacity 
            style={styles.buttonWrapper} 
            onPress={handleLanguageSelect}
            activeOpacity={0.8}
          >
            <View style={[styles.buttonGradient, styles.buttonGradientBlue]}>
              <View style={[styles.buttonContent, isRTL && styles.rtlContainer]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="language" size={32} color="#FFFFFF" />
                </View>
                <Text style={[styles.buttonTitle, isRTL && styles.rtlText]}>{translations.language}</Text>
                <Text style={[styles.buttonSubtitle, isRTL && styles.rtlText]}>
                  {currentLanguageInfo.name}
                </Text>
              </View>
              <View style={styles.buttonGlow} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Componente de prueba de conexión */}
        {/* <BackendConnectionTest /> */}

        {/* Información adicional */}
        <View style={styles.footer}>
          {/* <Text style={styles.footerText}>GTA VI Countdown — App v1.0.0</Text> */}
          <Text style={styles.footerSubtext}>GTA VI Countdown — App v2.0.0</Text>
        </View>
      </ScrollView>

      {/* Selector de Idioma */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
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
    width: 8,
    height: 8,
    top: '30%',
    left: '15%',
  },
  particle6: {
    width: 14,
    height: 14,
    top: '10%',
    right: '25%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#ff6b35',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#ffffff',
    opacity: 0.7,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  buttonWrapper: {
    width: screenWidth - 100,
    height: 140,
    // borderRadius: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.3,
    // shadowRadius: 16,
    // elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 25,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFD700',
  },
  buttonGradientGreen: {
    backgroundColor: '#4CAF50',
  },
  buttonGradientBlue: {
    backgroundColor: '#2196F3',
  },
  buttonContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    // marginBottom: 3,
  },
  buttonSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonGlow: {
    // position: 'absolute',
    // top: -2,
    // left: -2,
    // right: -2,
    // bottom: -2,
    // borderRadius: 22,
    // backgroundColor: 'transparent',
    // borderWidth: 2,
    // borderColor: 'rgba(255, 255, 255, 0.3)',
    // zIndex: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#ffffff',
    opacity: 0.6,
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
});

export default MoreScreen; 