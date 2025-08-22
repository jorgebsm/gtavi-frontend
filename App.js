import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TikTokNavigator from './components/TikTokNavigator';
import { useInitNotifications } from './services/notifications';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LanguageProvider } from './contexts/LanguageContext';
import { BackgroundProvider } from './contexts/BackgroundContext';
import { AdProvider } from './contexts/AdContext';

const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  // Estado para mostrar el resultado del registro de notificaciones
  const [notifStatus, setNotifStatus] = useState({ status: 'pending', message: '', playerId: '' });

  // Esperar 3s antes de iniciar la solicitud de notificaciones
  // useEffect(() => {
  //   if (isExpoGo) return;
  //   const timer = setTimeout(() => setStartInit(true), 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  if (!isExpoGo) {
    useInitNotifications(setNotifStatus);
  }

  // Componente que ejecuta el hook de inicialización
  // const NotificationsInitRunner = () => {
  //   useInitNotifications(setNotifStatus);
  //   return null;
  // };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <BackgroundProvider>
          <AdProvider>
            <TikTokNavigator />
            {/* <OnboardingOverlay/> */}
          </AdProvider>
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
