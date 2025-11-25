import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { drivers } from '../../data/drivers';
import DriverDetail from '../../components/DriverDetail';
import { View, Text, TouchableOpacity, useWindowDimensions, Platform, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CarLoadingAnimation from '../../components/CarLoadingAnimation';
import { CalendarView } from '@/components/standings/CalendarView';
import { CircuitInfoView } from '@/components/standings/CircuitInfoView';

export default function StandingsDetailScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width > 1024;

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

  const MainContent = () => (
    <View style={{ flex: 1, backgroundColor: '#181a20' }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: isWeb ? 40 : 100, // Adjusted for web
          left: isWeb ? 20 : 2,
          zIndex: 10,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <DriverDetail driverName={driverName} about={about} />
    </View>
  );

  if (isWeb) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.webLayoutContainer}>
            {/* Left Column - Calendar */}
            <View style={styles.webColumnSide}>
              <CalendarView />
            </View>

            {/* Middle Column - Driver Detail */}
            <View style={styles.webColumnMain}>
              <MainContent />
            </View>

            {/* Right Column - Circuit Info */}
            <View style={styles.webColumnSide}>
              <CircuitInfoView />
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainContent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181a20',
  },
  webLayoutContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
    padding: 24,
    gap: 24,
    height: '100%',
  },
  webColumnSide: {
    width: 300,
    height: '90%',
    marginTop: 20,
  },
  webColumnMain: {
    flex: 1,
    height: '100%',
    maxWidth: 900, // Limit width for better readability
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
}); 