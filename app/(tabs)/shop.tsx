import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import AnimatedRadioCards from '@/components/AnimatedRadioCards';

export default function ShopScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Animated Radio Cards - render first with highest priority */}
      <AnimatedRadioCards />
      
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-background to-secondary/20 h-screen w-screen overflow-hidden">
        <View className="flex-1 justify-center items-center p-6">
          <View className="text-center bg-gradient-card p-8 rounded-2xl shadow-kodama-lg">
            <Text className="text-6xl mb-4">🛒</Text>
            <Text className="text-2xl font-heading font-bold text-foreground mb-3">
              Shop Coming Soon
            </Text>
            <Text className="text-muted-foreground text-lg leading-relaxed">
              Get your F1 merchandise and team gear!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
