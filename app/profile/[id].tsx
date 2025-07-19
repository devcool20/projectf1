import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#fff',
      padding: 20
    }}>
      <ActivityIndicator size="large" color="#1DA1F2" />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16, 
        color: '#666',
        textAlign: 'center'
      }}>
        Loading profile...
      </Text>
    </View>
  );
}
