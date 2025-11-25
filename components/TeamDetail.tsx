import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamBio } from '../data/teams';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CarLoadingAnimation from './CarLoadingAnimation';

interface TeamDetailProps {
  team: TeamBio;
}

const screenWidth = Dimensions.get('window').width;
const heroHeight = Math.round(screenWidth * 0.5);
const APP_BG = '#181a20';
const TEAM_COLORS: Record<string, string> = {
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

const TeamDetail: React.FC<TeamDetailProps> = ({ team }) => {
  const [stats, setStats] = useState({ points: 0, wins: 0, dnfs: 0, podiums: 0, poles: 0 });
  const [loading, setLoading] = useState(true);
  const teamColor = TEAM_COLORS[team.name] || '#fff';
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/standings');
    }
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log('Fetching team stats for:', team.name);
        const { data, error } = await supabase
        .from('team_standings')
        .select('points, wins, dnfs, podiums, poles')
        .eq('team_name', team.name)
        .single();
        
        if (error) {
          console.error('Supabase error:', error);
        }
        
        if (data) {
          console.log('Team stats loaded:', data);
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching team stats:', error);
      } finally {
        // Add a small delay to ensure the animation is visible
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
    fetchStats();
  }, [team.name]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: APP_BG }}>
        <CarLoadingAnimation 
          duration={1000}
        />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: APP_BG }} contentContainerStyle={{ padding: 0 }}>
      {/* Hero image with upper and lower vignette and back button */}
      <View style={{ width: '100%', aspectRatio: 2, position: 'relative', marginBottom: 16, marginTop: 0 }}>
        <Image
          source={team.logo}
          style={{ width: '100%', height: '100%', marginTop: 0 }}
          resizeMode="contain"
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          style={{ position: 'absolute', top: 46, left: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 6 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        {/* Upper vignette */}
        <LinearGradient
          colors={['#181a20', 'rgba(24,26,32,0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.25 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '35%' }}
        />
        {/* Lower vignette */}
        <LinearGradient
          colors={['#181a20', 'rgba(24,26,32,0.7)', 'rgba(24,26,32,0.0)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '85%' }}
        />
      </View>
      {/* Main info row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 24 }}>
        {/* Left column - left aligned */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 18, color: '#b0b3b8', fontWeight: '600', marginBottom: 6, fontFamily: 'Formula1-Regular' }}>{team.car_model}</Text>
          <Text style={{ fontSize: 28, fontWeight: '600', color: teamColor, marginBottom: 8, fontFamily: 'Formula1-Regular' }}>{team.name}</Text>
          {/* Removed logo from here */}
          <Text style={{ fontSize: 16, color: '#fff', marginBottom: 4, fontFamily: 'Formula1-Regular' }}>
            {team.driverNumbers && team.driverNumbers.length > 0 ? `#${team.driverNumbers.join(', #')}` : ''}
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>{team.country}</Text>
        </View>
        {/* Right column */}
        <View style={{ minWidth: 100, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 6, fontFamily: 'Formula1-Regular' }}>{stats.points} PTS</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2, fontFamily: 'Formula1-Regular' }}>Points</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>{stats.wins}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2, fontFamily: 'Formula1-Regular' }}>Wins</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>{stats.dnfs}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2, fontFamily: 'Formula1-Regular' }}>DNFs</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>{stats.podiums}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2, fontFamily: 'Formula1-Regular' }}>Podiums</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>{stats.poles}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, fontFamily: 'Formula1-Regular' }}>Poles</Text>
        </View>
      </View>
      {/* About section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8, fontFamily: 'Formula1-Regular' }}>About</Text>
        <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24, fontFamily: 'Formula1-Regular' }}>{team.about}</Text>
      </View>
      {/* Facts section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8, fontFamily: 'Formula1-Regular' }}>Team Facts</Text>
        {team.facts.map((fact, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22, fontFamily: 'Formula1-Regular' }}>{fact}</Text>
            {idx < team.facts.length - 1 && <View style={{ height: 1, backgroundColor: '#fff', opacity: 0.2, marginVertical: 8 }} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TeamDetail; 