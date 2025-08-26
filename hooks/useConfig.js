import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configurationsService } from '../services/api';

const CONFIG_STORAGE_KEY = 'ads_wallpapers';

export const useConfig = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      
    //   console.log('🔄 Cargando configuración desde API...');
      
      // Obtener configuración desde el backend
      const adsConfig = await configurationsService.getByKey('ads_wallpapers');
      const adsEnabled = adsConfig.data?.value !== undefined ? adsConfig.data.value : true;
      
    //   console.log('📡 Configuración obtenida:', adsEnabled);
      
      // Guardar en storage
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(adsEnabled));
    //   console.log('💾 Configuración guardada en storage:', adsEnabled);
      
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      
      // En caso de error, usar valor por defecto
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(true));
    //   console.log('⚠️ Usando valor por defecto: true');
    } finally {
      setIsLoading(false);
    }
  };

  const getAdsEnabled = async () => {
    try {
      const storedValue = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      const adsEnabled = storedValue ? JSON.parse(storedValue) : true;
      
    //   console.log('🔍 Valor del storage:', adsEnabled);
      return adsEnabled;
    } catch (error) {
      console.error('❌ Error leyendo storage:', error);
      return true; // Por defecto habilitado
    }
  };

  return {
    isLoading,
    getAdsEnabled
  };
};
