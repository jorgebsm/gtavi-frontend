import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testBackendConnection, testNotificationsStatus } from '../services/api';

const BackendConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [notificationsStatus, setNotificationsStatus] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testBackendConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        Alert.alert('✅ Conexión Exitosa', result.message);
      } else {
        Alert.alert('❌ Error de Conexión', result.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error inesperado al probar conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await testNotificationsStatus();
      setNotificationsStatus(result);
      
      if (result.success) {
        Alert.alert('✅ Notificaciones OK', result.message);
      } else {
        Alert.alert('❌ Error Notificaciones', result.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error inesperado al probar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Pruebas de Conexión</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Probando...' : 'Probar Conexión Backend'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={testNotifications}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Probando...' : 'Probar Estado Notificaciones'}
        </Text>
      </TouchableOpacity>

      {connectionStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Estado de Conexión:</Text>
          <Text style={[
            styles.statusText, 
            connectionStatus.success ? styles.successText : styles.errorText
          ]}>
            {connectionStatus.success ? '✅ Conectado' : '❌ Error'}
          </Text>
          <Text style={styles.statusMessage}>{connectionStatus.message}</Text>
        </View>
      )}

      {notificationsStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Estado de Notificaciones:</Text>
          <Text style={[
            styles.statusText, 
            notificationsStatus.success ? styles.successText : styles.errorText
          ]}>
            {notificationsStatus.success ? '✅ Funcionando' : '❌ Error'}
          </Text>
          <Text style={styles.statusMessage}>{notificationsStatus.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  successText: {
    color: '#34C759',
  },
  errorText: {
    color: '#FF3B30',
  },
  statusMessage: {
    fontSize: 12,
    color: '#666',
  },
});

export default BackendConnectionTest; 