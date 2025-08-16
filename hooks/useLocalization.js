import { useState, useEffect } from 'react';
import { t, getCurrentLanguage, setLanguage, isRTL, formatDate } from '../utils/i18n';

export const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [isRightToLeft, setIsRightToLeft] = useState(isRTL());

  // Función para cambiar idioma manualmente
  const changeLanguage = (languageCode) => {
    setLanguage(languageCode);
    setCurrentLanguage(getCurrentLanguage());
    setIsRightToLeft(isRTL());
  };

  // Función de traducción optimizada
  const translate = (key, options = {}) => {
    return t(key, options);
  };

  // Función para formatear fechas
  const formatLocalizedDate = (date, options = {}) => {
    return formatDate(date, options);
  };

  // Información del idioma actual
  const languageInfo = {
    code: currentLanguage,
    isRTL: isRightToLeft,
    name: {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'ar': 'العربية',
      'pl': 'Polski',
      'pt': 'Português',
      'ru': 'Русский',
      'it': 'Italiano',
      'ur': 'اردو',
      'hi': 'हिंदी',
      'th': 'ไทย',
      'de': 'Deutsch',
      'fil': 'Filipino'
    }[currentLanguage] || 'Español'
  };

  return {
    // Estado
    currentLanguage,
    isRTL: isRightToLeft,
    languageInfo,
    
    // Funciones
    t: translate,
    changeLanguage,
    formatDate: formatLocalizedDate,
    
    // Shortcuts para traducciones comunes
    translations: {
      // HomeScreen
      loading: translate('loading'),
      days: translate('days'),
      hours: translate('hours'),
      minutes: translate('minutes'),
      seconds: translate('seconds'),
      
      // NewsScreen
      news: translate('news'),
      swipeForMore: translate('swipeForMore'),
      tapToReadMore: translate('tapToReadMore'),
      
      // TrailersScreen
      trailerTitle: translate('trailerTitle'),
      watchTrailer: translate('watchTrailer'),
      officialTrailer: translate('officialTrailer'),
      
      // LeaksScreen
      leaksTitle: translate('leaksTitle'),
      credibility: translate('credibility'),
      high: translate('high'),
      medium: translate('medium'),
      low: translate('low'),
      daysAgo: translate('daysAgo'),
      unofficialInfo: translate('unofficialInfo'),
      
      // MoreScreen
      moreTitle: translate('moreTitle'),
      extrasTitle: translate('extrasTitle'),
      additionalOptions: translate('additionalOptions'),
      rateApp: translate('rateApp'),
      shareApp: translate('shareApp'),
      language: translate('language'),
      rateDescription: translate('rateDescription'),
      shareDescription: translate('shareDescription'),
      shareMessage: translate('shareMessage'),
      appTitle: translate('appTitle'),
      
      // Detail Screens
      backButton: translate('backButton'),
      shareButton: translate('shareButton'),
      shareLeakText: translate('shareLeakText'),
      shareNewsText: translate('shareNewsText'),
      leakTitle: translate('leakTitle'),
      newsTitle: translate('newsTitle'),
      readMore: translate('readMore'),
      shareError: translate('shareError'),
      unofficialWarning: translate('unofficialWarning'),
      
      // Navigation
      home: translate('home'),
      trailers: translate('trailers'),
      leaks: translate('leaks'),
      more: translate('more'),
      
      // Common
      errorConnection: translate('errorConnection'),
      errorMessage: translate('errorMessage'),
      ok: translate('ok'),
      dateNotAvailable: translate('dateNotAvailable')
    }
  };
};
