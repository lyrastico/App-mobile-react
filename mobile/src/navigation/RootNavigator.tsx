import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CameraScreen from '../screens/CameraScreen';
import MapScreen from '../screens/MapScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PhotosScreen from '../screens/PhotosScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let icon: any = 'image';
          if (route.name === 'Caméra') icon = 'camera';
          if (route.name === 'Carte') icon = 'map';
          if (route.name === 'Calendrier') icon = 'calendar';
          if (route.name === 'Photos') icon = 'images';
          if (route.name === 'Profil') icon = 'person';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Caméra" component={CameraScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Calendrier" component={CalendarScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
