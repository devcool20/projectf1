import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { TeamBio } from '../data/teams';

interface TeamDetailProps {
  team: TeamBio;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ team }) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#181a20' }} contentContainerStyle={{ padding: 20 }}>
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <Image source={team.logo} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16 }} resizeMode="contain" />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>{team.name}</Text>
      <Text style={{ fontSize: 18, color: '#b0b3b8', marginBottom: 8 }}>{team.car_model}</Text>
      <Text style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{team.points} Points</Text>
    </View>
    <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 16 }}>{team.about}</Text>
    <Text style={{ color: '#b0b3b8', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Team's Facts</Text>
    {team.facts.map((fact, idx) => (
      <Text key={idx} style={{ color: '#b0b3b8', fontSize: 15, marginBottom: 6 }}>• {fact}</Text>
    ))}
  </ScrollView>
);

export default TeamDetail; 