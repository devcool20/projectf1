import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { drivers } from '../../data/drivers';
import DriverDetail from '../../components/DriverDetail';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StandingsDetailScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  // Convert slug to full name (e.g., max-verstappen -> Max Verstappen)
  const driverName = name
    ? String(name)
        .split('-')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    : undefined;

  // Fetch about from drivers.ts
  const driverStatic = drivers.find(d => d.name === driverName);
  const about = driverStatic ? driverStatic.about : '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#181a20' }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 76,
            left: 2,
            zIndex: 10,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <DriverDetail driverName={driverName} about={about} />
      </View>
    </>
  );
} 