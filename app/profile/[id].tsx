import React from 'react';
import { View } from 'react-native';
import CarLoadingAnimation from '../../components/CarLoadingAnimation';

export default function ProfileScreen() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: 'transparent'
    }}>
      <CarLoadingAnimation 
        duration={1000}
      />
    </View>
  );
}
