import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { getPhotos, getProfile as getLocalProfile, saveProfile as saveLocalProfile, uniqueDaysCount } from '../lib/storage';
import { Photo, UserProfile } from '../lib/types';
import { Api, getJSON, postJSON } from "../lib/api";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>({ name: '' });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // Local d’abord (optimiste)
      const local = await getLocalProfile();
      setProfile(local);
      setPhotos(await getPhotos());

      // Puis serveur (si dispo)
      try {
        const remote = await getJSON<UserProfile>(Api.profile);
        if (remote && remote.name) {
          setProfile(remote);
          // garde aussi une copie locale
          await saveLocalProfile(remote);
        }
      } catch { /* API pas joignable = on reste sur le local */ }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      // Sauvegarde locale immédiate
      await saveLocalProfile(profile);

      // Sauvegarde serveur (best-effort)
      try {
        await postJSON<UserProfile>(Api.profile, profile); // POST /profile
        Alert.alert('✅ Profil sauvegardé');
      } catch (e:any) {
        Alert.alert('Info', "Profil enregistré localement. La synchro serveur a échoué.");
      }
    } finally {
      setSaving(false);
    }
  };

  const days = uniqueDaysCount(photos);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <Text>Nom</Text>
      <TextInput style={styles.input} value={profile.name} onChangeText={(t) => setProfile({ ...profile, name: t })} />

      <Text>Email</Text>
      <TextInput style={styles.input} value={profile.email || ''} onChangeText={(t) => setProfile({ ...profile, email: t })} />

      <Text>Bio</Text>
      <TextInput style={[styles.input, {height: 80}]} multiline value={profile.bio || ''} onChangeText={(t) => setProfile({ ...profile, bio: t })} />

      <Button title={saving ? "Enregistrement..." : "Enregistrer"} onPress={onSave} disabled={saving} />

      <View style={styles.stats}>
        <Text style={styles.stat}>📸 {photos.length} photos</Text>
        <Text style={styles.stat}>🗓️ {days} jours</Text>
      </View>

      <Button title="Tester l'API" onPress={async () => {
        try { const res = await getJSON(Api.health); Alert.alert("API OK", JSON.stringify(res,null,2)); }
        catch (e:any) { Alert.alert("API KO", e?.message ?? "échec"); }
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 },
  stats: { marginTop: 16, gap: 8 },
  stat: { fontWeight: '600' },
});
