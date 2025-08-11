import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useLaunchDate } from '../hooks/useApiMultiLang';
import { useLocalization } from '../hooks/useLocalization';
import LottieView from 'lottie-react-native';

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Estado para el loading
  const [isLoading, setIsLoading] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);

  // Hook de localización
  const { translations, isRTL } = useLocalization();

  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Obtener fecha de lanzamiento desde el backend con soporte multi-idioma
  const { data: launchDateData, loading, error } = useLaunchDate();

  // Fecha de lanzamiento por defecto si no hay datos del backend
  const defaultLaunchDate = new Date('2026-05-26T00:00:00Z');
  const launchDate = launchDateData?.data?.releaseDate ? new Date(launchDateData.data.releaseDate) : defaultLaunchDate;

  // Usar el cálculo del servidor si está disponible, sino calcular localmente
  const serverTimeRemaining = launchDateData?.data?.timeRemaining;
  
  // Efecto para cambiar el estado de loading cuando los datos estén listos
  useEffect(() => {
    if (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) {
      setIsLoading(false);
      // Pequeño delay para la transición suave
      setTimeout(() => setShowCountdown(true), 10);
    }
  }, [timeLeft]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // Si tenemos datos del servidor, usarlos como base y actualizar solo los segundos
      if (serverTimeRemaining && !serverTimeRemaining.isReleased) {
        const now = new Date();
        const serverCalculatedAt = new Date(serverTimeRemaining.calculatedAt);
        const secondsDiff = Math.floor((now - serverCalculatedAt) / 1000);
        
        let newSeconds = serverTimeRemaining.seconds - secondsDiff;
        let newMinutes = serverTimeRemaining.minutes;
        let newHours = serverTimeRemaining.hours;
        let newDays = serverTimeRemaining.days;
        
        // Ajustar cuando los segundos bajan de 0
        if (newSeconds < 0) {
          newSeconds += 60;
          newMinutes--;
          if (newMinutes < 0) {
            newMinutes += 60;
            newHours--;
            if (newHours < 0) {
              newHours += 24;
              newDays--;
            }
          }
        }
        
        setTimeLeft({ 
          days: Math.max(0, newDays), 
          hours: Math.max(0, newHours), 
          minutes: Math.max(0, newMinutes), 
          seconds: Math.max(0, newSeconds) 
        });
      } else {
        // Cálculo local como fallback
        const now = new Date().getTime();
        const distance = launchDate.getTime() - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          // GTA VI ya fue lanzado
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate, serverTimeRemaining]);

  // Mostrar error si hay problemas con la API
  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       'Error de conexión',
  //       'No se pudo conectar con el servidor. Usando fecha por defecto.',
  //       [{ text: 'OK' }]
  //     );
  //   }
  // }, [error]);

  // Mostrar loading mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // No necesitamos verificar fuentes

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradiente de fondo */}
      <View style={styles.backgroundGradient} />
      
      {/* Efectos de partículas */}
      <View style={styles.particlesContainer}>
        {/* <View style={[styles.particle, styles.particle1]} /> */}
        {/* <View style={[styles.particle, styles.particle2]} /> */}
        {/* <View style={[styles.particle, styles.particle3]} /> */}
        {/* <View style={[styles.particle, styles.particle4]} /> */}
        {/* <View style={[styles.particle, styles.particle5]} /> */}
        {/* <View style={[styles.particle, styles.particle6]} /> */}
      </View>
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Imagen de GTA VI */}
        <View style={styles.fixedLogoContainer}>
          {/* Animación de Lottie detrás del logo */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/animations/wave.json')}
              style={styles.lottieAnimation}
              autoPlay
              loop
              speed={1.8}
            />
          </View>
          <Image 
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Contenido dinámico para loading y countdown */}
        <View style={styles.dynamicContent}>
          {isLoading ? (
            // Animación de loading con transición
            <LottieView 
              source={require('../assets/animations/loading.json')}
              style={[styles.loadingLottieAnimation, { opacity: isLoading ? 1 : 0 }]}
              autoPlay
              loop
              speed={1}
            />
          ) : (
            // Countdown con transición suave
            <View style={[styles.countdownContainer, { opacity: showCountdown ? 1 : 0 }]}>
              {/* Contador de días */}
              <View style={styles.daysContainer}>
                <Text style={styles.daysNumber}>{timeLeft.days}</Text>
                <Text style={[styles.daysLabel, isRTL && styles.rtlText]}>{translations.days}</Text>
              </View>

              {/* Contador de tiempo */}
              <View style={[styles.timeContainer, isRTL && styles.rtlContainer]}>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
                  <Text style={[styles.timeLabel, isRTL && styles.rtlText]}>{translations.hours}</Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
                  <Text style={[styles.timeLabel, isRTL && styles.rtlText]}>{translations.minutes}</Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
                  <Text style={[styles.timeLabel, isRTL && styles.rtlText]}>{translations.seconds}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f23',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 50,
  },
  particle1: {
    width: 8,
    height: 8,
    top: '20%',
    left: '15%',
  },
  particle2: {
    width: 12,
    height: 12,
    top: '60%',
    right: '20%',
  },
  particle3: {
    width: 6,
    height: 6,
    top: '80%',
    left: '25%',
  },
  particle4: {
    width: 10,
    height: 10,
    top: '30%',
    right: '10%',
  },
  particle5: {
    width: 8,
    height: 8,
    top: '30%',
    left: '15%',
  },
  particle6: {
    width: 14,
    height: 14,
    top: '10%',
    right: '25%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    zIndex: 2,
  },
  imageContainer: {
    marginBottom: 0,
    alignItems: 'center',
  },
  lottieContainer: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    zIndex: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainerLoading: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    zIndex: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimationLoading: {
    width: 500,
    height: 500,
    opacity: 1,
    top: 0
  },
  lottieAnimation: {
    width: 500,
    height: 500,
    opacity: 0.3,
    top: 100
  },
  logoImage: {
    width: 300,
    height: 300,
    // borderRadius: 10,
  },
  daysContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  daysNumber: {
    fontSize: 120,
    fontFamily: 'Poppins_700Bold',
    color: '#ff6b35',
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  daysLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  timeNumber: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    marginBottom: 5,
  },
  timeLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1,
  },
  timeSeparator: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#ff6b35',
    marginHorizontal: 5,
  },
  // Estilos RTL
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  fixedLogoContainer: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: [{ translateX: -150 }],
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dynamicContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }],
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
  },
  loadingLottieAnimation: {
    width: 200,
    height: 200,
    opacity: 1,
    top: 100
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-in-out',
  },
}); 