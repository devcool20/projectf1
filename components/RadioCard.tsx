import React from 'react';
import { View, Text, Image } from 'react-native';

const teamLogos: { [key: string]: any } = {
  ferrari: require('../team-logos/ferrari.png'),
  mercedes: require('../team-logos/mercedes.png'),
  redbull: require('../team-logos/redbull.png'),
  mclaren: require('../team-logos/mclaren.png'),
  alpine: require('../team-logos/alpine.png'),
  astonmartin: require('../team-logos/astonmartin.png'),
  haas: require('../team-logos/haas.png'),
  racingbulls: require('../team-logos/racingbulls.png'),
  williams: require('../team-logos/williams.png'),
  stake: require('../team-logos/stake.png'),
  fia: require('../team-logos/fia.png'), // Admin-only team
};

/**
 * A component to render a sound wave visualization.
 * @param color The color of the wave bars.
 */
const SoundWave = ({ color }: { color:string }) => {
  // Shortened the wave to prevent overflow within its container.
  const barHeights = [
    4, 8, 6, 10, 12, 7, 9, 11, 5, 8, 10, 12, 14, 10, 8, 6, 9, 11, 7, 5, 4,
    3, 5, 7, 9, 6, 4, 2, 7, 10, 8, 11, 5, 6, 10, 8, 13, 11, 7, 9, 12, 5, 8,
    10, 13, 15, 11, 9, 7, 10, 12, 8, 6, 5, 4, 6, 8, 10, 7, 5
  ];

  return (
    <View className="flex-row items-end h-6" style={{ width: '100%', justifyContent: 'space-between' }}>
      {barHeights.map((height, index) => (
        <View
          key={index}
          style={{
            height: height,
            width: 3, // Slightly wider bars
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
};

interface RadioCardProps {
  teamColor?: string;
  teamIcon?: string;
  title?: string;
  quote1?: string;
  quote2?: string;
  driverResponse?: string;
  teamResponse?: string;
  responseOrder?: 'T' | 'D';
}

/**
 * A card component for "Loremipsum Radio" based on the user's design.
 * It's designed to be reusable with dynamic colors and content.
 */
export const RadioCard = ({
  teamColor = '#00D8C9', // Defaulting to the teal from the first image
  teamIcon,
  title = "LOREMIPSUM",
  quote1 = '"LOREM IPSUM DOLOR SIT AMET"',
  quote2 = '"LOREM IPSUM DOLOR SIT AMET, CONSECTETUER"',
  driverResponse,
  teamResponse,
  responseOrder = 'D'
}: RadioCardProps) => {

  const IconComponent = teamIcon ? (
    <Image source={teamLogos[teamIcon]} style={{ width: 38, height: 38 }} resizeMode="contain" className="mr-1" />
  ) : null;

  // Determine which response comes first and second based on responseOrder
  const firstResponse = responseOrder === 'D' ? driverResponse : teamResponse;
  const secondResponse = responseOrder === 'D' ? teamResponse : driverResponse;
  
  // Use provided responses if available, otherwise fall back to quote1/quote2
  const displayQuote1 = driverResponse && teamResponse ? firstResponse : quote1;
  const displayQuote2 = driverResponse && teamResponse ? secondResponse : quote2;
  
  // Determine if the first/second response is from driver (for styling)
  const isFirstResponseDriver = responseOrder === 'D';
  const isSecondResponseDriver = responseOrder === 'T';

  return (
    <View 
        className="bg-[#2a2a2e] rounded-xl p-4 shadow-lg" 
        style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 6, 
            elevation: 8 
        }}
    >
      {/* Top Section */}
      <View className="items-end">
        <Text style={{ color: teamColor }} className="text-xl font-extrabold tracking-wider">
        {title}
        </Text>
        <View className="flex-row items-center space-x-2 mt-1">
        {IconComponent}
        <Text className="text-white text-xl font-extrabold tracking-wider">
            RADIO
        </Text>
        </View>
      </View>
      <View className="mt-3 flex-row justify-center">
        <SoundWave color={teamColor} />
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-500/50 my-2" />

      {/* Bottom Section */}
      <View className="pt-1">
        <Text 
          style={{ color: isFirstResponseDriver ? teamColor : '#d1d5db' }} 
          className="text-xs font-bold tracking-wide text-left"
        >
          {displayQuote1}
        </Text>
        <Text 
          style={{ color: isSecondResponseDriver ? teamColor : '#d1d5db' }} 
          className="text-xs font-bold tracking-wide mt-1 text-right"
        >
          {displayQuote2}
        </Text>
      </View>
    </View>
  );
}; 