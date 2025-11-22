import React from 'react';
import { View, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Database } from '@/types/supabase';

type ScreeningData = Database['public']['Tables']['screenings']['Row'];

interface ScreeningGridProps {
  screenings: ScreeningData[];
  renderScreening: (screening: ScreeningData, index: number) => React.ReactNode;
}

export function ScreeningGrid({ screenings, renderScreening }: ScreeningGridProps) {
  const { width } = useWindowDimensions();
  const isSmallWeb = width < 768;

  // Web Layout (Responsive Grid)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webGrid}>
          {screenings.map((screening, index) => (
            <View key={screening.id} style={styles.gridItem}>
              {renderScreening(screening, index)}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Mobile Layout (Vertical Stack with spacing)
  return (
    <View style={styles.mobileContainer}>
      {screenings.map((screening, index) => (
        <View key={screening.id} style={styles.mobileItem}>
          {renderScreening(screening, index)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  webGrid: {
    // @ts-ignore - React Native Web supports grid layout in styles
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    padding: 24,
    width: '100%',
    maxWidth: 1200,
  },
  gridItem: {
    height: '100%',
  },
  mobileContainer: {
    padding: 16,
    gap: 16,
  },
  mobileItem: {
    width: '100%',
    marginBottom: 16,
  },
});
