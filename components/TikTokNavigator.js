import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import TrailersScreen from '../screens/TrailersScreen';
import LeaksScreen from '../screens/LeaksScreen';
import MoreScreen from '../screens/MoreScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import LeaksDetailScreen from '../screens/LeaksDetailScreen';
import InterstitialAdScreen from './InterstitialAdScreen';
import adService from '../services/adService';

const { height: screenHeight } = Dimensions.get('window');

const Stack = createStackNavigator();

const screens = [
  { id: 0, component: HomeScreen, name: 'Home' },
  { id: 1, component: TrailersScreen, name: 'Trailers' },
  { id: 2, component: NewsScreen, name: 'News' },
  { id: 3, component: LeaksScreen, name: 'Leaks' },
  { id: 4, component: MoreScreen, name: 'More' },
];

// Componente principal que maneja el scroll vertical
function MainNavigator({ navigation, onIndexChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adConfig, setAdConfig] = useState({});
  const scrollViewRef = useRef(null);
  const previousIndex = useRef(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / screenHeight);
    if (index !== currentIndex) {
      previousIndex.current = currentIndex;
      setCurrentIndex(index);
      if (typeof onIndexChange === 'function') {
        try { onIndexChange(index, screens.length); } catch (_) {}
      }
      
      // Verificar si se debe mostrar anuncio
      checkForAdTransition(previousIndex.current, index);
    }
  };

  // Verificar transición para mostrar anuncios
  const checkForAdTransition = async (fromIndex, toIndex) => {
    const screenNames = ['Home', 'Trailers', 'News', 'Leaks', 'More'];
    const fromScreen = screenNames[fromIndex];
    const toScreen = screenNames[toIndex];
    
    // Verificar si se debe mostrar anuncio
    const shouldShowAd = await adService.handleScreenTransition(fromScreen, toScreen);
    
    if (shouldShowAd) {
      setAdConfig({
        fromScreen,
        toScreen,
        duration: 5, // 5 segundos por defecto
      });
      setShowAd(true);
    }
  };

  // Manejar finalización del anuncio
  const handleAdComplete = () => {
    setShowAd(false);
    // console.log('✅ Anuncio completado');
  };

  // Manejar salto del anuncio
  const handleSkipAd = () => {
    setShowAd(false);
    // console.log('⏭️ Anuncio saltado');
  };

  const renderScreen = (screen, index) => {
    const ScreenComponent = screen.component;
    return (
      <View key={screen.id} style={styles.screenContainer}>
        <ScreenComponent navigation={navigation} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pagingEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
      >
        {screens.map((screen, index) => renderScreen(screen, index))}
      </ScrollView>
      
      {/* Indicadores de página */}
      <View style={styles.pageIndicators}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Modal de anuncio intersticial */}
      <Modal
        visible={showAd}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAd(false)}
      >
        <InterstitialAdScreen
          onAdComplete={handleAdComplete}
          onSkipAd={handleSkipAd}
          adDuration={adConfig.duration || 5}
        />
      </Modal>
    </View>
  );
}

export default function TikTokNavigator({ onIndexChange, onTotalPages }) {
  // Inicializar servicio de anuncios
  useEffect(() => {
    const initAds = async () => {
      try {
        await adService.initialize();
        // console.log('🚀 Servicio de anuncios inicializado en TikTokNavigator');
      } catch (error) {
        console.error('❌ Error inicializando anuncios:', error);
      }
    };

    initAds();
    if (typeof onTotalPages === 'function') {
      try { onTotalPages(screens.length); } catch (_) {}
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main">
          {(props) => <MainNavigator {...props} onIndexChange={onIndexChange} />}
        </Stack.Screen>
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="LeaksDetail" component={LeaksDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    height: screenHeight * screens.length,
  },
  screenContainer: {
    height: screenHeight,
  },
  pageIndicators: {
    position: 'absolute',
    right: 2.5,
    top: '50%',
    transform: [{ translateY: -50 }],
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 4,
  },
  activeIndicator: {
    backgroundColor: '#ff6b35',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 