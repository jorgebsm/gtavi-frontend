import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectDeviceLanguage, setLanguage, getCurrentLanguage } from '../utils/i18n';
import { supportedLanguages, languageNames } from '../locales';

const LanguageContext = createContext();

// Exportar el contexto para uso directo si es necesario
export { LanguageContext };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      setIsLoading(true);
      const savedLanguage = await AsyncStorage.getItem('@gtavi_selected_language');
      
      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        setSelectedLanguage(savedLanguage);
        setLanguage(savedLanguage);
      } else {
        // Usar idioma detectado del dispositivo
        const detectedLanguage = detectDeviceLanguage();
        setSelectedLanguage(detectedLanguage);
        setLanguage(detectedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      // Fallback al idioma detectado
      const detectedLanguage = detectDeviceLanguage();
      setSelectedLanguage(detectedLanguage);
      setLanguage(detectedLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (!supportedLanguages.includes(languageCode)) {
        console.warn('Unsupported language:', languageCode);
        return false;
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('@gtavi_selected_language', languageCode);
      
      // Actualizar estado y i18n
      setSelectedLanguage(languageCode);
      setLanguage(languageCode);
      
      return true;
    } catch (error) {
      console.error('Error saving language:', error);
      return false;
    }
  };

  const getLanguageInfo = (languageCode = selectedLanguage) => {
    return {
      code: languageCode,
      name: languageNames[languageCode] || languageCode,
      isSelected: languageCode === selectedLanguage,
      isRTL: languageCode === 'ar' // Solo árabe es RTL
    };
  };

  const getAllLanguages = () => {
    return supportedLanguages.map(code => getLanguageInfo(code));
  };

  const value = {
    // Estado
    selectedLanguage,
    isLoading,
    
    // Funciones
    changeLanguage,
    getLanguageInfo,
    getAllLanguages,
    
    // Información del idioma actual
    currentLanguage: selectedLanguage,
    currentLanguageInfo: getLanguageInfo(selectedLanguage),
    
    // Utilidades
    isRTL: selectedLanguage === 'ar',
    supportedLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
