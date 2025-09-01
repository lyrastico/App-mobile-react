import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo, UserProfile } from './types';

const PHOTOS_KEY = 'photos';
const PROFILE_KEY = 'profile';

export async function getPhotos(): Promise<Photo[]> {
  const raw = await AsyncStorage.getItem(PHOTOS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Photo[]; } catch { return []; }
}

export async function addPhoto(p: Photo): Promise<void> {
  const all = await getPhotos();
  all.unshift(p);
  await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(all));
}

export async function setPhotos(list: Photo[]): Promise<void> {
  await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(list));
}

export async function clearPhotos(): Promise<void> {
  await AsyncStorage.removeItem(PHOTOS_KEY);
}

export async function getProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return { name: 'Voyageur·euse' };
  try { return JSON.parse(raw) as UserProfile; } catch { return { name: 'Voyageur·euse' }; }
}

export async function saveProfile(p: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function groupDates(photos: Photo[]): Record<string, number> {
  return photos.reduce((acc, p) => {
    const d = p.dateISO.slice(0,10);
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function uniqueDaysCount(photos: Photo[]): number {
  return Object.keys(groupDates(photos)).length;
}
