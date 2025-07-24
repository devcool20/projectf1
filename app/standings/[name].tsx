import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { drivers } from '../../data/drivers';
import DriverDetail from '../../components/DriverDetail';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StandingsDetailScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const driver = drivers.find(d => d.name.toLowerCase().replace(/ /g, '-') === String(name).toLowerCase());

  if (!driver) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181a20' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Driver not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#181a20' }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 36,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 20,
            padding: 6,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <DriverDetail driver={driver} />
      </View>
    </>
  );
} 