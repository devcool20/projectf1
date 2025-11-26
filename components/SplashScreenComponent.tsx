import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface SplashScreenComponentProps {
  onFinish: () => void;
}

export const SplashScreenComponent: React.FC<SplashScreenComponentProps> = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(1)); // Start at full opacity

  useEffect(() => {
    // Auto-hide after 2 seconds with fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1700); // 1.7 seconds visible + 0.3s fade out = 2 seconds total

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
