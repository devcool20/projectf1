import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image } from 'react-native';
import { ScreeningGrid } from '@/components/screenings/ScreeningGrid';
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
          <View className="px-4 py-2">
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
              🎬 F1 Screenings
            </Text>
            <Text style={{ color: '#b0b3b8', marginTop: 2, fontSize: 14, fontFamily: 'Formula1-Regular' }}>
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
              <ScreeningGrid 
                screenings={screenings}
                renderScreening={(screening) => (
                  <View key={screening.id} className="bg-[#23272f] rounded-2xl shadow-kodama-lg overflow-hidden">
                    {/* Header Image */}
                    {screening.image_url ? (
                      <Image
                        source={{ uri: screening.image_url }}
                        style={{ width: '100%', aspectRatio: 16/9 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: '100%', aspectRatio: 16/9, backgroundColor: '#181a20', justifyContent: 'center', alignItems: 'center' }}>
                        <Text className="text-2xl">🏁</Text>
                      </View>
                    )}

                     {/* Content */}
                     <View className="p-3">
                       {/* Grand Prix Name */}
                       <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 2, fontFamily: 'Formula1-Regular' }}>
                         {screening.grand_prix_name}
                       </Text>

                      

                       {/* Date */}
                       <Text style={{ fontSize: 10, color: '#ffffff', fontFamily: 'Formula1-Regular', marginBottom: 1 }}>
                         Mar {new Date(screening.date).getDate()}
                       </Text>

                       {/* Time and Round */}
                       <View className="flex-row items-center">
                         <Text style={{ fontSize: 10, color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
                           ⏰ {new Date(`2000-01-01T${screening.timing}`).toLocaleTimeString('en-US', {
                             hour: 'numeric',
                             minute: '2-digit'
                           })} PM
                         </Text>
                         <Text style={{ fontSize: 10, color: '#ffffff', fontFamily: 'Formula1-Regular', marginLeft: 8 }}>
                           Round {screening.round_number}
                         </Text>
                       </View>
                     </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
