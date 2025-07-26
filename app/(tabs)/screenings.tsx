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
    <SafeAreaView className="flex-1 bg-[#181a20]">
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
          <View className="bg-[#23272f] p-6 shadow-kodama-lg">
            <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
              🎬 F1 Screenings
            </Text>
            <Text style={{ color: '#b0b3b8', marginTop: 4, fontFamily: 'Formula1-Regular' }}>
              Watch Formula 1 races with fellow fans
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {loading ? (
              <View className="bg-[#23272f] rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">⏳</Text>
                <Text style={{ fontSize: 20, fontWeight: '500', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
                  Loading screenings...
                </Text>
              </View>
            ) : screenings.length === 0 ? (
              <View className="bg-[#23272f] rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">📺</Text>
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', marginBottom: 12, fontFamily: 'Formula1-Regular' }}>
                  No Screenings Available
                </Text>
                <Text style={{ color: '#b0b3b8', fontSize: 18, lineHeight: 28, textAlign: 'center', fontFamily: 'Formula1-Regular' }}>
                  Check back soon for upcoming F1 screening events!
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {screenings.map((screening) => (
                  <View key={screening.id} className="bg-[#23272f] rounded-2xl shadow-kodama-lg overflow-hidden">
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
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff', marginBottom: 8, fontFamily: 'Formula1-Regular' }}>
                        {screening.grand_prix_name}
                      </Text>

                      {/* Date and Time */}
                      <View className="mb-3">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-base mr-2">📅</Text>
                          <Text style={{ fontSize: 16, fontWeight: '500', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
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
                          <Text style={{ fontSize: 16, fontWeight: '500', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
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
                          <Text style={{ fontSize: 16, fontWeight: '500', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
                            {screening.location}
                          </Text>
                        </View>
                        {screening.country && (
                                                  <Text style={{ fontSize: 14, color: '#b0b3b8', marginLeft: 24, fontFamily: 'Formula1-Regular' }}>
                          {screening.country}
                        </Text>
                        )}
                      </View>

                      {/* Round Number */}
                      {screening.round_number && (
                        <View className="pt-3 border-t border-[#23272f]">
                          <Text style={{ fontSize: 12, color: '#b0b3b8', textAlign: 'center', fontFamily: 'Formula1-Regular' }}>
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
