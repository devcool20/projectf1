import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function DriversScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-6">
        <View className="text-center bg-gradient-card p-8 rounded-2xl shadow-kodama-lg">
          <Text className="text-6xl mb-4">🏆</Text>
          <Text className="text-2xl font-heading font-bold text-foreground mb-3">
            Driver Stats Coming Soon
          </Text>
          <Text className="text-muted-foreground text-lg leading-relaxed">
            Track your favorite drivers' performance!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
