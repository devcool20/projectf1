import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { teams } from '../../data/teams';
import TeamDetail from '../../components/TeamDetail';
import { View, Text, TouchableOpacity, useWindowDimensions, Platform, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CarLoadingAnimation from '../../components/CarLoadingAnimation';
import { CalendarView } from '@/components/standings/CalendarView';
import { CircuitInfoView } from '@/components/standings/CircuitInfoView';

export default function TeamDetailScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width > 1024;

  const team = teams.find(t => t.name.toLowerCase().replace(/ /g, '-') === String(name).toLowerCase());

  if (!team) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181a20' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Team not found</Text>
      </View>
    );
  }

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
      <TeamDetail team={team} />
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

            {/* Middle Column - Team Detail */}
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
    maxWidth: 900,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
}); 