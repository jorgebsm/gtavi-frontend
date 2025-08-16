import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LanguageSelector = ({ visible, onClose, style }) => {
  const { selectedLanguage, changeLanguage, getAllLanguages, currentLanguageInfo } = useLanguage();
  const { t } = useTranslation();
  const [scaleValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));

  // Validar que las funciones necesarias estén disponibles
  if (!t || typeof t !== 'function') {
    console.warn('LanguageSelector: useTranslation hook not working properly');
    return null;
  }

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLanguageSelect = async (languageCode) => {
    try {
      const success = await changeLanguage(languageCode);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getLanguageFlag = (languageCode) => {
    const flags = {
      'es': '🇪🇸',
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'ar': '🇸🇦',
      'pl': '🇵🇱',
      'pt': '🇧🇷',
    };
    return flags[languageCode] || '🌐';
  };

  // Si no hay idiomas disponibles, no renderizar
  const languages = getAllLanguages();
  if (!languages || !Array.isArray(languages)) {
    console.warn('LanguageSelector: No languages available');
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('selectLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Idioma actual */}
          {/* <View style={styles.currentLanguageContainer}>
            <Text style={styles.currentLanguageLabel}>{t('currentLanguage')}</Text>
            <View style={styles.currentLanguageBadge}>
              <Text style={styles.currentLanguageFlag}>
                {getLanguageFlag(currentLanguageInfo.code)}
              </Text>
              <Text style={styles.currentLanguageName}>
                {currentLanguageInfo.name}
              </Text>
            </View>
          </View> */}

          {/* Lista de idiomas */}
          <ScrollView style={styles.languagesList} showsVerticalScrollIndicator={false}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  language.isSelected && styles.selectedLanguageItem,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.languageFlag}>{getLanguageFlag(language.code)}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageName,
                      language.isSelected && styles.selectedLanguageName
                    ]}>
                      {language.name}
                    </Text>
                    <Text style={[
                      styles.languageCode,
                      language.isSelected && styles.selectedLanguageCode
                    ]}>
                      {language.code.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                {language.isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#ff6b35" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('languageAppliedToApp')}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth - 40,
    maxHeight: screenHeight - 100,
    backgroundColor: '#000000',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: '#ff6b35',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255, 107, 53, 0.3)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLanguageContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.2)',
  },
  currentLanguageLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  currentLanguageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  currentLanguageFlag: {
    fontSize: 20,
    marginRight: 10,
  },
  currentLanguageName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ff6b35',
  },
  languagesList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#ff6b35',
  },
  languageCode: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  selectedLanguageCode: {
    color: 'rgba(255, 107, 53, 0.8)',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default LanguageSelector;
