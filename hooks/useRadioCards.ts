import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getRandomRadioCards, type RadioCardData } from '@/lib/radioCardData';

const { width: screenWidth } = Dimensions.get('window');

export const useRadioCards = (cardCount: number = 2) => {
  const [radioCards, setRadioCards] = useState<RadioCardData[]>([]);
  const [activeCard, setActiveCard] = useState<'left' | 'right' | null>(null);

  const cardWidth = 280; // Match the actual card width used in AnimatedRadioCards
  const isWeb = Platform.OS === 'web' && screenWidth > 768; // More reliable mobile detection
  
  // Different positioning for web vs mobile
  let leftCardInitialX: number;
  let rightCardInitialX: number;
  
  if (isWeb) {
    // Web: Fixed positions in middle of free spaces
    leftCardInitialX = 120; // Middle of left free space
    rightCardInitialX = screenWidth - 360; // Middle of right free space
  } else {
    // Mobile: 95% hidden, 14px visible (5% of 280px)
    const visibleAmount = 14; // 14px visible (5% of 280px)
    leftCardInitialX = -cardWidth + visibleAmount; // -280 + 14 = -266 (266px hidden from left)
    rightCardInitialX = screenWidth - visibleAmount; // screenWidth - 14 (266px hidden to the right)
  }
  
  const leftCardX = useSharedValue(leftCardInitialX);
  const rightCardX = useSharedValue(rightCardInitialX);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await getRandomRadioCards(cardCount);
      setRadioCards(cards);
    };
    
    loadCards();
    
    // Force initial positioning immediately
    leftCardX.value = leftCardInitialX;
    rightCardX.value = rightCardInitialX;
  }, [cardCount]);

  useEffect(() => {
    // Reset positions when screen size changes
    leftCardX.value = leftCardInitialX;
    rightCardX.value = rightCardInitialX;
    setActiveCard(null);
  }, [isWeb, leftCardInitialX, rightCardInitialX]);

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
    console.log(`toggleCard called with ${side}, isWeb: ${isWeb}`);
    
    // Only allow toggling on mobile
    if (isWeb) return;
    
    const centerPosition = (screenWidth - cardWidth) / 2; // Exact center of screen
    
    if (activeCard === side) {
      // Card is active, slide it back to hidden position
      if (side === 'left') {
        leftCardX.value = withTiming(leftCardInitialX, { duration: 300 });
      } else {
        rightCardX.value = withTiming(rightCardInitialX, { duration: 300 });
      }
      setActiveCard(null);
    } else {
      // Hide any other active card first
      if (activeCard === 'left') {
        leftCardX.value = withTiming(leftCardInitialX, { duration: 300 });
      } else if (activeCard === 'right') {
        rightCardX.value = withTiming(rightCardInitialX, { duration: 300 });
      }
      
      // Slide the selected card to exact center
      if (side === 'left') {
        leftCardX.value = withTiming(centerPosition, { duration: 300 });
      } else {
        rightCardX.value = withTiming(centerPosition, { duration: 300 });
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
    isWeb,
  };
}; 