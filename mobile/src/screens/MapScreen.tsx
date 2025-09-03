import React, { useEffect, useState } from 'react';
import { View, Modal, Image, Text, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { useIsFocused } from '@react-navigation/native';
import { getPhotos } from '../lib/storage';
import { Photo } from '../lib/types';

export default function MapScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      (async () => setPhotos(await getPhotos()))();
    }
  }, [isFocused]);

  const initial = photos[0]
    ? { latitude: photos[0].latitude, longitude: photos[0].longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.2, longitudeDelta: 0.2 };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initial}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        loadingEnabled
      >
        {/* OSM tiles (nécessite provider Google) */}
        {Platform.OS === 'android' && (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
        )}

        {photos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => setSelected(p)}
          />
        ))}
      </MapView>

      <View style={styles.attribution}>
        <Text style={styles.attrText}>© OpenStreetMap contributors</Text>
      </View>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {selected && (
              <>
                <Image source={{ uri: selected.uri }} style={styles.img} />
                <Text style={styles.caption}>
                  {new Date(selected.dateISO).toLocaleString()} — {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                </Text>
                <Pressable style={styles.btn} onPress={() => setSelected(null)}>
                  <Text style={styles.btnTxt}>Fermer</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  attrText: { fontSize: 12, color: '#333' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  img: { width: '100%', height: 220, borderRadius: 12 },
  caption: { marginTop: 8 },
  btn: { marginTop: 12, backgroundColor: '#111', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '600' },
});
