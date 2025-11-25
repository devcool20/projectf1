import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Calendar, Clock, MapPin, Flag } from 'lucide-react-native';

type RaceData = Database['public']['Tables']['races']['Row'];

export function CalendarView() {
  const [races, setRaces] = useState<RaceData[]>([]);
  const [nextRace, setNextRace] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        setRaces(data);
        // Find next upcoming race
        const now = new Date();
        const upcoming = data.find(r => new Date(r.date) >= now);
        setNextRace(upcoming || null);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'TBA';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Calendar...</Text>
      </View>
    );
  }

  if (!nextRace) {
    // Winter Break View
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e2128', '#2a2e37']}
          style={styles.card}
        >
          <View style={styles.winterContainer}>
            <Text style={styles.winterTitle}>Winter Break</Text>
            <Text style={styles.winterSubtitle}>See you next season!</Text>
            {/* Snow animation placeholder - can be enhanced with Lottie or Reanimated */}
            <View style={styles.snowflakeContainer}>
              <Text style={styles.snowflake}>❄️</Text>
              <Text style={[styles.snowflake, { fontSize: 24, marginTop: 20 }]}>❄️</Text>
              <Text style={styles.snowflake}>❄️</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const isSprint = nextRace.is_sprint;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Race Calendar</Text>
      
      <Animated.View entering={FadeInDown.duration(600)} style={styles.nextRaceCard}>
        <LinearGradient
          colors={['#dc2626', '#991b1b']}
          style={styles.nextRaceHeader}
        >
          <Text style={styles.nextRaceLabel}>NEXT RACE</Text>
          <Text style={styles.nextRaceName}>{nextRace.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="white" />
            <Text style={styles.locationText}>{nextRace.country || nextRace.circuit_name}</Text>
          </View>
        </LinearGradient>

        <View style={styles.scheduleContainer}>
          {isSprint ? (
            <>
              <ScheduleItem label="FP1" time={nextRace.fp1_time} />
              <ScheduleItem label="Sprint Quali" time={nextRace.sprint_qualifying_time} />
              <ScheduleItem label="Sprint" time={nextRace.sprint_race_time} highlight />
              <ScheduleItem label="Qualifying" time={nextRace.qualifying_time} />
              <ScheduleItem label="Race" time={nextRace.race_time} highlight />
            </>
          ) : (
            <>
              <ScheduleItem label="FP1" time={nextRace.fp1_time} />
              <ScheduleItem label="FP2" time={nextRace.fp2_time} />
              <ScheduleItem label="FP3" time={nextRace.fp3_time} />
              <ScheduleItem label="Qualifying" time={nextRace.qualifying_time} />
              <ScheduleItem label="Race" time={nextRace.race_time} highlight />
            </>
          )}
        </View>
      </Animated.View>

      <Text style={styles.upcomingTitle}>Upcoming</Text>
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {races.filter(r => new Date(r.date) > new Date(nextRace.date)).map((race, index) => (
          <View key={race.id} style={styles.listItem}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{new Date(race.date).getDate()}</Text>
              <Text style={styles.dateMonth}>{new Date(race.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
            </View>
            <View style={styles.raceInfo}>
              <Text style={styles.raceNameList}>{race.name}</Text>
              <Text style={styles.raceCountry}>{race.country}</Text>
            </View>
            {race.is_sprint && (
              <View style={styles.sprintBadge}>
                <Text style={styles.sprintText}>SPRINT</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ScheduleItem({ label, time, highlight = false }: { label: string, time: string | null, highlight?: boolean }) {
  if (!time) return null;
  const date = new Date(time);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.scheduleRow}>
      <View style={styles.scheduleLabelContainer}>
        <Text style={[styles.scheduleLabel, highlight && styles.highlightText]}>{label}</Text>
      </View>
      <View style={styles.scheduleTimeContainer}>
        <Text style={styles.scheduleDay}>{dayName}</Text>
        <Text style={[styles.scheduleTime, highlight && styles.highlightText]}>{timeStr}</Text>
      </View>
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
    borderRadius: 12,
    padding: 2,
    overflow: 'hidden',
  },
  nextRaceCard: {
    backgroundColor: '#23272f',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextRaceHeader: {
    padding: 16,
  },
  nextRaceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Formula1-Regular',
  },
  nextRaceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Formula1-Regular',
  },
  scheduleContainer: {
    padding: 16,
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scheduleLabelContainer: {
    flex: 1,
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleLabel: {
    color: '#b0b3b8',
    fontSize: 13,
    fontFamily: 'Formula1-Regular',
  },
  scheduleDay: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Formula1-Regular',
    textTransform: 'uppercase',
  },
  scheduleTime: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Formula1-Regular',
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  highlightText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    marginRight: 12,
  },
  dateDay: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  dateMonth: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  raceInfo: {
    flex: 1,
  },
  raceNameList: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Formula1-Regular',
    marginBottom: 2,
  },
  raceCountry: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Formula1-Regular',
  },
  sprintBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sprintText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Formula1-Regular',
  },
  winterContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  winterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Formula1-Regular',
    marginBottom: 8,
  },
  winterSubtitle: {
    fontSize: 16,
    color: '#b0b3b8',
    fontFamily: 'Formula1-Regular',
  },
  snowflakeContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  snowflake: {
    fontSize: 32,
  },
});
