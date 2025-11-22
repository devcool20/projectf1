import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image, Platform, Dimensions } from 'react-native';
import { ScreeningGrid } from '@/components/screenings/ScreeningGrid';
import { HoverableCard } from '@/components/shop/HoverableCard';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react-native';

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleString('default', { weekday: 'long' }),
    };
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#181a20]">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
        }
        style={{ overflow: 'auto' }}
      >
        <View className="w-full pb-24">
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.duration(800).springify()}
            className="px-6 py-10 items-center w-full"
          >
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.2)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
            />
            <Text style={{ fontSize: 36, fontWeight: '700', color: '#ffffff', fontFamily: 'Formula1-Regular', marginBottom: 8, textAlign: 'center' }}>
              F1 Watch Parties
            </Text>
            <Text style={{ color: '#b0b3b8', fontSize: 16, fontFamily: 'Formula1-Regular', textAlign: 'center', maxWidth: 600, lineHeight: 24 }}>
              Experience the thrill of race day with fellow fans. High-speed action, big screens, and electric atmosphere.
            </Text>
          </Animated.View>

          {/* Content */}
          <View className="w-full items-center">
            {loading ? (
              <View className="h-96 items-center justify-center">
                <Text style={{ fontSize: 16, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
                  Loading screenings...
                </Text>
              </View>
            ) : screenings.length === 0 ? (
              <Animated.View 
                entering={FadeInDown.duration(600)}
                className="bg-[#23272f] rounded-2xl p-8 items-center max-w-md mx-4 border border-[#333]"
              >
                <Text className="text-6xl mb-4">🏁</Text>
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', marginBottom: 12, fontFamily: 'Formula1-Regular' }}>
                  No Upcoming Screenings
                </Text>
                <Text style={{ color: '#b0b3b8', fontSize: 16, textAlign: 'center', fontFamily: 'Formula1-Regular', lineHeight: 24 }}>
                  The season might be on break. Check back soon for the next Grand Prix events!
                </Text>
              </Animated.View>
            ) : (
              <ScreeningGrid 
                screenings={screenings}
                renderScreening={(screening, index) => {
                  const { day, month, weekday } = formatDate(screening.date);
                  
                  return (
                    <Animated.View 
                      key={screening.id}
                      entering={FadeInDown.delay(index * 100).duration(600).springify()}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <HoverableCard 
                        style={{
                          backgroundColor: '#23272f',
                          borderRadius: 20,
                          overflow: 'hidden',
                          height: '100%',
                          borderWidth: 1,
                          borderColor: '#333',
                          position: 'relative',
                        }}
                      >
                        {/* Image Section */}
                        <View style={{ height: 200, width: '100%', position: 'relative' }}>
                          {screening.image_url ? (
                            <Image
                              source={{ uri: screening.image_url }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{ flex: 1, backgroundColor: '#1e2128', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ fontSize: 40 }}>🏎️</Text>
                            </View>
                          )}
                          
                          {/* Gradient Overlay */}
                          <LinearGradient
                            colors={['transparent', 'rgba(24, 26, 32, 0.9)']}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
                          />

                          {/* Date Badge */}
                          <View style={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16, 
                            backgroundColor: 'rgba(0,0,0,0.7)', 
                            borderRadius: 12,
                            padding: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)',
                            minWidth: 60
                          }}>
                            <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700', fontFamily: 'Formula1-Regular' }}>
                              {month}
                            </Text>
                            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', fontFamily: 'Formula1-Regular' }}>
                              {day}
                            </Text>
                          </View>
                        </View>

                        {/* Content Section */}
                        <View className="p-5 flex-1">
                          <Text style={{ fontSize: 12, color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: 'Formula1-Regular' }}>
                            ROUND {screening.round_number}
                          </Text>
                          
                          <Text style={{ fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 16, fontFamily: 'Formula1-Regular', lineHeight: 28 }}>
                            {screening.grand_prix_name}
                          </Text>

                          {/* Info Rows */}
                          <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Clock size={16} color="#b0b3b8" />
                              <Text style={{ color: '#e5e7eb', marginLeft: 10, fontSize: 14, fontFamily: 'Formula1-Regular' }}>
                                {formatTime(screening.timing)} • {weekday}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MapPin size={16} color="#b0b3b8" />
                              <Text style={{ color: '#e5e7eb', marginLeft: 10, fontSize: 14, fontFamily: 'Formula1-Regular' }}>
                                {screening.location || 'Main Hall'}
                              </Text>
                            </View>

                            {screening.description && (
                              <View style={{ marginTop: 4 }}>
                                <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 20, fontFamily: 'Formula1-Regular' }} numberOfLines={2}>
                                  {screening.description}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Action Button */}
                          <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                               <View>
                                 <Text style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', fontFamily: 'Formula1-Regular' }}>
                                   Entry
                                 </Text>
                                 <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', fontFamily: 'Formula1-Regular' }}>
                                   {screening.price ? `$${screening.price}` : 'Free'}
                                 </Text>
                               </View>
                               
                               <View style={{ 
                                 backgroundColor: '#dc2626', 
                                 paddingHorizontal: 16, 
                                 paddingVertical: 10, 
                                 borderRadius: 8,
                                 flexDirection: 'row',
                                 alignItems: 'center',
                                 shadowColor: '#dc2626',
                                 shadowOffset: { width: 0, height: 4 },
                                 shadowOpacity: 0.3,
                                 shadowRadius: 8,
                               }}>
                                 <Ticket size={16} color="#ffffff" style={{ marginRight: 6 }} />
                                 <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 12, fontFamily: 'Formula1-Regular' }}>
                                   GET TICKETS
                                 </Text>
                               </View>
                             </View>
                          </View>
                        </View>
                      </HoverableCard>
                    </Animated.View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
