import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { getAdIds } from '../config/admob';
import { Platform } from 'react-native';

// Obtener ID según plataforma y entorno
const unitId = __DEV__ 
  ? TestIds.BANNER  // Test ID
  : getAdIds(Platform.OS).banner; // ID de producción

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
