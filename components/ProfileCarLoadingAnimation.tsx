import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ProfileCarLoadingAnimationProps {
  duration?: number;
  showLoadingText?: boolean;
}

const ProfileCarLoadingAnimation: React.FC<ProfileCarLoadingAnimationProps> = ({ 
  duration = 1000,
  showLoadingText = false
}) => {
  const carPosition = useRef(new Animated.Value(-200)).current;

  const startAnimation = () => {
    // Reset position to start
    carPosition.setValue(-200);
    
    // Start the car animation from left to right
    Animated.timing(carPosition, {
      toValue: screenWidth + 200, // Move beyond screen width
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      // Loop the animation continuously
      startAnimation();
    });
  };

  useEffect(() => {
    startAnimation();
    
    // Cleanup function to stop animation when component unmounts
    return () => {
      carPosition.stopAnimation();
    };
  }, [duration]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.carContainer,
          {
            transform: [
              { translateX: carPosition },
              { scaleX: -1 }, // Flip horizontally to face right
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/gif/f1car2-unscreen.gif')}
          style={styles.carImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  carContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -50, // Half of car height to center vertically
    zIndex: 1,
  },
  carImage: {
    width: 200,
    height: 100,
  },
});

export default ProfileCarLoadingAnimation; 