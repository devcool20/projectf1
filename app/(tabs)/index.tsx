import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import AnimatedRadioCards from '@/components/AnimatedRadioCards';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-background to-secondary/20 h-screen w-screen overflow-hidden">
        {/* Animated Radio Cards */}
        <AnimatedRadioCards />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          <View className="w-full max-w-md pb-24">
            {/* Header */}
            <View className="bg-gradient-card p-6 shadow-kodama-lg">
              <Text className="text-2xl font-heading font-bold text-foreground animate-fade-in">
                🏎️ F1 Fan Hub
              </Text>
              <Text className="text-muted-foreground mt-1">
                Your ultimate Formula 1 community
              </Text>
            </View>
            
            {/* Welcome Section */}
            <View className="p-6">
              <View className="bg-gradient-primary rounded-2xl p-8 items-center shadow-kodama-lg animate-fade-up">
                <Text className="text-6xl mb-4 animate-bounce-gentle">🏁</Text>
                <Text className="text-2xl font-heading font-bold text-primary-foreground mb-3 text-center">
                  Welcome to F1 Fan Hub
                </Text>
                <Text className="text-primary-foreground/90 text-lg leading-relaxed text-center">
                  Connect with fellow Formula 1 enthusiasts, join race screenings, and stay updated with the latest racing community!
                </Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="px-6 mb-6">
              <View className="flex-row gap-4">
                <View className="flex-1 bg-gradient-card rounded-xl p-4 items-center shadow-kodama-md animate-fade-up">
                  <Text className="text-2xl mb-2">👥</Text>
                  <Text className="text-lg font-heading font-bold text-foreground">2.4k</Text>
                  <Text className="text-xs text-muted-foreground text-center">Active Members</Text>
                </View>
                <View className="flex-1 bg-gradient-card rounded-xl p-4 items-center shadow-kodama-md animate-fade-up">
                  <Text className="text-2xl mb-2">🏆</Text>
                  <Text className="text-lg font-heading font-bold text-foreground">23</Text>
                  <Text className="text-xs text-muted-foreground text-center">Races This Season</Text>
                </View>
              </View>
            </View>

            {/* Features Preview */}
            <View className="px-6 space-y-4">
              <View className="bg-gradient-card rounded-xl p-5 shadow-kodama-md border border-border/50 animate-fade-up">
                <View className="flex-row items-center mb-2">
                  <Text className="mr-2">💬</Text>
                  <Text className="font-heading font-semibold text-foreground">
                    Community Discussions
                  </Text>
                </View>
                <Text className="text-muted-foreground text-sm">
                  Share your thoughts, race predictions, and connect with fans worldwide
                </Text>
              </View>
              
              <View className="bg-gradient-card rounded-xl p-5 shadow-kodama-md border border-border/50 animate-fade-up">
                <View className="flex-row items-center mb-2">
                  <Text className="mr-2">🎬</Text>
                  <Text className="font-heading font-semibold text-foreground">
                    Live Race Screenings
                  </Text>
                </View>
                <Text className="text-muted-foreground text-sm">
                  Watch races together with fellow fans at premium viewing locations
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
