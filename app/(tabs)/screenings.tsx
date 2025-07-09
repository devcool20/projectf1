import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Button } from '@/components/ui/button';
import { RadioCard } from '@/components/RadioCard';
import { fetchRadioCardById, type RadioCardData } from '@/lib/radioCardData';

export default function ScreeningsScreen() {
  const [leftCardData, setLeftCardData] = useState<RadioCardData | null>(null);
  const [rightCardData, setRightCardData] = useState<RadioCardData | null>(null);

  useEffect(() => {
    // Fetch specific cards by ID (Fernando Alonso - ID 9, Max Verstappen - ID 14)
    const loadCards = async () => {
      const [leftCard, rightCard] = await Promise.all([
        fetchRadioCardById(9),  // Fernando Alonso
        fetchRadioCardById(14), // Max Verstappen
      ]);
      setLeftCardData(leftCard);
      setRightCardData(rightCard);
    };
    
    loadCards();
  }, []);

  const events = [
    {
      id: 1,
      title: "Monaco Grand Prix",
      date: "May 26, 2024",
      time: "2:00 PM",
      venue: "F1 Fan Club, Downtown",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop",
      attendees: 124,
      maxCapacity: 200,
    },
    {
      id: 2,
      title: "British Grand Prix",
      date: "Jul 14, 2024",
      time: "3:00 PM", 
      venue: "Racing Lounge, Silverstone District",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
      attendees: 89,
      maxCapacity: 150,
    },
  ];

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-secondary/20">
      
      {/* Left Fixed Radio Card */}
      {leftCardData && (
        <View className="absolute top-1/2 left-12 w-56 -translate-y-1/2">
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
        <View className="absolute top-1/2 right-12 w-56 -translate-y-1/2">
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center p-6">
          
          {/* Center Content */}
          <View className="w-full max-w-md">
            {/* Header */}
            <View className="bg-gradient-card p-6 shadow-kodama-lg">
              <Text className="text-2xl font-heading font-bold text-foreground animate-fade-in">
                🎬 Race Screenings
              </Text>
              <Text className="text-muted-foreground mt-1">
                Watch races with fellow fans
              </Text>
            </View>

            {/* Hero Section */}
            <View className="bg-gradient-primary p-8 mt-6 rounded-2xl shadow-kodama-lg animate-fade-up">
              <Text className="text-2xl font-heading font-bold mb-3 text-primary-foreground">🏁 Upcoming Race Screenings</Text>
              <Text className="text-primary-foreground/90 text-lg">
                Join fellow fans for live race viewing experiences
              </Text>
              <View className="mt-4 flex-row space-x-4">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-2xl">👥</Text>
                  <Text className="text-sm text-primary-foreground">200+ Active Members</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-2xl">📺</Text>
                  <Text className="text-sm text-primary-foreground">4K Viewing</Text>
                </View>
              </View>
            </View>

            {/* Events */}
            <View className="mt-6 space-y-6">
              {events.map((event) => (
                <View
                  key={event.id}
                  className="bg-gradient-card rounded-2xl overflow-hidden shadow-kodama-md border border-border/50 animate-fade-up"
                >
                  <View className="aspect-video bg-gradient-to-r from-green-600 to-red-600 relative overflow-hidden">
                    <Image 
                      source={{ uri: event.image }}
                      className="w-full h-full object-cover"
                      resizeMode="cover"
                    />
                    <View className="absolute top-4 right-4 bg-f1-red px-3 py-1 rounded-full">
                      <Text className="text-white text-sm font-semibold">LIVE</Text>
                    </View>
                    <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <Text className="text-white text-sm font-medium">
                        🏎️ Formula 1 Championship
                      </Text>
                    </View>
                  </View>
                  
                  <View className="p-6">
                    <Text className="text-xl font-heading font-bold text-foreground mb-3">
                      {event.title}
                    </Text>
                    
                    <View className="space-y-2 mb-4">
                      <View className="flex-row items-center">
                        <Text className="mr-2">📅</Text>
                        <Text className="font-medium text-muted-foreground">{event.date} • {event.time}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="mr-2">📍</Text>
                        <Text className="text-muted-foreground">{event.venue}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="mr-2">👥</Text>
                        <Text className="text-muted-foreground">{event.attendees}/{event.maxCapacity} attending</Text>
                      </View>
                    </View>

                    {/* Attendance Progress Bar */}
                    <View className="mb-4">
                      <View className="w-full bg-muted rounded-full h-2">
                        <View 
                          className="bg-gradient-primary h-2 rounded-full"
                          style={{ width: `${(event.attendees / event.maxCapacity) * 100}%` }}
                        />
                      </View>
                      <Text className="text-xs text-muted-foreground mt-1">
                        {Math.round((event.attendees / event.maxCapacity) * 100)}% full
                      </Text>
                    </View>
                    
                    <Button className="w-full bg-gradient-f1 text-white font-semibold rounded-xl py-4 shadow-kodama-md">
                      🎟️ Book Your Seat
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}
