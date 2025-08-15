import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TikTokNavigator from './components/TikTokNavigator';
import { useInitNotifications, initializeOneSignal, requestAndRegisterNotifications } from './services/notifications';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LanguageProvider } from './contexts/LanguageContext';
import LanguageTest from './components/LanguageTest'; // Descomenta para probar
import SimpleTest from './components/SimpleTest'; // Prueba simple
import { isOnboardingEnabled } from './config/featureFlags';
import FEATURE_FLAGS from './config/featureFlags';
import useOnboardingStatus from './hooks/useOnboardingStatus';
import OnboardingNavigator from './components/onboarding/OnboardingNavigator';
import OnboardingOverlay from './components/onboarding/OnboardingOverlay';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  // Estado para mostrar el resultado del registro de notificaciones
  const [notifStatus, setNotifStatus] = useState({ status: 'pending', message: '', playerId: '' });
  const { isCompleted, canRePrompt, markCompleted, markPrompted, markRejected } = useOnboardingStatus();
  const onboardingEnabled = isOnboardingEnabled();
  const [overlayState, setOverlayState] = useState({ index: 0, total: 0 });
  const [uiReady, setUiReady] = useState(false);

  // Estabilizar render (evitar warning de React con GestureHandler)
  useEffect(() => {
    const id = requestAnimationFrame(() => setUiReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // useEffect(() => {
  //   const resetOnboarding = async () => {
  //     await AsyncStorage.multiRemove([
  //       '@gtavi_onboarding_completed',
  //       '@gtavi_notifs_prompted_at',
  //       '@gtavi_notifs_rejected_at',
  //     ]);
  //     console.log('Onboarding storage cleared');
  //   };
  //   if (__DEV__) resetOnboarding();
  // }, []);
  

  // Flujo legacy: solo si el onboarding está deshabilitado
  // No inicializar automáticamente: gating 100% por consentimiento

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        {/* Banner visual de estado de notificaciones */}
        {/* <View style={styles.banner}>
          {notifStatus.status === 'pending' && <Text style={styles.text}>🔄 Registrando notificaciones...</Text>}
          {notifStatus.status === 'success' && <Text style={styles.text}>✅ Notificaciones registradas. PlayerID: {notifStatus.playerId}</Text>}
          {notifStatus.status === 'error' && <Text style={styles.text}>❌ Error: {notifStatus.message}</Text>}
        </View> */}
        
        {/* Para probar la internacionalización, descomenta la línea siguiente y comenta TikTokNavigator */}
        {/* <LanguageTest /> */}
        {/* <SimpleTest /> */}
        {/* Mostrar navegación principal siempre; overlay solo como guía visual y nunca en la última página */}
        <TikTokNavigator
          onIndexChange={(i, total) => setOverlayState({ index: i, total })}
          onTotalPages={(total) => setOverlayState((s) => ({ ...s, total }))}
        />
        <OnboardingOverlay
          visible={
            uiReady && onboardingEnabled &&
            !isCompleted &&
            overlayState.total > 0 &&
            overlayState.index < overlayState.total - 1
          }
          currentIndex={overlayState.index}
          total={overlayState.total}
          isFinal={false}
        />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    padding: 8,
    backgroundColor: '#222',
    alignItems: 'center',
    zIndex: 100,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
  success: {
    color: '#4caf50',
  },
  error: {
    color: '#ff5252',
  },
});
