import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

const { height, width } = Dimensions.get('window');

const OnboardingSlide = ({
  title,
  subtitle,
  image,
  ctaLabel,
  onPressCta,
  showSkip,
  onSkip,
  skipLabel,
}) => {
  return (
    <View style={styles.container}>
      {image ? <Image source={image} style={styles.image} resizeMode="contain" /> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {ctaLabel && onPressCta ? (
        <TouchableOpacity style={styles.ctaButton} onPress={onPressCta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}

      {showSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>{skipLabel || 'Ver la app'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    padding: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default OnboardingSlide;


