import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type ScreeningData = Database['public']['Tables']['screenings']['Row'];

export default function ScreeningsScreen() {
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScreenings = async () => {
    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching screenings:', error);
        return;
      }

      setScreenings(data || []);
    } catch (error) {
      console.error('Error fetching screenings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScreenings();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ overflow: 'auto' }}
      >
        <View className="w-full max-w-md pb-24">
          {/* Header */}
          <View className="bg-gradient-card p-6 shadow-kodama-lg">
            <Text className="text-2xl font-heading font-bold text-foreground">
              🎬 F1 Screenings
            </Text>
            <Text className="text-muted-foreground mt-1">
              Watch Formula 1 races with fellow fans
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {loading ? (
              <View className="bg-gradient-card rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">⏳</Text>
                <Text className="text-xl font-medium text-foreground">
                  Loading screenings...
                </Text>
              </View>
            ) : screenings.length === 0 ? (
              <View className="bg-gradient-card rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">📺</Text>
                <Text className="text-2xl font-heading font-bold text-foreground mb-3">
                  No Screenings Available
                </Text>
                <Text className="text-muted-foreground text-lg leading-relaxed text-center">
                  Check back soon for upcoming F1 screening events!
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {screenings.map((screening) => (
                  <View key={screening.id} className="bg-gradient-card rounded-2xl shadow-kodama-lg overflow-hidden">
                    {/* Header Image */}
                    {screening.image_url ? (
                      <Image
                        source={{ uri: screening.image_url }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Text className="text-4xl">🏁</Text>
                      </View>
                    )}

                    {/* Content */}
                    <View className="p-4">
                      {/* Grand Prix Name */}
                      <Text className="text-xl font-heading font-bold text-foreground mb-2">
                        {screening.grand_prix_name}
                      </Text>

                      {/* Date and Time */}
                      <View className="mb-3">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-base mr-2">📅</Text>
                          <Text className="text-base font-medium text-foreground">
                            {new Date(screening.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                          <Text className="text-base mr-2">⏰</Text>
                          <Text className="text-base font-medium text-foreground">
                            {new Date(`2000-01-01T${screening.timing}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                        </View>
                      </View>

                      {/* Location */}
                      <View className="mb-3">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-base mr-2">📍</Text>
                          <Text className="text-base font-medium text-foreground">
                            {screening.location}
                          </Text>
                        </View>
                        {screening.country && (
                          <Text className="text-sm text-muted-foreground ml-6">
                            {screening.country}
                          </Text>
                        )}
                      </View>

                      {/* Round Number */}
                      {screening.round_number && (
                        <View className="pt-3 border-t border-border">
                          <Text className="text-xs text-muted-foreground text-center">
                            Round {screening.round_number} • {screening.season}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
