import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { translations, supportedLanguages, languageNames } from '../locales';

const LanguageTest = () => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  
  // Función simple de traducción sin hooks
  const t = (key) => {
    try {
      const currentTranslations = translations[currentLanguage] || translations['es'];
      return currentTranslations[key] || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const handleLanguageChange = (langCode) => {
    try {
      setCurrentLanguage(langCode);
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Prueba de Traducciones</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma Actual: {currentLanguage}</Text>
        <Text style={styles.text}>Título: {t('selectLanguage')}</Text>
        <Text style={styles.text}>Footer: {t('languageAppliedToApp')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cambiar Idioma:</Text>
        {supportedLanguages.map((langCode) => (
          <TouchableOpacity
            key={langCode}
            style={[
              styles.langButton,
              currentLanguage === langCode && styles.selectedLangButton
            ]}
            onPress={() => handleLanguageChange(langCode)}
          >
            <Text style={[
              styles.langButtonText,
              currentLanguage === langCode && styles.selectedLangButtonText
            ]}>
              {languageNames[langCode]} ({langCode})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pruebas de Traducción:</Text>
        <Text style={styles.text}>Home: {t('home')}</Text>
        <Text style={styles.text}>News: {t('news')}</Text>
        <Text style={styles.text}>Trailers: {t('trailers')}</Text>
        <Text style={styles.text}>Leaks: {t('leaks')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info:</Text>
        <Text style={styles.text}>Idiomas soportados: {supportedLanguages.join(', ')}</Text>
        <Text style={styles.text}>Traducciones disponibles: {Object.keys(translations).join(', ')}</Text>
        <Text style={styles.text}>Traducciones ES: {Object.keys(translations['es'] || {}).length} claves</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  langButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedLangButton: {
    backgroundColor: '#ff6b35',
  },
  langButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  selectedLangButtonText: {
    color: '#1a1a2e',
  },
});

export default LanguageTest;
