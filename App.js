import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TikTokNavigator from './components/TikTokNavigator';
import { requestAndRegisterNotifications, initializeOneSignal } from './services/notifications';
import { OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';
import React, { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import { LanguageProvider } from './contexts/LanguageContext';
import { isOnboardingEnabled, setRemoteOnboardingEnabled } from './config/featureFlags';
import { configurationsService } from './services/api';
import useOnboardingStatus from './hooks/useOnboardingStatus';
import OnboardingOverlay from './components/OnboardingOverlay';
import { BackgroundProvider } from './contexts/BackgroundContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  // Estado para mostrar el resultado del registro de notificaciones
  const [notifStatus, setNotifStatus] = useState({ status: 'pending', message: '', playerId: '' });
  const { isCompleted, markCompleted } = useOnboardingStatus();
  const onboardingEnabled = isOnboardingEnabled();
  const [overlayState, setOverlayState] = useState({ index: 0, total: 0 });
  const [uiReady, setUiReady] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  // Estabilizar render (evitar warning de React con GestureHandler)
  useEffect(() => {
    const id = requestAnimationFrame(() => setUiReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Cargar ONBOARDING_ENABLED desde backend
  useEffect(() => {
    (async () => {
      try {
        const res = await configurationsService.getByKey('onboarding_enabled');
        const enabled = res?.data?.data?.value;
        if (typeof enabled === 'boolean') setRemoteOnboardingEnabled(enabled);
      } catch (_) {}
      finally { setConfigLoaded(true); }
    })();
  }, []);

  // Solicitar notificaciones con flujo explícito cuando el onboarding está deshabilitado
  const requestedNotifsRef = useRef(false);
  useEffect(() => {
    if (configLoaded && !onboardingEnabled && !requestedNotifsRef.current && !isExpoGo) {
      requestedNotifsRef.current = true;
      requestAndRegisterNotifications(setNotifStatus);
    }
  }, [configLoaded, onboardingEnabled]);

  // Si el onboarding está habilitado, pero el dispositivo ya tiene notificaciones activas (playerId u optedIn), saltar onboarding
  useEffect(() => {
    (async () => {
      if (!configLoaded || !onboardingEnabled || isExpoGo) return;
      try {
        initializeOneSignal();
        const sub = await OneSignal.User.pushSubscription;
        const hasId = !!sub?.id;
        const optedIn = sub?.optedIn === true;
        const persisted = (await AsyncStorage.getItem('@gtavi_notifs_registered')) === 'true';
        if (hasId || optedIn || persisted) {
          setSkipOnboarding(true);
          try { await AsyncStorage.setItem('@gtavi_notifs_registered', 'true'); } catch(_) {}
          try { await markCompleted(); } catch(_) {}
        }
      } catch (_) {}
    })();
  }, [configLoaded, onboardingEnabled]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <BackgroundProvider>
          <TikTokNavigator
            onIndexChange={(i, total) => setOverlayState({ index: i, total })}
            onTotalPages={(total) => setOverlayState((s) => ({ ...s, total }))}
          />
          <OnboardingOverlay
            visible={
              uiReady && configLoaded && onboardingEnabled && !skipOnboarding &&
              !isCompleted &&
              overlayState.total > 0 &&
              overlayState.index < overlayState.total - 1
            }
            currentIndex={overlayState.index}
            total={overlayState.total}
            isFinal={false}
          />
        </BackgroundProvider>
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
