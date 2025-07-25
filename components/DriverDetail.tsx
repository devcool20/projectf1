import React from 'react';
import { View, Text, Image, ScrollView, Dimensions, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { fetchAllRadioCards, RadioCardData } from '../lib/radioCardData';
import { RadioCard } from './RadioCard';
import { DriverBio } from '../data/drivers';

interface DriverDetailProps {
  driver: Omit<DriverBio, 'image'> & { image: ImageSourcePropType };
}

const screenWidth = Dimensions.get('window').width;
const bannerHeight = Math.round(screenWidth * 0.40); // Taller hero for more vertical coverage
const APP_BG = '#181a20';

const DriverDetail: React.FC<DriverDetailProps> = ({ driver }) => {
  const [radioCard, setRadioCard] = useState<RadioCardData | null>(null);

  useEffect(() => {
    fetchAllRadioCards().then(cards => {
      const card = cards.find(card => card.driverName.toLowerCase() === driver.name.toLowerCase());
      setRadioCard(card || null);
    });
  }, [driver.name]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#181a20' }} contentContainerStyle={{ padding: 0 }}>
      <View style={{ width: screenWidth, height: bannerHeight, position: 'relative' }}>
        <Image
          source={driver.image}
          style={{ width: screenWidth, height: bannerHeight, marginTop: 0 }}
          resizeMode="cover"
        />
        {/* Upper vignette */}
        <LinearGradient
          colors={[APP_BG, 'rgba(24,26,32,0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.25 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: bannerHeight * 0.35 }}
        />
        {/* Lower vignette */}
        <LinearGradient
          colors={['rgba(24,26,32,0.0)', APP_BG]}
          start={{ x: 0.5, y: 0.7 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: bannerHeight * 0.05 }}
        />
      </View>
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
      {/* Famous Radio Section */}
      {radioCard && (
        <View style={{ marginTop: 32, marginBottom: 32, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Famous Radio:</Text>
          <RadioCard
            teamColor={radioCard.teamColor}
            teamIcon={radioCard.teamIcon}
            title={driver.name}
            driverResponse={radioCard.driverResponse}
            teamResponse={radioCard.teamResponse}
            responseOrder={radioCard.responseOrder}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default DriverDetail; 