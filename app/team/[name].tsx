import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { teams } from '../../data/teams';
import TeamDetail from '../../components/TeamDetail';
import { View, Text } from 'react-native';

export default function TeamDetailScreen() {
  const { name } = useLocalSearchParams();
  const team = teams.find(t => t.name.toLowerCase().replace(/ /g, '-') === String(name).toLowerCase());

  if (!team) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181a20' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Team not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TeamDetail team={team} />
    </>
  );
} 