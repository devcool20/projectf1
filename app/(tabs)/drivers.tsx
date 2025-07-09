import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { AnimatedRadioCards } from '@/components/AnimatedRadioCards';

export default function DriversScreen() {
  return (
    <View className="flex-1 bg-gradient-to-br from-background to-secondary/20">
      
      {/* Animated Radio Cards */}
      <AnimatedRadioCards />

      <View className="flex-1 justify-center items-center p-6">
        <View className="text-center bg-gradient-card p-8 rounded-2xl shadow-kodama-lg">
          <View className="text-6xl mb-4">🏆</View>
          <Text className="text-2xl font-heading font-bold text-foreground mb-3">
            Driver Stats Coming Soon
          </Text>
          <Text className="text-muted-foreground text-lg leading-relaxed">
            Track your favorite drivers' performance!
          </Text>
        </View>
      </View>
    </View>
  );
}
