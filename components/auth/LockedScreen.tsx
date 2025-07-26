import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Lock, Zap } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

interface LockedScreenProps {
  onGetStarted: () => void;
  title?: string;
  subtitle?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function LockedScreen({ 
  onGetStarted, 
  title = "Unlock This Feature", 
  subtitle = "Sign up to access all projectF1 features and join the community!" 
}: LockedScreenProps) {
  const pulseValue = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Pulse animation for the button
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Sparkle animation
    sparkleOpacity.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(1, { duration: 500 })),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Translucent overlay */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Lock icon */}
        <View style={styles.iconContainer}>
          <Lock size={48} color="#dc2626" />
          <Animated.View style={[styles.sparkle, sparkleStyle]}>
            <Zap size={16} color="#dc2626" />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Get Started Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity style={styles.button} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Zap size={20} color="#ffffff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>

        {/* Feature highlights */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Join the F1 community</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Share your thoughts</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Get latest news</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    maxWidth: 400,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Formula1-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e5e5',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Formula1-Regular',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: 'Formula1-Bold',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  features: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    marginRight: 12,
  },
  featureText: {
    color: '#e5e5e5',
    fontSize: 16,
    fontFamily: 'Formula1-Regular',
  },
}); 