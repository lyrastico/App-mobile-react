import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getPhotos } from '../lib/storage';
import { Photo } from '../lib/types';
import PhotoCard from '../components/PhotoCard';
import { Api, getJSON } from '../lib/api';

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<(Photo & { remoteOnly?: boolean })[]>([]);
  const [date, setDate] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [rayon, setRayon] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    // 1) Local d'abord
    const local = await getPhotos();
    if (local.length > 0) {
      setPhotos(local);
      return;
    }
    // 2) Fallback API si local vide (réinstall)
    try {
      const remote = await getJSON<any[]>(Api.photos);
      const fromApi: (Photo & { remoteOnly: boolean })[] = remote.map(r => ({
        id: String(r.id ?? `${r.date_iso}-${r.latitude}-${r.longitude}`),
        uri: r.uri, // sera un chemin device d'une ancienne install → non lisible ici
        dateISO: r.date_iso || r.dateISO,
        latitude: r.latitude,
        longitude: r.longitude,
        remoteOnly: true,
      }));
      setPhotos(fromApi);
    } catch {
      setPhotos([]); // Pas d'API → vide
    }
  }, []);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const filtered = useMemo(() => {
    return photos.filter(p => {
      if (date && !p.dateISO.startsWith(date)) return false;
      if (lat && lng && rayon) {
        const d = distanceKm({ lat: parseFloat(lat), lng: parseFloat(lng) }, { lat: p.latitude, lng: p.longitude });
        if (isFinite(d) && d > parseFloat(rayon)) return false;
      }
      return true;
    });
  }, [photos, date, lat, lng, rayon]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtrer</Text>
      <View style={styles.filters}>
        <TextInput placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} />
        <TextInput placeholder="Lat" value={lat} onChangeText={setLat} style={styles.input} keyboardType="decimal-pad" />
        <TextInput placeholder="Lng" value={lng} onChangeText={setLng} style={styles.input} keyboardType="decimal-pad" />
        <TextInput placeholder="Rayon (km)" value={rayon} onChangeText={setRayon} style={styles.input} keyboardType="decimal-pad" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PhotoCard p={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucune photo.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minWidth: '45%' },
  empty: { textAlign: 'center', color: '#666', marginTop: 16 },
});
