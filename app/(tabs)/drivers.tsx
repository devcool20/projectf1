import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { RadioCard } from '@/components/RadioCard';
import { getRandomRadioCards, type RadioCardData } from '@/lib/radioCardData';

export default function DriversScreen() {
  const [radioCards, setRadioCards] = useState<RadioCardData[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await getRandomRadioCards(2);
      setRadioCards(cards);
    };
    
    loadCards();
  }, []);

  const [leftCardData, rightCardData] = radioCards;

  return (
    <View className="flex-1 bg-background">
      
      {/* Left Fixed Radio Card */}
      {leftCardData && (
        <View className="absolute top-1/2 left-12 w-56 -translate-y-1/2 z-10">
          <RadioCard
            teamColor={leftCardData.teamColor}
            teamIcon={leftCardData.teamIcon}
            title={leftCardData.driverName}
            driverResponse={leftCardData.driverResponse}
            teamResponse={leftCardData.teamResponse}
            responseOrder={leftCardData.responseOrder}
          />
        </View>
      )}
      
      {/* Right Fixed Radio Card */}
      {rightCardData && (
        <View className="absolute top-1/2 right-12 w-56 -translate-y-1/2 z-10">
          <RadioCard
            teamColor={rightCardData.teamColor}
            teamIcon={rightCardData.teamIcon}
            title={rightCardData.driverName}
            driverResponse={rightCardData.driverResponse}
            teamResponse={rightCardData.teamResponse}
            responseOrder={rightCardData.responseOrder}
          />
        </View>
      )}

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
