import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Trophy, Timer, RotateCw, Map as MapIcon } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { CircuitMap } from './CircuitMap';

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

  // Show circuit map even when loading/no data for testing
  const displayRace = race || {
    circuit_name: 'Bahrain International Circuit',
    country: 'Bahrain',
    turns: 15,
    circuit_length_km: 5.412,
    last_winner: 'Max Verstappen',
    lap_record_time: '1:31.447',
    lap_record_driver: 'Pedro de la Rosa (2005)',
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Circuit Info</Text>
        <View style={styles.headerCircuitInfo}>
          <Text style={styles.headerCircuitName}>{displayRace.circuit_name}</Text>
          <Text style={styles.headerCircuitLocation}>{displayRace.country}</Text>
        </View>
      </View>
      
      <Animated.View entering={FadeInRight.duration(600)} style={styles.card}>
        <View style={styles.mapContainer}>
          <CircuitMap />
        </View>

        <View style={styles.statsGrid}>
          <StatItem 
            icon={<RotateCw size={16} color="#dc2626" />}
            label="Turns"
            value={displayRace.turns?.toString() || 'N/A'}
          />
          <StatItem 
            icon={<MapIcon size={16} color="#dc2626" />}
            label="Length"
            value={displayRace.circuit_length_km ? `${displayRace.circuit_length_km} km` : 'N/A'}
          />
          <StatItem 
            icon={<Trophy size={16} color="#dc2626" />}
            label="Last Winner"
            value={displayRace.last_winner || 'N/A'}
            fullWidth
          />
          <StatItem 
            icon={<Timer size={16} color="#dc2626" />}
            label="Lap Record"
            value={displayRace.lap_record_time || 'N/A'}
            subValue={displayRace.lap_record_driver || ''}
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
    padding: 16,
    backgroundColor: '#181a20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  loadingText: {
    color: '#b0b3b8',
    fontFamily: 'Formula1-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
  },
  headerCircuitInfo: {
    alignItems: 'flex-end',
  },
  headerCircuitName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Formula1-Regular',
  },
  headerCircuitLocation: {
    color: '#b0b3b8',
    fontSize: 9,
    fontFamily: 'Formula1-Regular',
  },
  card: {
    backgroundColor: '#23272f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
  },
  mapContainer: {
    height: 160,
    backgroundColor: '#1e2128',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  statsGrid: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 6,
  },
  statItemFull: {
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  statLabel: {
    color: '#b0b3b8',
    fontSize: 10,
    fontFamily: 'Formula1-Regular',
  },
  statValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  statSubValue: {
    color: '#666',
    fontSize: 9,
    marginTop: 1,
    fontFamily: 'Formula1-Regular',
  },
});
