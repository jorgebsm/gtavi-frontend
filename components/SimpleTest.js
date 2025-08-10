import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleTest = () => {
  // Importar traducciones directamente
  const esTranslations = {
    hello: 'Hola',
    world: 'Mundo',
    test: 'Prueba'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Prueba Simple</Text>
      <Text style={styles.text}>Hola: {esTranslations.hello}</Text>
      <Text style={styles.text}>Mundo: {esTranslations.world}</Text>
      <Text style={styles.text}>Prueba: {esTranslations.test}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
});

export default SimpleTest;
