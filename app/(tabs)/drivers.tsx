import React from 'react';
import { View, Text } from 'react-native';
import { RadioCard } from '@/components/RadioCard';
import { getRandomRadioCards } from '@/lib/radioCardData';
import { useMemo } from 'react';

export default function DriversScreen() {
  const [leftCardData, rightCardData] = useMemo(() => getRandomRadioCards(2), []);

  return (
    <View className="flex-1 bg-background">
      
      {/* Left Fixed Radio Card */}
      <View className="absolute top-1/2 left-12 w-56 -translate-y-1/2 z-10">
        <RadioCard
          teamColor={leftCardData.teamColor}
          teamIcon={leftCardData.teamIcon}
          title={leftCardData.driverName}
          quote1={leftCardData.driverResponse}
          quote2={leftCardData.teamResponse}
        />
      </View>
      
      {/* Right Fixed Radio Card */}
      <View className="absolute top-1/2 right-12 w-56 -translate-y-1/2 z-10">
        <RadioCard
          teamColor={rightCardData.teamColor}
          teamIcon={rightCardData.teamIcon}
          title={rightCardData.driverName}
          quote1={rightCardData.driverResponse}
          quote2={rightCardData.teamResponse}
        />
      </View>

      <View className="max-w-md mx-auto pb-24">
        <View className="p-4 border-b border-border bg-card">
          <Text className="text-xl font-semibold text-foreground">Drivers</Text>
        </View>
        
        <View className="flex-1 items-center justify-center h-96">
          <View className="items-center">
            <Text className="text-6xl mb-4">🏆</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">Driver Stats Coming Soon</Text>
            <Text className="text-muted-foreground">Track your favorite drivers' performance!</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
