import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';

const DownloadProgress = ({ progress, isVisible }) => {
  const { translations } = useLocalization();
  
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Ionicons name="download" size={24} color="#ff6b35" />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
      <Text style={styles.statusText}>{translations.downloadingWallpaper}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    minWidth: 40,
    textAlign: 'right',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default DownloadProgress;
