import React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { RadioCard } from './RadioCard';
import { useRadioCards } from '@/hooks/useRadioCards';

interface AnimatedRadioCardsProps {
  cardCount?: number;
}

export const AnimatedRadioCards: React.FC<AnimatedRadioCardsProps> = ({ cardCount = 2 }) => {
  const { width: screenWidth } = useWindowDimensions();
  const {
    radioCards,
    activeCard,
    animatedLeftCardStyle,
    animatedRightCardStyle,
    toggleCard,
    isWeb,
  } = useRadioCards(cardCount);

  const [leftCardData, rightCardData] = radioCards;

  // Responsive sizing
  const cardWidth = isWeb ? 280 : 240;
  const cardScale = isWeb ? 0.9 : 0.75;
  const cardTop = isWeb ? 200 : 250;

  return (
    <>
      {/* Left Radio Card */}
      {leftCardData && (
        <Animated.View 
          style={[
            animatedLeftCardStyle, 
            { 
              position: 'absolute', 
              top: cardTop,
              zIndex: 30, 
              width: cardWidth, 
            }
          ]}
        >
          <Pressable onPress={isWeb ? undefined : () => toggleCard('left')}>
            <View style={{ transform: [{ scale: cardScale }] }}>
              <RadioCard
                teamColor={leftCardData.teamColor}
                teamIcon={leftCardData.teamIcon}
                title={leftCardData.driverName}
                driverResponse={leftCardData.driverResponse}
                teamResponse={leftCardData.teamResponse}
                responseOrder={leftCardData.responseOrder}
              />
            </View>
          </Pressable>
        </Animated.View>
      )}
      
      {/* Right Radio Card */}
      {rightCardData && (
        <Animated.View 
          style={[
            animatedRightCardStyle, 
            { 
              position: 'absolute', 
              top: cardTop,
              zIndex: 30, 
              width: cardWidth, 
            }
          ]}
        >
          <Pressable onPress={isWeb ? undefined : () => toggleCard('right')}>
            <View style={{ transform: [{ scale: cardScale }] }}>
              <RadioCard
                teamColor={rightCardData.teamColor}
                teamIcon={rightCardData.teamIcon}
                title={rightCardData.driverName}
                driverResponse={rightCardData.driverResponse}
                teamResponse={rightCardData.teamResponse}
                responseOrder={rightCardData.responseOrder}
              />
            </View>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}; 