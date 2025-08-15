import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Share, StyleSheet, Dimensions, Animated, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// Removemos el import de fuentes que no existe
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import BackendConnectionTest from '../components/BackendConnectionTest';
import { useLocalization } from '../hooks/useLocalization';
import { useLanguage } from '../contexts/LanguageContext';
import LottieView from 'lottie-react-native';
import useOnboardingStatus from '../hooks/useOnboardingStatus';
import { requestAndRegisterNotifications } from '../services/notifications';
import LanguageSelector from '../components/LanguageSelector';
import { useBackgrounds } from '../contexts/BackgroundContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MoreScreen = () => {
  // Hook de localización
  const { translations, isRTL, t } = useLocalization();
  const { getBackgroundFor } = useBackgrounds();
  
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

  // Estado de onboarding (para saber si ya decidió y ocultar tarjeta)
  const { isCompleted, markCompleted, markPrompted, markRejected } = useOnboardingStatus();

  // No inicializar OneSignal aquí. Se hará solo tras consentimiento.

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

      {/* Imagen de fondo */}
      {getBackgroundFor('More') && (
        <Image
          source={getBackgroundFor('More')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
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
        
        {isCompleted ? (
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
        ) : (
          <View style={styles.alertCard}>
            <Text style={[styles.alertTitle, fontsLoaded && { fontFamily: 'Poppins_700Bold' }]}>
              {t('ob_reminders_title')}
            </Text>
            <Text style={[styles.alertSubtitle, fontsLoaded && { fontFamily: 'Poppins_400Regular' }]}>
              {t('ob_reminders_sub')}
            </Text>
            <LottieView
              source={require('../assets/animations/notifications.json')}
              autoPlay
              loop
              style={styles.alertLottie}
              speed={1}
              pointerEvents="none"
            />
            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertReject}
                onPress={async () => { await markRejected(); await markCompleted(); }}
              >
                <Text style={[styles.alertRejectText, fontsLoaded && { fontFamily: 'Poppins_600SemiBold' }]}>
                  {t('ob_cta_reject')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertAccept}
                onPress={async () => {
                  await markPrompted();
                  const granted = await requestAndRegisterNotifications();
                  await markCompleted();
                  if (!granted) await markRejected();
                }}
              >
                <Text style={[styles.alertAcceptText, fontsLoaded && { fontFamily: 'Poppins_600SemiBold' }]}>
                  {t('ob_cta_enable')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Componente de prueba de conexión */}
        {/* <BackendConnectionTest /> */}

        {/* Información adicional */}
        <View style={styles.footer}>
          <Text style={styles.footerSubtext}>GTA VI Countdown — App v2.1.0</Text>
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
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
  buttonGradientGreen: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  buttonGradientBlue: {
    backgroundColor: 'rgba(33, 150, 243, 0.5)',
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
  // Alert card styles
  alertCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  alertTitle: {
    color: '#fff',
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 12,
  },
  alertSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  alertLottie: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.75,
    marginVertical: 8,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  alertReject: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  alertRejectText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  alertAccept: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  alertAcceptText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
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