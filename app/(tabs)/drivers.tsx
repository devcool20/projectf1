import React from 'react';
import { View, Text } from 'react-native';

export default function DriversScreen() {
  return (
    <View className="flex-1 bg-background">
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
