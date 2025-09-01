import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { addPhoto } from '../lib/storage';
import { Photo } from '../lib/types';
import { Api, postJSON } from '../lib/api';

export default function CameraScreen() {
  const [busy, setBusy] = useState(false);

  const takePhoto = async () => {
    try {
      setBusy(true);
      // Permissions
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== 'granted') {
        Alert.alert('Permission', 'Caméra non autorisée');
        return;
      }
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission', 'Localisation non autorisée');
        return;
      }

      // Launch camera
      const shot = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        exif: false,
      });
      if (shot.canceled) return;

      const asset = shot.assets[0];
      const now = new Date();
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // Persist file into app dir
      const dir = FileSystem.documentDirectory + 'photos/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const fileName = `photo-${now.getTime()}.jpg`;
      const dest = dir + fileName;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });

      const p: Photo = {
        id: String(now.getTime()),
        uri: dest,
        dateISO: now.toISOString(),
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      // Sauvegarde locale
      await addPhoto(p);

      // 🔌 Sync backend (best effort)
      try {
        await postJSON(Api.photos, {
          uri: p.uri,
          latitude: p.latitude,
          longitude: p.longitude,
          dateISO: p.dateISO,
        });
      } catch (err: any) {
        console.warn('Sync API échouée :', err?.message || err);
        // On informe l’utilisateur sans bloquer
        Alert.alert('Info', "Photo enregistrée localement. La synchronisation serveur sera retentée plus tard.");
      }

      Alert.alert('🎉 Photo enregistrée !');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erreur', e?.message || 'Impossible de prendre la photo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prendre une photo</Text>
      <Button title={busy ? 'Patientez…' : 'Ouvrir la caméra'} onPress={takePhoto} disabled={busy} />
      <Text style={styles.hint}>
        La photo sera enregistrée avec la date et la position GPS (et envoyée au serveur si disponible).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  hint: { color: '#666', marginTop: 8 },
});
