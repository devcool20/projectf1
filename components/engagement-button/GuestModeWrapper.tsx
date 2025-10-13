import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

interface GuestModeWrapperProps {
  children: React.ReactNode;
  onPress: () => void;
}

export function GuestModeWrapper({ children, onPress }: GuestModeWrapperProps) {
  const { session, isGuestMode } = useAuth();

  const handlePress = () => {
    if (!session && isGuestMode) {
      Alert.alert(
        'Sign in required',
        'Please sign in to interact with posts',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign in', 
            onPress: () => {
              router.push('/profile');
            }
          }
        ]
      );
      return;
    }
    onPress();
  };

  return React.cloneElement(React.Children.only(children) as React.ReactElement, {
    onPress: handlePress
  });
}
