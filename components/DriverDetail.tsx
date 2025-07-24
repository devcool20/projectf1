import React from 'react';
import { View, Text, Image, ScrollView, Dimensions, ImageSourcePropType } from 'react-native';
import { DriverBio } from '../data/drivers';

interface DriverDetailProps {
  driver: Omit<DriverBio, 'image'> & { image: ImageSourcePropType };
}

const screenWidth = Dimensions.get('window').width;
const bannerHeight = Math.round(screenWidth / 2); // 2:1 aspect ratio for more vertical space

const DriverDetail: React.FC<DriverDetailProps> = ({ driver }) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#181a20' }} contentContainerStyle={{ padding: 0 }}>
    <Image
      source={driver.image}
      style={{ width: screenWidth, height: bannerHeight }}
      resizeMode="contain"
    />
    <View style={{ alignItems: 'center', marginBottom: 24, paddingHorizontal: 20, marginTop: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>{driver.name}</Text>
      <Text style={{ fontSize: 18, color: '#b0b3b8', marginBottom: 8 }}>{driver.team}</Text>
      <Text style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>#{driver.number} | {driver.country}</Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.points}</Text>
        <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Points</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.wins}</Text>
        <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Wins</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.podiums}</Text>
        <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Podiums</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.poles}</Text>
        <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Poles</Text>
      </View>
    </View>
    <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24, paddingHorizontal: 20 }}>{driver.about}</Text>
  </ScrollView>
);

export default DriverDetail; 