import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import EventCard from '@/components/EventCard';
import { AnimatedRadioCards } from '@/components/AnimatedRadioCards';

const upcomingEvents = [
  {
    id: 1,
    title: 'British Grand Prix Screening',
    date: '2024-07-14',
    time: '15:00',
    location: 'Central Sports Bar',
    description: 'Join fellow F1 fans for the British Grand Prix at Silverstone. Food and drinks available.',
  },
  {
    id: 2,
    title: 'Hungarian Grand Prix Watch Party',
    date: '2024-07-21',
    time: '15:00',
    location: 'Downtown Racing Club',
    description: 'Experience the thrill of F1 racing with other enthusiasts. Premium viewing experience.',
  },
];

export default function ScreeningsScreen() {
  return (
    <View className="flex-1 bg-gradient-to-br from-background to-secondary/20">
      
      {/* Animated Radio Cards */}
      <AnimatedRadioCards />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center p-6">
          
          {/* Center Content */}
          <View className="w-full max-w-md">
            <View className="bg-gradient-card rounded-2xl shadow-kodama-lg overflow-hidden">
              <View className="p-6 bg-gradient-primary">
                <Text className="text-4xl font-heading font-bold text-primary-foreground mb-2">🎬 Race Screenings</Text>
                <Text className="text-lg text-primary-foreground/80">Watch races with fellow fans</Text>
              </View>

              <View className="p-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                    description={event.description}
                  />
                ))}
              </View>
            </View>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}
