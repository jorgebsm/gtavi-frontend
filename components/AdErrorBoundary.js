import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class AdErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error para debugging
    console.error('🚨 Error capturado por AdErrorBoundary:', error);
    console.error('📋 Stack trace:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí podrías enviar el error a un servicio de analytics
    // this.logErrorToService(error, errorInfo);
  }

  // Log del error a servicio externo (opcional)
  logErrorToService(error, errorInfo) {
    try {
      // Ejemplo: enviar a Crashlytics, Sentry, etc.
      console.log('📊 Enviando error a servicio de analytics...');
      
      // Simular envío
      setTimeout(() => {
        console.log('✅ Error enviado a servicio de analytics');
      }, 1000);
      
    } catch (logError) {
      console.error('❌ Error enviando log:', logError);
    }
  }

  // Resetear el error boundary
  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback cuando hay error
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error en Anuncios</Text>
          <Text style={styles.errorMessage}>
            Los anuncios no están disponibles en este momento.
          </Text>
          <Text style={styles.errorSubtitle}>
            La aplicación continuará funcionando normalmente.
          </Text>
          
          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info (Solo Desarrollo):</Text>
              <Text style={styles.debugText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Renderizar children normalmente si no hay error
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#856404',
    opacity: 0.8,
    textAlign: 'center',
  },
  debugContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});

export default AdErrorBoundary;
