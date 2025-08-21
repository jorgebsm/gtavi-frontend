import React, { useEffect, useState } from "react";
import { View, Image, Button, Alert, StyleSheet, Text } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const IMAGE_URL = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&q=80";

export default function TestDownload() {
  const [hasPermission, setHasPermission] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Pedir permiso para escribir en la galería (necesario en iOS/Android)
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleDownload = async () => {
    try {
      if (!hasPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permiso requerido",
            "Necesito acceder a tu galería para guardar imágenes."
          );
          return;
        }
        setHasPermission(true);
      }

      setDownloading(true);

      // Crear carpeta temporal si no existe
      const downloadDir = FileSystem.cacheDirectory + "downloads/";
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Asegurar extensión del archivo (por si la URL no la trae)
      const extMatch = IMAGE_URL.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
      const extension = extMatch ? extMatch[1].toLowerCase() : "jpg";
      const filename = `img_${Date.now()}.${extension}`;
      const fileUri = downloadDir + filename;

      // Descargar la imagen
      const { uri } = await FileSystem.downloadAsync(IMAGE_URL, fileUri);

      // Guardar en la galería del dispositivo
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Listo ✨", "La imagen se guardó en tu galería.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo descargar o guardar la imagen.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Descarga</Text>
      <Image source={{ uri: IMAGE_URL }} style={styles.image} resizeMode="cover" />
      <Button
        title={downloading ? "Descargando..." : "Descargar a la galería"}
        onPress={handleDownload}
        disabled={downloading}
      />
      <Text style={styles.status}>
        Permisos: {hasPermission ? "✅ Concedidos" : "❌ Pendientes"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 450,
    borderRadius: 12,
    marginBottom: 16,
  },
  status: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
});
