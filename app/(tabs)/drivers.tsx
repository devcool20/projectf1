import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Animated, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useDominantColor } from '@/hooks/useDominantColor';
import { useRouter } from 'expo-router';
import CarLoadingAnimation from '@/components/CarLoadingAnimation';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const DRIVER_IMAGES = {
  'Max Verstappen': require('../../assets/images/drivers/max.png'),
  'Lewis Hamilton': require('../../assets/images/drivers/lewis.png'),
  'George Russell': require('../../assets/images/drivers/george.png'),
  'Charles Leclerc': require('../../assets/images/drivers/charles.png'),
  'Carlos Sainz': require('../../assets/images/drivers/carlos.png'),
  'Lando Norris': require('../../assets/images/drivers/lando.png'),
  'Oscar Piastri': require('../../assets/images/drivers/oscar.png'),
  'Fernando Alonso': require('../../assets/images/drivers/fernando.png'),
  'Lance Stroll': require('../../assets/images/drivers/lance.png'),
  'Esteban Ocon': require('../../assets/images/drivers/esteban.png'),
  'Pierre Gasly': require('../../assets/images/drivers/pierre.png'),
  'Yuki Tsunoda': require('../../assets/images/drivers/yuki.png'),
  'Franco Colapinto': require('../../assets/images/drivers/franco.png'),
  'Alex Albon': require('../../assets/images/drivers/alex.png'),
  'Oliver Bearman': require('../../assets/images/drivers/oliver.png'),
  'Kimi Antonelli': require('../../assets/images/drivers/kimi.png'),
  'Gabriel Bortoleto': require('../../assets/images/drivers/gabriel.png'),
  'Nico Hulkenberg': require('../../assets/images/drivers/nico.png'),
  'Liam Lawson': require('../../assets/images/drivers/liam.png'),
  'Isack Hadjar': require('../../assets/images/drivers/isack.png')
};

const TEAM_IMAGES = {
  'Red Bull': require('../../team-logos/redbull.png'),
  'Mercedes': require('../../team-logos/mercedes.png'),
  'Ferrari': require('../../team-logos/ferrari.png'),
  'McLaren': require('../../team-logos/mclaren.png'),
  'Aston Martin': require('../../team-logos/astonmartin.png'),
  'Alpine': require('../../team-logos/alpine.png'),
  'Williams': require('../../team-logos/williams.png'),
  'Racing Bulls': require('../../team-logos/racingbulls.png'),
  'Kick Sauber': require('../../team-logos/stake.png'),
  'Haas': require('../../team-logos/haas.png'),
};

