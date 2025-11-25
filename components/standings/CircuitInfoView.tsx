import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Trophy, Timer, RotateCw, Map as MapIcon } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

type RaceData = Database['public']['Tables']['races']['Row'];

export function CircuitInfoView() {
  const [race, setRace] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextRace();
  }, []);

  const fetchNextRace = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        const now = new Date();
        const upcoming = data.find(r => new Date(r.date) >= now);
        setRace(upcoming || null);
      }
    } catch (error) {
      console.error('Error fetching race for circuit info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !race) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Circuit Info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Circuit Info</Text>
      
      <Animated.View entering={FadeInRight.duration(600)} style={styles.card}>
        <View style={styles.mapContainer}>
          {/* Placeholder SVG Map - generic track shape */}
          <Svg height="200" width="100%" viewBox="0 0 200 150">
            <Path
              d="M30,120 L170,120 Q190,120 190,100 L190,50 Q190,30 170,30 L100,30 Q80,30 80,50 L80,80 Q80,100 60,100 L30,100 Q10,100 10,120 Z"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
            />
            <Path
              d="M30,120 L170,120 Q190,120 190,100 L190,50 Q190,30 170,30 L100,30 Q80,30 80,50 L80,80 Q80,100 60,100 L30,100 Q10,100 10,120 Z"
              fill="none"
              stroke="rgba(220, 38, 38, 0.3)"
              strokeWidth="10"
            />
          </Svg>
          <View style={styles.mapOverlay}>
             <Text style={styles.circuitName}>{race.circuit_name}</Text>
             <Text style={styles.circuitLocation}>{race.country}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatItem 
            icon={<RotateCw size={16} color="#dc2626" />}
            label="Turns"
            value={race.turns?.toString() || 'N/A'}
          />
          <StatItem 
            icon={<MapIcon size={16} color="#dc2626" />}
            label="Length"
            value={race.circuit_length_km ? `${race.circuit_length_km} km` : 'N/A'}
          />
          <StatItem 
            icon={<Trophy size={16} color="#dc2626" />}
            label="Last Winner"
            value={race.last_winner || 'N/A'}
            fullWidth
          />
          <StatItem 
            icon={<Timer size={16} color="#dc2626" />}
            label="Lap Record"
            value={race.lap_record_time || 'N/A'}
            subValue={race.lap_record_driver || ''}
            fullWidth
          />
        </View>
      </Animated.View>
    </View>
  );
}

function StatItem({ icon, label, value, subValue, fullWidth }: { icon: any, label: string, value: string, subValue?: string, fullWidth?: boolean }) {
  return (
    <View style={[styles.statItem, fullWidth && styles.statItemFull]}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subValue ? <Text style={styles.statSubValue}>{subValue}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#181a20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    height: '100%',
  },
  loadingText: {
    color: '#b0b3b8',
    fontFamily: 'Formula1-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#23272f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#1e2128',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  circuitName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  circuitLocation: {
    color: '#b0b3b8',
    fontSize: 12,
    fontFamily: 'Formula1-Regular',
  },
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '48%', // Approx half width
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  statItemFull: {
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statLabel: {
    color: '#b0b3b8',
    fontSize: 12,
    fontFamily: 'Formula1-Regular',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  statSubValue: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Formula1-Regular',
  },
});
