import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamBio } from '../data/teams';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
      const { data } = await supabase
        .from('team_standings')
        .select('points, wins, dnfs, podiums, poles')
        .eq('team_name', team.name)
        .single();
      if (data) setStats(data);
    }
    fetchStats();
  }, [team.name]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: APP_BG }} contentContainerStyle={{ padding: 0 }}>
      {/* Hero image with upper and lower vignette and back button */}
      <View style={{ width: screenWidth, height: heroHeight, position: 'relative', marginBottom: 16, marginTop: 0 }}>
        <Image
          source={team.logo}
          style={{ width: screenWidth, height: heroHeight, marginTop: 0 }}
          resizeMode="contain"
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          style={{ position: 'absolute', top: 16, left: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 6 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        {/* Upper vignette */}
        <LinearGradient
          colors={['#181a20', 'rgba(24,26,32,0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.25 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: heroHeight * 0.35 }}
        />
        {/* Lower vignette */}
        <LinearGradient
          colors={['#181a20', 'rgba(24,26,32,0.7)', 'rgba(24,26,32,0.0)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: heroHeight * 0.85 }}
        />
      </View>
      {/* Main info row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 24 }}>
        {/* Left column - left aligned */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 18, color: '#b0b3b8', fontWeight: '600', marginBottom: 6 }}>{team.car_model}</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: teamColor, marginBottom: 8 }}>{team.name}</Text>
          {/* Removed logo from here */}
          <Text style={{ fontSize: 16, color: '#fff', marginBottom: 4 }}>
            {team.driverNumbers && team.driverNumbers.length > 0 ? `#${team.driverNumbers.join(', #')}` : ''}
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{team.country}</Text>
        </View>
        {/* Right column */}
        <View style={{ minWidth: 100, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>{stats.points} PTS</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2 }}>Points</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>{stats.wins}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2 }}>Wins</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>{stats.dnfs}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2 }}>DNFs</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>{stats.podiums}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14, marginBottom: 2 }}>Podiums</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>{stats.poles}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 14 }}>Poles</Text>
        </View>
      </View>
      {/* About section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>About</Text>
        <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24 }}>{team.about}</Text>
      </View>
      {/* Facts section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Team Facts</Text>
        {team.facts.map((fact, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22 }}>{fact}</Text>
            {idx < team.facts.length - 1 && <View style={{ height: 1, backgroundColor: '#fff', opacity: 0.2, marginVertical: 8 }} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TeamDetail; 