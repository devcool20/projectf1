import React from 'react';
import { Pressable, ViewStyle, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HoverableCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}

export function HoverableCard({ children, style, onPress, disabled }: HoverableCardProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    shadowOpacity: shadowOpacity.value,
  }));

  const handleHoverIn = () => {
    if (disabled || Platform.OS !== 'web') return;
    scale.value = withSpring(1.02, { damping: 10, stiffness: 100 });
    translateY.value = withSpring(-4, { damping: 10, stiffness: 100 });
    shadowOpacity.value = withTiming(0.6);
  };

  const handleHoverOut = () => {
    if (disabled || Platform.OS !== 'web') return;
    scale.value = withSpring(1);
    translateY.value = withSpring(0);
    shadowOpacity.value = withTiming(0.3);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        style,
        animatedStyle,
        Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

