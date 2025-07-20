import { StyleSheet } from 'react-native';

const BASE_STYLES = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderRadius: 6,
};

export const buttonStyles = StyleSheet.create({
  // Base button style
  base: {
    ...BASE_STYLES,
  },
  
  // Variants
  default: {
    backgroundColor: '#606060', // primary
  },
  destructive: {
    backgroundColor: '#dc2626', // destructive
  },
  outline: {
    borderWidth: 1,
    borderColor: '#ffffff', // border
    backgroundColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#e3e3e3', // secondary
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  cta: {
    backgroundColor: '#dc2626', // f1-red
  },
  
  // Sizes
  default_size: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  lg: {
    height: 44,
    paddingHorizontal: 32,
  },
  icon: {
    height: 40,
    width: 40,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
});

export const textStyles = StyleSheet.create({
  // Base text style
  base: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Architects Daughter',
  },
  
  // Text variants
  default: {
    color: '#ffffff', // primary-foreground
  },
  destructive: {
    color: '#ffffff', // destructive-foreground
  },
  outline: {
    color: '#3a3a3a', // foreground
  },
  secondary: {
    color: '#3a3a3a', // secondary-foreground
  },
  ghost: {
    color: '#3a3a3a', // foreground
  },
  cta: {
    color: '#ffffff',
    fontWeight: '600',
  },
}); 