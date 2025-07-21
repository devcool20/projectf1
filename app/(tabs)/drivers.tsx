import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Animated, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useDominantColor } from '@/hooks/useDominantColor';

const { width: screenWidth } = Dimensions.get('window');

const DRIVER_IMAGES = {
  'Oscar Piastri': require('../../assets/images/drivers/oscar.png'),
  'Lando Norris': require('../../assets/images/drivers/lando.png'),
  'Charles Leclerc': require('../../assets/images/drivers/charles.png'),
  'Lewis Hamilton': require('../../assets/images/drivers/lewis.png'),
};
const TEAM_IMAGES = {
  'McLaren': require('../../assets/images/team/mclaren.png'),
  'Ferrari': require('../../assets/images/team/ferrari.png'),
};

const TABS: { key: 'drivers' | 'teams'; label: string }[] = [
  { key: 'drivers', label: 'DRIVERS' },
  { key: 'teams', label: 'TEAMS' },
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

  // Helper to get hero image src
  const getHeroImageSrc = useCallback(() => {
    if (activeTab === 'drivers' && drivers.length > 0) {
      return DRIVER_IMAGES[drivers[0].driver_name as keyof typeof DRIVER_IMAGES];
    }
    if (activeTab === 'teams' && teams.length > 0) {
      return TEAM_IMAGES[teams[0].team_name as keyof typeof TEAM_IMAGES];
    }
    return undefined;
  }, [activeTab, drivers, teams]);

  const renderHero = () => {
    if (activeTab === 'drivers' && drivers.length > 0) {
      const leader = drivers[0];
      const driverImage = DRIVER_IMAGES[leader.driver_name as keyof typeof DRIVER_IMAGES];
      
      return (
        <View style={styles.heroSection}>
          {driverImage ? (
            <Image 
              source={driverImage}
              style={styles.heroImageDrivers} 
              resizeMode="cover" 
            />
          ) : (
            <View style={[styles.heroImageDrivers, styles.fallbackImage]}>
              <Text style={styles.fallbackText}>{leader.driver_name}</Text>
            </View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)', 'transparent']}
            style={styles.heroOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroNumber}>#1</Text>
            </View>
            <View style={styles.heroBottomRowDrivers}>
              <View style={styles.heroStatsOverlayDrivers}>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.points}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>POINTS</Text>
                </View>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.wins}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>WINS</Text>
                </View>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.podiums}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>PODIUMS</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }
    if (activeTab === 'teams' && teams.length > 0) {
      const leader = teams[0];
      const teamImage = TEAM_IMAGES[leader.team_name as keyof typeof TEAM_IMAGES];
      
      return (
        <View style={styles.heroSection}>
          {teamImage ? (
            <Image 
              source={teamImage}
              style={styles.heroImageTeams} 
              resizeMode="cover" 
            />
          ) : (
            <View style={[styles.heroImageTeams, styles.fallbackImage]}>
              <Text style={styles.fallbackText}>{leader.team_name}</Text>
            </View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)', 'transparent']}
            style={styles.heroOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroTopRowTeams}>
              <Text style={styles.heroNumber}>#1</Text>
              <View style={styles.heroStatsOverlayTeams}>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.points}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>POINTS</Text>
                </View>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.wins}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>WINS</Text>
                </View>
                <View style={styles.heroStatOverlayItemSmall}>
                  <Text style={styles.heroStatOverlayValueSmall}>{leader.podiums}</Text>
                  <Text style={styles.heroStatOverlayLabelSmall}>PODIUMS</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderList = () => {
    if (activeTab === 'drivers') {
      return drivers.map((driver, idx) => (
        <View key={driver.id} style={styles.listRow}>
          <Text style={styles.position}>{String(driver.position).padStart(2, '0')}</Text>
          <Text style={styles.name}>{driver.driver_name}</Text>
          <Text style={styles.team}>{driver.team_name}</Text>
          <Text style={styles.points}>{driver.points} pts</Text>
                  </View>
      ));
    }
    return teams.map((team, idx) => (
      <View key={team.id} style={styles.listRow}>
        <Text style={styles.position}>{String(team.position).padStart(2, '0')}</Text>
        <Text style={styles.name}>{team.team_name}</Text>
        <Text style={styles.car}>{team.car_model}</Text>
        <Text style={styles.points}>{team.points} pts</Text>
                  </View>
    ));
  };

  const heroImageSrc = getHeroImageSrc() || '';
  const bgColor = useDominantColor(heroImageSrc, '#222');

  return (
    <LinearGradient
      colors={[bgColor, 'rgba(255,255,255,0.95)', '#ffffff']}
      style={styles.gradientBg}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.standingsOuter}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>F1 STANDINGS</Text>
            <Text style={styles.headerSubtitle}>2024 Championship</Text>
          </View>
          <View style={styles.tabRow}>
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
                <ActivityIndicator size="large" color="#dc2626" />
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
              >
                {renderHero()}
                <View style={styles.standingsSection}>
                  <Text style={styles.sectionTitle}>CHAMPIONSHIP STANDINGS</Text>
                  <View style={styles.listContainer}>{renderList()}</View>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  standingsOuter: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Tab Section
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  
  // Hero Section
  heroSection: {
    height: 240,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 4,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroImageDrivers: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroImageTeams: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  heroNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#dc2626',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroBottomRow: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  heroStatsOverlay: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'flex-end',
  },
  heroStatOverlayItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 55,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  heroStatOverlayValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  heroStatOverlayLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Standings Section
  standingsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 1,
  },
  listContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'transparent',
  },
  position: {
    width: 32,
    fontSize: 16,
    fontWeight: '800',
    color: '#dc2626',
    textAlign: 'center',
    marginRight: 16,
  },
  name: {
    flex: 2.5,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  team: {
    flex: 2,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  car: {
    flex: 2,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  points: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'right',
    fontWeight: '800',
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
  
  // Background
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  
  // Fallback styles
  fallbackImage: {
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  
  // Drivers specific styles (stats in left bottom)
  heroBottomRowDrivers: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start', // Left alignment
  },
  heroStatsOverlayDrivers: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start', // Position to the left
  },
  
  // Teams specific styles (stats in right top)
  heroTopRowTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  heroStatsOverlayTeams: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end', // Position to the right
  },
  
  // Small stats for better positioning
  heroStatOverlayItemSmall: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  heroStatOverlayValueSmall: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  heroStatOverlayLabelSmall: {
    fontSize: 8,
    color: '#666666',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