// Use the same TEAM_COLORS mapping as for drivers
const TEAM_COLORS = {
  'McLaren': '#FF8700',
  'Ferrari': '#DC0000',
  'Red Bull': '#0600EF',
  'Mercedes': '#00D2BE',
  'Aston Martin': '#006F62',
  'Alpine': '#0090FF',
  'Williams': '#005AFF',
  'Racing Bulls': '#6692FF',
  'Kick Sauber': '#52E252',
  'Stake F1 Team Kick Sauber': '#52E252',
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
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    console.log('Loading data for tab:', activeTab);
    
    const startTime = Date.now();
    
    if (activeTab === 'drivers') {
      supabase.from('driver_standings').select('*').then(({ data, error }) => {
        if (error) {
          console.error('Error loading drivers:', error);
        }
        console.log('Drivers loaded:', data?.length || 0);
        setDrivers((data as DriverStanding[]) || []);
        
        // Ensure minimum loading time for animation visibility
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800; // 800ms minimum
        if (elapsed < minLoadingTime) {
          setTimeout(() => setLoading(false), minLoadingTime - elapsed);
        } else {
        setLoading(false);
        }
      });
    } else {
      supabase.from('team_standings').select('*').then(({ data, error }) => {
        if (error) {
          console.error('Error loading teams:', error);
        }
        console.log('Teams loaded:', data?.length || 0);
        setTeams((data as TeamStanding[]) || []);
        
        // Ensure minimum loading time for animation visibility
        const elapsed = Date.now() - startTime;
        const minLoadingTime = 800; // 800ms minimum
        if (elapsed < minLoadingTime) {
          setTimeout(() => setLoading(false), minLoadingTime - elapsed);
        } else {
        setLoading(false);
        }
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

  const renderHero = (driver: DriverStanding) => {
    const imageSrc = DRIVER_IMAGES[driver.driver_name as keyof typeof DRIVER_IMAGES];
    const [firstName, lastName] = driver.driver_name.split(' ');
    const teamColor = TEAM_COLORS[driver.team_name as keyof typeof TEAM_COLORS] || '#fff';
    return (
      <TouchableOpacity
        style={styles.heroContainer}
        activeOpacity={0.85}
        onPress={() => router.push(`/standings/${driver.driver_name.toLowerCase().replace(/ /g, '-')}` as any)}
      >
        {imageSrc ? (
          <Image
            source={imageSrc}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroImageFallback}>
            <Text style={styles.cardImageFallbackText}>{driver.driver_name[0]}</Text>
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.heroVignette}
        />
        <View style={styles.heroInfo}>
          <Text style={styles.heroPosition}>01</Text>
          <Text style={styles.heroName}>
            <Text style={styles.cardFirstName}>{firstName} </Text>
            <Text style={[styles.cardLastName, { color: teamColor }]}>{lastName}</Text>
          </Text>
          <Text style={[styles.heroTeam, { color: teamColor }]}>{driver.team_name}</Text>
          <Text style={styles.heroPoints}>{driver.points} PTS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderList = () => {
    if (activeTab === 'drivers') {
      // Sort drivers by points descending
      const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points);
      if (sortedDrivers.length === 0) return null;
      // Remove the #1 driver for the list
      const restDrivers = sortedDrivers.slice(1);
      return (
        <>
          {renderHero(sortedDrivers[0])}
          <View style={styles.listContainer}>
            {restDrivers.map((driver, idx) => {
              const imageSrc = DRIVER_IMAGES[driver.driver_name as keyof typeof DRIVER_IMAGES];
              const [firstName, lastName] = driver.driver_name.split(' ');
              const teamColor = TEAM_COLORS[driver.team_name as keyof typeof TEAM_COLORS] || '#fff';
              return (
                <TouchableOpacity
                  key={driver.id}
                  style={styles.card}
                  onPress={() => router.push(`/standings/${driver.driver_name.toLowerCase().replace(/ /g, '-')}` as any)}
                >
                  <View style={[styles.cardImageContainer, { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}> 
                    {imageSrc ? (
                      <Image
                        source={imageSrc}
                        style={[
                          styles.cardImage,
                          {
                            alignSelf: 'center',
                            width: '110%',
                            height: '110%',
                            marginLeft: '-10%',
                            marginTop: '-10%',
                          }
                        ]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cardImageFallback}>
                        <Text style={styles.cardImageFallbackText}>{driver.driver_name[0]}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardContentLeft}>
                      <Text style={styles.cardPosition}>{String(idx + 2).padStart(2, '0')}</Text>
                      <Text style={styles.cardPoints}>{driver.points} PTS</Text>
                    </View>
                    <View style={styles.cardContentRight}>
                      <Text style={styles.cardName}>
                        <Text style={styles.cardFirstName}>{firstName} </Text>
                        <Text style={[styles.cardLastName, { color: teamColor }]}>{lastName}</Text>
                      </Text>
                      <Text style={[styles.cardTeam, { color: teamColor }]}>{driver.team_name}</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      );
    }
    // Sort teams by points descending
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
    return sortedTeams.map((team, idx) => {
      const imageSrc = TEAM_IMAGES[team.team_name as keyof typeof TEAM_IMAGES];
      const teamColor = TEAM_COLORS[team.team_name] || '#fff';
      return (
        <TouchableOpacity
          key={team.id}
          style={[styles.card, { paddingVertical: 18, paddingHorizontal: 18 }]}
          onPress={() => router.push(`/team/${team.team_name.toLowerCase().replace(/ /g, '-')}`)}
        >
          <View style={styles.cardImageContainer}>
            {imageSrc ? (
              <Image source={imageSrc} style={[styles.cardImage, { alignSelf: 'center', width: 48, height: 48, maxWidth: 60, maxHeight: 60 }]} resizeMode="contain" />
            ) : (
              <View style={styles.cardImageFallback}>
                <Text style={styles.cardImageFallbackText}>{team.team_name[0]}</Text>
              </View>
            )}
          </View>
          <View style={[styles.cardContent, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
            {/* Position - left */}
            <View style={{ minWidth: 32, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, color: '#666', fontWeight: '700', fontFamily: 'Formula1-Regular' }}>{String(idx + 1).padStart(2, '0')}</Text>
            </View>
            {/* Team name and car model - center */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: teamColor, marginBottom: 4, fontFamily: 'Formula1-Regular' }}>{team.team_name}</Text>
              <Text style={{ fontSize: 14, color: teamColor, fontWeight: '500', fontFamily: 'Formula1-Regular' }}>{team.car_model}</Text>
            </View>
            {/* Points - right */}
            <View style={{ minWidth: 64, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700', fontFamily: 'Formula1-Regular' }}>{team.points} PTS</Text>
            </View>
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
          <Text style={[styles.headerTitle, { fontFamily: 'Formula1-Regular' }]}>Standings 2025</Text>
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
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive, { fontFamily: 'Formula1-Regular' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {loading ? (
            <CarLoadingAnimation 
              duration={1000}
            />
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: isSmallScreen ? 8 : 16 }}
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    fontFamily: 'Formula1-Regular',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContentLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    marginRight: 12,
  },
  cardContentRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardPosition: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666666',
    fontWeight: '600',
    fontFamily: 'Formula1-Regular',
  },
  cardName: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'right',
    fontFamily: 'Formula1-Regular',
  },
  cardFirstName: {
    fontWeight: '400',
    fontFamily: 'Formula1-Regular',
  },
  cardLastName: {
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'Formula1-Regular',
  },
  cardTeam: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#aaaaaa',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'right',
    fontFamily: 'Formula1-Regular',
  },
  cardPoints: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#ffffff',
    fontWeight: '200',
    marginTop: 4,
    fontFamily: 'Formula1-Regular',
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
  heroContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#111',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -5,
    height: '80%',
    zIndex: 1,
  },
  heroInfo: {
    position: 'absolute',
    left: 20,
    bottom: 130,
    zIndex: 2,
    width: '80%',
    paddingBottom: 8,
  },
  heroPosition: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
    opacity: 0.7,
    fontFamily: 'Formula1-Regular',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'Formula1-Regular',
  },
  heroTeam: {
    fontSize: 14,
    color: '#FF8700',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Formula1-Regular',
  },
  heroPoints: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Formula1-Regular',
  },
});