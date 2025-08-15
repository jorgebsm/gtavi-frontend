import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const InterstitialAdScreen = ({ onAdComplete, onSkipAd, adDuration = 5 }) => {
  const [timeLeft, setTimeLeft] = useState(adDuration);
  const [isLoading, setIsLoading] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Callbacks seguros para evitar re-renderizados
  const handleAdComplete = useCallback(() => {
    if (onAdComplete) {
      onAdComplete();
    }
  }, [onAdComplete]);

  const handleSkipAd = useCallback(() => {
    if (onSkipAd) {
      onSkipAd();
    }
  }, [onSkipAd]);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Simular carga del anuncio
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setCanSkip(true);
    }, 2000);

    // Contador regresivo
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          // Usar setTimeout para evitar setState durante render
          setTimeout(() => {
            handleAdComplete();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animación de progreso
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: adDuration * 1000,
      useNativeDriver: false,
    }).start();

    return () => {
      clearTimeout(loadTimer);
      clearInterval(countdownTimer);
    };
  }, [handleAdComplete, adDuration, fadeAnim, scaleAnim, progressAnim]);

  const handleSkip = () => {
    if (canSkip) {
      handleSkipAd();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6b35" />
            <Text style={styles.loadingText}>Cargando anuncio...</Text>
            <Text style={styles.loadingSubtext}>Por favor espera</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        {/* Header con logo y tiempo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>GTA VI</Text>
            <Text style={styles.logoSubtext}>Countdown</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Tiempo restante</Text>
            <Text style={styles.timeValue}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Contenido principal del anuncio */}
        <View style={styles.adContent}>
          <Animated.View
            style={[
              styles.adPlaceholder,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.adIcon}>
              <Text style={styles.adIconText}>📱</Text>
            </View>
            <Text style={styles.adTitle}>Anuncio</Text>
            <Text style={styles.adSubtitle}>Contenido patrocinado</Text>
            
            {/* Barra de progreso */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </Animated.View>
        </View>

        {/* Botón de saltar */}
        <View style={styles.footer}>
          {canSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Saltar anuncio</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.footerText}>
            Gracias por tu paciencia
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a', // Color sólido en lugar de gradiente
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: -5,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  adContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  adPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    minHeight: 300,
    justifyContent: 'center',
  },
  adIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  adIconText: {
    fontSize: 40,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  adSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff6b35',
    marginBottom: 16,
  },
  skipButtonText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default InterstitialAdScreen;
