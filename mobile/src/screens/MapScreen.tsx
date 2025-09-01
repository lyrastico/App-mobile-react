import React, { useEffect, useState } from 'react';
import { View, Modal, Image, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getPhotos } from '../lib/storage';
import { Photo } from '../lib/types';

export default function MapScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    (async () => setPhotos(await getPhotos()))();
  }, []);

  const initial = photos[0] ? {
    latitude: photos[0].latitude,
    longitude: photos[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.2, longitudeDelta: 0.2 };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initial}>
        {photos.map(p => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => setSelected(p)} />
        ))}
      </MapView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {selected && <>
              <Image source={{ uri: selected.uri }} style={styles.img} />
              <Text style={styles.caption}>
                {new Date(selected.dateISO).toLocaleString()} — {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
              </Text>
              <Pressable style={styles.btn} onPress={() => setSelected(null)}>
                <Text style={styles.btnTxt}>Fermer</Text>
              </Pressable>
            </>}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  img: { width: '100%', height: 220, borderRadius: 12 },
  caption: { marginTop: 8 },
  btn: { marginTop: 12, backgroundColor: '#111', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '600' },
});
