import React from 'react';
import { View } from 'react-native';
import ProfileCarLoadingAnimation from '../../components/ProfileCarLoadingAnimation';

export default function ProfileScreen() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: 'transparent'
      }}>
      <ProfileCarLoadingAnimation 
        duration={1000}
      />
    </View>
  );
}
