import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import TrailersScreen from '../screens/TrailersScreen';
import LeaksScreen from '../screens/LeaksScreen';
import MoreScreen from '../screens/MoreScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import LeaksDetailScreen from '../screens/LeaksDetailScreen';

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
function MainNavigator({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / screenHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
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
    </View>
  );
}

export default function TikTokNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainNavigator} />
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
    right: 24,
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