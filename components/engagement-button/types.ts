import { ComponentType, PressableProps } from 'react';

export interface EngagementButtonProps extends Omit<PressableProps, 'onPress'> {
  icon: ComponentType<any>;
  active: boolean;
  onPress: () => void;
  type: 'like' | 'repost' | 'bookmark';
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
} 