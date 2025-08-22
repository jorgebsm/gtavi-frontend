import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useInitNotifications } from '../services/notifications';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export default function SafeInitializer({ children, onInitComplete }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [notifStatus, setNotifStatus] = useState({ status: 'pending', message: '', playerId: '' });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Iniciando aplicación de forma segura...');
        
        // Esperar un poco para que la app se estabilice
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Inicializar notificaciones solo si no es Expo Go
        if (!isExpoGo) {
          console.log('📱 Inicializando notificaciones...');
          // El hook useInitNotifications se ejecutará automáticamente
        }
        
        // Marcar como inicializada
        setIsInitialized(true);
        console.log('✅ Aplicación inicializada correctamente');
        
        if (onInitComplete) {
          onInitComplete();
        }
      } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        setInitError(error.message || 'Error desconocido durante la inicialización');
        // Aún así, permitir que la app continúe
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Mostrar pantalla de carga mientras se inicializa
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Iniciando aplicación...</Text>
        {initError && (
          <Text style={styles.errorText}>Error: {initError}</Text>
        )}
      </View>
    );
  }

  // Renderizar children una vez inicializada
  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
