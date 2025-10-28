import React from 'react';
import { View, Platform } from 'react-native';
import { Database } from '@/types/supabase';

type ScreeningData = Database['public']['Tables']['screenings']['Row'];

interface ScreeningGridProps {
  screenings: ScreeningData[];
  renderScreening: (screening: ScreeningData) => React.ReactNode;
}

export function ScreeningGrid({ screenings, renderScreening }: ScreeningGridProps) {
  // Only apply grid layout on web
  if (Platform.OS === 'web') {
    return (
      <View style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        padding: '16px 24px',
      }}>
        {screenings.slice(0, 9).map((screening) => (
          <View key={screening.id} style={{ width: '100%' }}>
            {renderScreening(screening)}
          </View>
        ))}
      </View>
    );
  }

  // Return regular vertical layout for mobile
  return (
    <View className="space-y-4">
      {screenings.map(renderScreening)}
    </View>
  );
}
