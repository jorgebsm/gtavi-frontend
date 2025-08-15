import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import OnboardingSlide from './OnboardingSlide';
import { useTranslation } from '../../hooks/useTranslation';
import useOnboardingStatus from '../../hooks/useOnboardingStatus';
import { requestAndRegisterNotifications, initializeOneSignal } from '../../services/notifications';

const { height: screenHeight } = Dimensions.get('window');

const OnboardingNavigator = ({ forceFinal = false }) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const { markCompleted, markPrompted, markRejected } = useOnboardingStatus();

  // Asegura que el SDK esté inicializado para cuando se pulse el CTA final
  useEffect(() => {
    initializeOneSignal();
  }, []);

  const allSlides = [
    {
      key: 'welcome',
      title: t('ob_welcome_title', { defaultValue: 'Desliza para descubrir GTA VI Countdown' }),
      subtitle: t('ob_welcome_sub', { defaultValue: 'Desliza hacia arriba para continuar' }),
      showSkip: true,
    },
    {
      key: 'trailers',
      title: t('ob_trailers_title', { defaultValue: 'Mira los trailers oficiales' }),
      subtitle: t('ob_trailers_sub', { defaultValue: 'Encuentra los últimos videos de GTA VI' }),
      showSkip: true,
    },
    {
      key: 'news',
      title: t('ob_news_title', { defaultValue: 'Sigue las noticias' }),
      subtitle: t('ob_news_sub', { defaultValue: 'Actualizaciones y novedades en un solo lugar' }),
      showSkip: true,
    },
    {
      key: 'leaks',
      title: t('ob_leaks_title', { defaultValue: 'Explora filtraciones' }),
      subtitle: t('ob_leaks_sub', { defaultValue: 'Rumores y hallazgos de la comunidad' }),
      showSkip: true,
    },
    {
      key: 'reminders',
      title: t('ob_reminders_title', { defaultValue: '¿Quieres recordatorios diarios?' }),
      subtitle: t('ob_reminders_sub', { defaultValue: 'Te avisaremos cuántos días faltan para el lanzamiento' }),
      ctaLabel: t('ob_cta_enable', { defaultValue: 'Quiero recibir recordatorios' }),
      showSkip: true,
      isFinal: true,
    },
  ];

  const slides = forceFinal ? allSlides.filter(s => s.isFinal) : allSlides;

  const handleSkip = async () => {
    await markCompleted();
  };

  const handleEnableNotifications = async () => {
    try {
      await markPrompted();
      const granted = await requestAndRegisterNotifications();
      await markCompleted();
      if (!granted) {
        await markRejected();
      }
    } catch (e) {
      Alert.alert('Error', 'No pudimos solicitar permisos en este momento.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ height: screenHeight * slides.length }}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {slides.map((s, index) => (
          <View key={s.key} style={{ height: screenHeight }}>
            <OnboardingSlide
              title={s.title}
              subtitle={s.subtitle}
              ctaLabel={s.isFinal ? s.ctaLabel : undefined}
              onPressCta={s.isFinal ? handleEnableNotifications : undefined}
              showSkip={s.showSkip}
              onSkip={handleSkip}
              skipLabel={t('ob_skip', { defaultValue: 'Ver la app' })}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
  },
});

export default OnboardingNavigator;


