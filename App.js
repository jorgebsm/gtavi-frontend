import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TikTokNavigator from './components/TikTokNavigator';
import { useInitNotifications } from './services/notifications';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  // Estado para mostrar el resultado del registro de notificaciones
  const [notifStatus, setNotifStatus] = useState({ status: 'pending', message: '', playerId: '' });

  // Hook modificado para aceptar un callback de estado
  if (!isExpoGo) {
    useInitNotifications(setNotifStatus);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Banner visual de estado de notificaciones */}
      {/* <View style={styles.banner}>
        {notifStatus.status === 'pending' && <Text style={styles.text}>🔄 Registrando notificaciones...</Text>}
        {notifStatus.status === 'success' && <Text style={[styles.text, styles.success]}>✅ Notificaciones registradas. PlayerID: {notifStatus.playerId}</Text>}
        {notifStatus.status === 'error' && <Text style={[styles.text, styles.error]}>❌ Error: {notifStatus.message}</Text>}
      </View> */}
      <TikTokNavigator />
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
