import React, { FC, useCallback, useEffect } from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { EngagementButtonProps } from './types';
import { styles } from './styles';

const EngagementButton: FC<EngagementButtonProps> = ({
  icon: Icon,
  active,
  onPress,
  type,
  size = 24,
  activeColor,
  inactiveColor = '#6b7280',
  style,
  ...rest
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const fill = useSharedValue(active ? 1 : 0);
  const translateY = useSharedValue(0); // For bookmark bounce effect

  // Update fill value when active prop changes
  useEffect(() => {
    fill.value = active ? 1 : 0;
  }, [active, fill]);

  // Default colors for each type
  const getDefaultActiveColor = () => {
    switch (type) {
      case 'like':
        return '#dc2626'; // F1 red per PRD
      case 'repost':
        return '#10b981'; // green per PRD
      case 'bookmark':
        return '#f59e0b'; // amber per PRD
      default:
        return '#6b7280';
    }
  };

  const defaultActiveColor = getDefaultActiveColor();
  const finalActiveColor = activeColor || defaultActiveColor;

  // Animate on state change (only for like button)
  useEffect(() => {
    if (type === 'like') {
      if (active) {
        // Like animation: scale up, spring back, fill color
        scale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
      } else {
        // Unlike animation: scale down slightly, fade color
        scale.value = withSequence(
          withSpring(0.95, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
      }
    }
  }, [active, type, scale]);

  // Animated styles for transform
  const animatedStyle = useAnimatedStyle(() => {
    const transforms = [{ scale: scale.value }];
    
    if (type === 'repost') {
      transforms.push({ rotate: `${rotate.value}deg` });
    }
    
    // Add translateY for bookmark bounce effect on web
    if (type === 'bookmark' && Platform.OS === 'web') {
      transforms.push({ translateY: translateY.value });
    }
    
    return {
      transform: transforms,
    };
  });

  // Animated color interpolation
  const animatedColor = useAnimatedStyle(() => {
    const color = interpolateColor(
      fill.value,
      [0, 1],
      [inactiveColor, finalActiveColor]
    );
    
    return { color };
  });

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    // Provide haptic feedback only on native platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Trigger press animation for immediate feedback based on type
    if (type === 'like') {
      scale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    } else if (type === 'repost') {
      // Repost animation: 360° rotation with scale effect
      rotate.value = withSequence(
        withTiming(360, { duration: 400 }),
        withTiming(0, { duration: 0 })
      );
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    } else if (type === 'bookmark') {
      // Bookmark animation: scale up with bounce effect
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      // Add bounce effect for web
      if (Platform.OS === 'web') {
        translateY.value = withSequence(
          withSpring(-2, { damping: 10, stiffness: 400 }),
          withSpring(0, { damping: 15, stiffness: 300 })
        );
      }
    }
    
    onPress();
  }, [onPress, type, scale, rotate, translateY]);

  return (
    <Pressable 
      onPress={handlePress} 
      style={[styles.container, style]}
      {...rest}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Icon
          size={size}
          // @ts-ignore: Animated color prop
          color={animatedColor.color}
          fill={(type === 'like' || type === 'bookmark') && active ? finalActiveColor : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
};

export default EngagementButton; 