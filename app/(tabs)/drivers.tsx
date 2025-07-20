import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { LockedScreen } from '@/components/auth/LockedScreen';

// Mock drivers data
const mockDrivers = [
  {
    id: 1,
    name: 'Max Verstappen',
    team: 'Red Bull Racing',
    number: 1,
    nationality: 'Dutch',
    points: 575,
    wins: 19,
  },
  {
    id: 2,
    name: 'Lewis Hamilton',
    team: 'Mercedes',
    number: 44,
    nationality: 'British',
    points: 234,
    wins: 0,
  },
  {
    id: 3,
    name: 'Charles Leclerc',
    team: 'Ferrari',
    number: 16,
    nationality: 'Monegasque',
    points: 308,
    wins: 0,
  },
  {
    id: 4,
    name: 'Lando Norris',
    team: 'McLaren',
    number: 4,
    nationality: 'British',
    points: 337,
    wins: 0,
  },
  {
    id: 5,
    name: 'Carlos Sainz',
    team: 'Ferrari',
    number: 55,
    nationality: 'Spanish',
    points: 200,
    wins: 1,
  },
];

export default function DriversScreen() {
  const { session, triggerOnboarding } = useAuth();
  const [drivers, setDrivers] = useState(mockDrivers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrivers = async () => {
    // In a real app, this would fetch from an API
    setLoading(true);
    setTimeout(() => {
      setDrivers(mockDrivers);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const handleGetStarted = () => {
    triggerOnboarding();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading drivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>F1 Drivers</Text>
          <Text style={styles.subtitle}>Meet the drivers of the 2024 season</Text>
          
          {/* Drivers List */}
          <View style={styles.driversSection}>
            {drivers.map((driver) => (
              <View key={driver.id} style={styles.driverItem}>
                <View style={styles.driverHeader}>
                  <View style={styles.driverNumber}>
                    <Text style={styles.numberText}>{driver.number}</Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverTeam}>{driver.team}</Text>
                  </View>
                  <View style={styles.driverStats}>
                    <Text style={styles.statText}>{driver.points} pts</Text>
                    <Text style={styles.statText}>{driver.wins} wins</Text>
                  </View>
                </View>
                <View style={styles.driverFooter}>
                  <Text style={styles.nationalityText}>{driver.nationality}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Locked Screen for non-authenticated users */}
      {!session && (
        <LockedScreen
          onGetStarted={handleGetStarted}
          title="Unlock Driver Profiles"
          subtitle="Sign up to follow your favorite drivers, track their stats, and get personalized updates!"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    fontFamily: 'RacingSansOne',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  driversSection: {
    marginTop: 20,
  },
  driverItem: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  driverTeam: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  driverStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  driverFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 12,
  },
  nationalityText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
  },
});
