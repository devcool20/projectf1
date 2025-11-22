import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import CarLoadingAnimation from '@/components/CarLoadingAnimation';
import { HoverableCard } from '@/components/shop/HoverableCard';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedReanimated from 'react-native-reanimated';

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

const TEAM_COLORS: { [key: string]: string } = {
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
    const startTime = Date.now();
    
    if (activeTab === 'drivers') {
      supabase.from('driver_standings').select('*').then(({ data, error }) => {
        if (error) console.error('Error loading drivers:', error);
        setDrivers((data as DriverStanding[]) || []);
        handleLoadingComplete(startTime);
      });
    } else {
      supabase.from('team_standings').select('*').then(({ data, error }) => {
        if (error) console.error('Error loading teams:', error);
        setTeams((data as TeamStanding[]) || []);
        handleLoadingComplete(startTime);
      });
    }
  }, [activeTab]);

  const handleLoadingComplete = (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const minLoadingTime = 800;
    if (elapsed < minLoadingTime) {
      setTimeout(() => setLoading(false), minLoadingTime - elapsed);
    } else {
      setLoading(false);
    }
  };

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
      <AnimatedReanimated.View entering={FadeInDown.duration(600).springify()} style={{ marginBottom: 24 }}>
        <HoverableCard
          style={styles.heroContainer}
          onPress={() => router.push(`/standings/${driver.driver_name.toLowerCase().replace(/ /g, '-')}` as any)}
        >
          <View style={styles.heroImageWrapper}>
            {imageSrc ? (
              <Image
                source={imageSrc}
                style={styles.heroImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.heroImageFallback}>
                <Text style={styles.cardImageFallbackText}>{driver.driver_name[0]}</Text>
              </View>
            )}
            <LinearGradient
              colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.4)", "transparent"]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={styles.heroVignette}
            />
          </View>

          <View style={styles.heroInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
               <View style={{ backgroundColor: teamColor, borderRadius: 4, width: 4, height: 32, marginRight: 12 }} />
               <Text style={styles.heroPosition}>01</Text>
            </View>
            
            <View>
               <Text style={styles.heroName}>
                <Text style={styles.cardFirstName}>{firstName} </Text>
                <Text style={[styles.cardLastName, { color: teamColor }]}>{lastName}</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, width: '100%' }}>
                <Text style={[styles.heroTeam, { color: '#b0b3b8' }]}>{driver.team_name}</Text>
                <Text style={styles.heroPoints}>{driver.points} PTS</Text>
              </View>
            </View>
          </View>
        </HoverableCard>
      </AnimatedReanimated.View>
    );
  };

  const renderList = () => {
    if (activeTab === 'drivers') {
      const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points);
      if (sortedDrivers.length === 0) return null;
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
                <AnimatedReanimated.View 
                  key={driver.id} 
                  entering={FadeInDown.delay(idx * 50).duration(400)}
                >
                  <HoverableCard
                    style={styles.card}
                    onPress={() => router.push(`/standings/${driver.driver_name.toLowerCase().replace(/ /g, '-')}` as any)}
                  >
                    <View style={styles.cardLeftSection}>
                       <Text style={styles.cardPosition}>{String(idx + 2).padStart(2, '0')}</Text>
                       <View style={[styles.teamStripe, { backgroundColor: teamColor }]} />
                    </View>

                    <View style={styles.cardImageContainer}> 
                      {imageSrc ? (
                        <Image
                          source={imageSrc}
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.cardImageFallback}>
                          <Text style={styles.cardImageFallbackText}>{driver.driver_name[0]}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardContent}>
                      <View style={{ justifyContent: 'center' }}>
                        <Text style={styles.cardName} numberOfLines={1}>
                          <Text style={styles.cardFirstName}>{firstName} </Text>
                          <Text style={[styles.cardLastName, { color: '#fff' }]}>{lastName}</Text>
                        </Text>
                        <Text style={styles.cardTeam}>{driver.team_name}</Text>
                      </View>
                    </View>

                    <View style={styles.cardRightSection}>
                       <Text style={styles.cardPoints}>{driver.points} <Text style={{ fontSize: 10, color: '#666' }}>PTS</Text></Text>
                    </View>
                  </HoverableCard>
                </AnimatedReanimated.View>
              );
            })}
          </View>
        </>
      );
    }
    
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
    return (
        <View style={[styles.listContainer, { marginTop: 20 }]}>
        {sortedTeams.map((team, idx) => {
          const imageSrc = TEAM_IMAGES[team.team_name as keyof typeof TEAM_IMAGES];
          const teamColor = TEAM_COLORS[team.team_name] || '#fff';
          
          return (
            <AnimatedReanimated.View 
                key={team.id} 
                entering={FadeInDown.delay(idx * 50).duration(400)}
            >
            <HoverableCard
              style={[styles.card, { paddingVertical: 16 }]}
              onPress={() => router.push(`/team/${team.team_name.toLowerCase().replace(/ /g, '-')}` as any)}
            >
              <View style={styles.cardLeftSection}>
                  <Text style={styles.cardPosition}>{String(idx + 1).padStart(2, '0')}</Text>
                  <View style={[styles.teamStripe, { backgroundColor: teamColor }]} />
              </View>

              <View style={[styles.cardImageContainer, { backgroundColor: 'transparent', width: 50, height: 50 }]}>
                {imageSrc ? (
                  <Image source={imageSrc} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View style={styles.cardImageFallback}>
                    <Text style={styles.cardImageFallbackText}>{team.team_name[0]}</Text>
                  </View>
                )}
              </View>
              
              <View style={[styles.cardContent, { marginLeft: 12 }]}> 
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Formula1-Regular' }}>{team.team_name}</Text>
                <Text style={{ fontSize: 12, color: '#666', fontFamily: 'Formula1-Regular', marginTop: 2 }}>{team.car_model}</Text>
              </View>
              
              <View style={styles.cardRightSection}>
                  <Text style={styles.cardPoints}>{team.points} <Text style={{ fontSize: 10, color: '#666' }}>PTS</Text></Text>
              </View>
            </HoverableCard>
            </AnimatedReanimated.View>
          );
        })}
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.standingsOuter}>
        <AnimatedReanimated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: 'Formula1-Regular' }]}>Standings 2025</Text>
        </AnimatedReanimated.View>
        
        <View style={styles.tabRowContainer}>
            <View style={styles.tabRow}>
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
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {loading ? (
            <CarLoadingAnimation duration={1000} />
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {renderList()}
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
    backgroundColor: '#181a20',
  },
  standingsOuter: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingBottom: 0,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tabRowContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#23272f',
    borderRadius: 32,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 28,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#dc2626',
  },
  tabLabel: {
    fontSize: 14,
    color: '#6e767d',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272f',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    height: 80,
  },
  cardLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    marginRight: 8,
  },
  cardPosition: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
    marginRight: 8,
    width: 24,
    textAlign: 'center',
  },
  teamStripe: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  cardImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2e37',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardImage: {
    width: '110%',
    height: '110%',
    marginBottom: -5,
  },
  cardImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageFallbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Formula1-Regular',
    marginBottom: 2,
  },
  cardFirstName: {
    fontWeight: '400',
    color: '#b0b3b8',
  },
  cardLastName: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTeam: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Formula1-Regular',
  },
  cardRightSection: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  cardPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
  },
  heroContainer: {
    width: '100%',
    backgroundColor: '#23272f',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  heroImageWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#1a1d24',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  heroImage: {
    width: '80%',
    height: '90%',
  },
  heroImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heroVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  heroInfo: {
    padding: 20,
    backgroundColor: '#23272f',
  },
  heroPosition: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
    lineHeight: 42,
  },
  heroName: {
    fontSize: 24,
    fontFamily: 'Formula1-Regular',
    color: '#fff',
  },
  heroTeam: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Formula1-Regular',
  },
  heroPoints: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    fontFamily: 'Formula1-Regular',
  },
  scrollView: {
    flex: 1,
  },
});
