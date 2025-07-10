import React from 'react';
import { View, Pressable, Dimensions, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { RadioCard } from './RadioCard';
import { useRadioCards } from '@/hooks/useRadioCards';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedRadioCards = () => {
  const {
    radioCards,
    activeCard,
    animatedLeftCardStyle,
    animatedRightCardStyle,
    toggleCard,
    isWeb,
  } = useRadioCards(2);

  if (radioCards.length < 2) return null;

  const [leftCardData, rightCardData] = radioCards;

  // Responsive sizing
  const cardWidth = 280;
  const visibleStrip = 14; // must match hook visibleAmount
  const cardScale = isWeb ? 0.7 : 1;
  const cardTop = isWeb ? 150 : 120;
  const cardZIndex = isWeb ? 10 : 20;

  // Debug info
  console.log('AnimatedRadioCards render:', {
    Platform: Platform.OS,
    screenWidth,
    isWeb,
    visibleStrip,
    cardWidth
  });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
        zIndex: 1000, // Ensure container is on top
      }}
    >
      {/* Left Radio Card */}
      {leftCardData && (
        <Animated.View
          style={[
            animatedLeftCardStyle,
            {
              position: 'absolute',
              left: 0,
              top: cardTop,
              zIndex: cardZIndex,
              width: cardWidth,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              console.log('LEFT CARD PRESSED');
              toggleCard('left');
            }}
            disabled={isWeb}
            hitSlop={{ top: 20, bottom: 20, right: cardWidth - visibleStrip }}
          >
            <View style={{ transform: [{ scale: cardScale }] }} pointerEvents="none">
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
              left: 0,
              top: cardTop,
              zIndex: cardZIndex,
              width: cardWidth,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              console.log('RIGHT CARD PRESSED');
              toggleCard('right');
            }}
            disabled={isWeb}
            hitSlop={{ top: 20, bottom: 20, left: cardWidth - visibleStrip }}
          >
            <View style={{ transform: [{ scale: cardScale }] }} pointerEvents="none">
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

      {/* Mobile overlay */}
      {!isWeb && activeCard && (
        <Pressable
          onPress={() => toggleCard(activeCard)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 15,
          }}
        />
      )}
    </View>
  );
};

export default AnimatedRadioCards; 