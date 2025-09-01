import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { getPhotos, groupDates } from '../lib/storage';
import { Photo } from '../lib/types';
import PhotoCard from '../components/PhotoCard';

export default function CalendarScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => setPhotos(await getPhotos()))();
  }, []);

  const marks = useMemo(() => {
    const grouped = groupDates(photos);
    const obj: any = {};
    Object.keys(grouped).forEach(d => {
      obj[d] = { marked: true, dotColor: '#111' };
    });
    if (selected) obj[selected] = { ...obj[selected], selected: true, selectedColor: '#111' };
    return obj;
  }, [photos, selected]);

  const list = selected ? photos.filter(p => p.dateISO.startsWith(selected)) : [];

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={marks}
        onDayPress={(day: DateObject) => setSelected(day.dateString)}
      />
      <View style={{ flex: 1, padding: 12 }}>
        {selected ? (
          <FlatList
            data={list}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => <PhotoCard p={item} />}
            ListEmptyComponent={<Text style={styles.empty}>Aucune photo ce jour.</Text>}
          />
        ) : (
          <Text style={styles.empty}>Sélectionnez une date pour voir les photos.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#666', marginTop: 12 }
});
