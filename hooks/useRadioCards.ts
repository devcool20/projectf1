import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getRandomRadioCards, type RadioCardData } from '@/lib/radioCardData';

const { width: screenWidth } = Dimensions.get('window');

export const useRadioCards = (cardCount: number = 2) => {
  const [radioCards, setRadioCards] = useState<RadioCardData[]>([]);
  const [activeCard, setActiveCard] = useState<'left' | 'right' | null>(null);

  const cardWidth = 240;
  const isWeb = screenWidth > 768;
  
  // Different positioning for web vs mobile
  let leftCardInitialX: number;
  let rightCardInitialX: number;
  
  if (isWeb) {
    // Web: Position cards in middle of free space (visible and static)
    leftCardInitialX = 130; // Middle of left free space
    rightCardInitialX = screenWidth - 450; // Middle of right free space
  } else {
    // Mobile: Hide cards initially
    const hiddenAmount = cardWidth * 0.9;
    leftCardInitialX = -hiddenAmount;
    rightCardInitialX = screenWidth - cardWidth + hiddenAmount;
  }
  
  const leftCardX = useSharedValue(leftCardInitialX);
  const rightCardX = useSharedValue(rightCardInitialX);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await getRandomRadioCards(cardCount);
      setRadioCards(cards);
    };
    
    loadCards();
  }, [cardCount]);

  const animatedLeftCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: leftCardX.value }],
    };
  });

  const animatedRightCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: rightCardX.value }],
    };
  });

  const toggleCard = (side: 'left' | 'right') => {
    // Only allow toggling on mobile
    if (isWeb) return;
    
    if (activeCard === side) {
      // Hide the active card back to initial position
      if (side === 'left') {
        leftCardX.value = withTiming(leftCardInitialX);
      } else {
        rightCardX.value = withTiming(rightCardInitialX);
      }
      setActiveCard(null);
    } else {
      // Hide the other card if it's active
      if (activeCard === 'left') {
        leftCardX.value = withTiming(leftCardInitialX);
      } else if (activeCard === 'right') {
        rightCardX.value = withTiming(rightCardInitialX);
      }
      
      // Center the selected card
      const centerPosition = (screenWidth - cardWidth) / 2;
      
      if (side === 'left') {
        leftCardX.value = withTiming(centerPosition);
      } else {
        rightCardX.value = withTiming(centerPosition);
      }
      setActiveCard(side);
    }
  };

  return {
    radioCards,
    activeCard,
    animatedLeftCardStyle,
    animatedRightCardStyle,
    toggleCard,
    isWeb, // Export this so components can conditionally disable interactions
  };
}; 