import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Animated, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useDominantColor } from '@/hooks/useDominantColor';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const DRIVER_IMAGES = {
  'Oscar Piastri': require('../../assets/images/drivers/oscar.png'),
  'Lando Norris': require('../../assets/images/drivers/lando.png'),
  'Charles Leclerc': require('../../assets/images/drivers/charles.png'),
  'Lewis Hamilton': require('../../assets/images/drivers/lewis.png'),
  // Add more driver images as needed
};

const TEAM_IMAGES = {
  'McLaren': require('../../assets/images/team/mclaren.png'),
  'Ferrari': require('../../assets/images/team/ferrari.png'),
  // Add more team images as needed
};

const TEAM_COLORS = {
  'McLaren': '#FF8700',
  'Ferrari': '#DC0000',
  'Red Bull': '#0600EF',
  'Mercedes': '#00D2BE',
  'Aston Martin': '#006F62',
  'Alpine': '#0090FF',
  'Williams': '#005AFF',
  'VCARB': '#6692FF',
  'Sauber': '#52E252',
  'Haas': '#FFFFFF',
};

const TABS: { key: 'drivers' | 'teams'; label: string }[] = [
  { key: 'drivers', label: 'Drivers' },
  { key: 'teams', label: 'Teams' },
];

type DriverStanding = {
  id: string;
  driver_name: string;
  team_name: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  dnfs: number;
  position: number;
  image_url?: string | null;
};

type TeamStanding = {
  id: string;
  team_name: string;
  car_model: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  dnfs: number;
  position: number;
  image_url?: string | null;
};

export default function StandingsScreen() {
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams'>('drivers');
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'drivers') {
      supabase.from('driver_standings').select('*').order('position', { ascending: true }).then(({ data }) => {
        setDrivers((data as DriverStanding[]) || []);
        setLoading(false);
      });
    } else {
      supabase.from('team_standings').select('*').order('position', { ascending: true }).then(({ data }) => {
        setTeams((data as TeamStanding[]) || []);
        setLoading(false);
      });
    }
  }, [activeTab]);

  const animateTab = (nextTab: 'drivers' | 'teams') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderList = () => {
    if (activeTab === 'drivers') {
      return drivers.map((driver) => {
        const imageSrc = DRIVER_IMAGES[driver.driver_name as keyof typeof DRIVER_IMAGES];
        const [firstName, lastName] = driver.driver_name.split(' ');
        return (
          <TouchableOpacity key={driver.id} style={styles.card}>
            <View style={styles.cardImageContainer}>
              {imageSrc ? (
                <Image source={imageSrc} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={styles.cardImageFallback}>
                  <Text style={styles.cardImageFallbackText}>{driver.driver_name[0]}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardPosition}>{String(driver.position).padStart(2, '0')}</Text>
              <Text style={styles.cardName}>
                <Text style={styles.cardFirstName}>{firstName} </Text>
                <Text style={styles.cardLastName}>{lastName}</Text>
              </Text>
              <Text style={styles.cardTeam}>{driver.team_name}</Text>
              <Text style={styles.cardPoints}>{driver.points} PTS</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      });
    }
    return teams.map((team) => {
      const imageSrc = TEAM_IMAGES[team.team_name as keyof typeof TEAM_IMAGES];
      return (
        <TouchableOpacity key={team.id} style={styles.card}>
          <View style={styles.cardImageContainer}>
            {imageSrc ? (
              <Image source={imageSrc} style={styles.cardImage} resizeMode="contain" />
            ) : (
              <View style={styles.cardImageFallback}>
                <Text style={styles.cardImageFallbackText}>{team.team_name[0]}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardPosition}>{String(team.position).padStart(2, '0')}</Text>
            <Text style={styles.cardName}>{team.team_name}</Text>
            <Text style={styles.cardTeam}>{team.car_model}</Text>
            <Text style={styles.cardPoints}>{team.points} PTS</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.standingsOuter}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Standings</Text>
        </View>
        <View style={[styles.tabRow, { marginHorizontal: isSmallScreen ? 40 : 60 }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => {
                if (tab.key !== activeTab) animateTab(tab.key);
              }}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: isSmallScreen ? 8 : 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.listContainer}>{renderList()}</View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  standingsOuter: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingBottom: 80,
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  
  // Tab Section
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: isSmallScreen ? 8 : 10,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabLabel: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#aaaaaa',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  
  // List Section
  listContainer: {
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImageContainer: {
    width: isSmallScreen ? 60 : 80,
    height: isSmallScreen ? 60 : 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageFallbackText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardPosition: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666666',
    fontWeight: '600',
  },
  cardName: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '400',
    color: '#ffffff',
  },
  cardFirstName: {
    fontWeight: '400',
  },
  cardLastName: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTeam: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#aaaaaa',
    fontWeight: '500',
    marginTop: 2,
  },
  cardPoints: {
    fontSize: isSmallScreen ? 16 : 18,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 4,
  },
  chevron: {
    fontSize: isSmallScreen ? 20 : 24,
    color: '#666666',
    marginLeft: 8,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
});