import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Photo } from '../lib/types';

export default function PhotoCard({ p }: { p: Photo & { remoteOnly?: boolean } }) {
  const isLocalFile = typeof p.uri === 'string' && p.uri.startsWith('file://');

  return (
    <View>
      {isLocalFile ? (
        <Image source={{ uri: p.uri }} style={{ width: '100%', height: 180, borderRadius: 12 }} />
      ) : (
        <View style={{ height: 180, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' }}>
          <Text>📄 Métadonnée (image indisponible)</Text>
        </View>
      )}
      <Text>{new Date(p.dateISO).toLocaleString()}</Text>
      <Text>{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', marginVertical: 8, elevation: 2 },
  img: { width: '100%', height: 180 },
  meta: { padding: 10 },
  title: { fontWeight: '600' },
  coords: { color: '#666', marginTop: 4 },
});
