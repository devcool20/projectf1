import React from 'react';
import { View, Text, Image, ScrollView, Dimensions, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RadioCard } from './RadioCard';
import { fetchAllRadioCards, RadioCardData } from '../lib/radioCardData';
import DriverPointsBarChart from './DriverPointsBarChart';
import { drivers } from '../data/drivers';
// Team logo mapping
const TEAM_LOGOS = {
  'Red Bull': require('../team-logos/redbull.png'),
  'Ferrari': require('../team-logos/ferrari.png'),
  'Mercedes': require('../team-logos/mercedes.png'),
  'McLaren': require('../team-logos/mclaren.png'),
  'Aston Martin': require('../team-logos/astonmartin.png'),
  'Alpine': require('../team-logos/alpine.png'),
  'Williams': require('../team-logos/williams.png'),
  'Racing Bulls': require('../team-logos/racingbulls.png'),
  'Kick Sauber': require('../team-logos/stake.png'),
  'Stake F1 Team Kick Sauber': require('../team-logos/stake.png'),
  'Haas': require('../team-logos/haas.png'),
};

interface DriverDetailProps {
  driver: Omit<DriverBio, 'image'> & { image: ImageSourcePropType };
}

const screenWidth = Dimensions.get('window').width;
const bannerHeight = Math.round(screenWidth * 0.40); // Taller hero for more vertical coverage
const APP_BG = '#181a20';

const TEAM_COLORS = {
  'McLaren': '#FF8700',
  'Ferrari': '#DC0000',
  'Red Bull': '#0600EF',
  'Mercedes': '#00D2BE',
  'Aston Martin': '#006F62',
  'Alpine': '#0090FF',
  'Williams': '#005AFF',
  'Racing Bulls': '#6692FF',
  'Kick Sauber': '#52E252',
  'Stake F1 Team Kick Sauber': '#52E252',
  'Haas': '#FFFFFF',
};

// Local image mapping for drivers
const DRIVER_IMAGES = {
  'Max Verstappen': require('../assets/images/drivers/max.png'),
  'Lewis Hamilton': require('../assets/images/drivers/lewis.png'),
  'George Russell': require('../assets/images/drivers/george.png'),
  'Charles Leclerc': require('../assets/images/drivers/charles.png'),
  'Carlos Sainz': require('../assets/images/drivers/carlos.png'),
  'Lando Norris': require('../assets/images/drivers/lando.png'),
  'Oscar Piastri': require('../assets/images/drivers/oscar.png'),
  'Fernando Alonso': require('../assets/images/drivers/fernando.png'),
  'Lance Stroll': require('../assets/images/drivers/lance.png'),
  'Esteban Ocon': require('../assets/images/drivers/esteban.png'),
  'Pierre Gasly': require('../assets/images/drivers/pierre.png'),
  'Yuki Tsunoda': require('../assets/images/drivers/yuki.png'),
  'Franco Colapinto': require('../assets/images/drivers/franco.png'),
  'Alex Albon': require('../assets/images/drivers/alex.png'),
  'Oliver Bearman': require('../assets/images/drivers/oliver.png'),
  'Kimi Antonelli': require('../assets/images/drivers/kimi.png'),
  'Gabriel Bortoleto': require('../assets/images/drivers/gabriel.png'),
  'Nico Hulkenberg': require('../assets/images/drivers/nico.png'),
  'Liam Lawson': require('../assets/images/drivers/liam.png'),
  'Isack Hadjar': require('../assets/images/drivers/isack.png'),
};

const DriverDetail = ({ driverName, about: aboutProp }) => {
  const [driver, setDriver] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);
  const [racePoints, setRacePoints] = useState([]);
  const [radioCard, setRadioCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      console.log('Fetching driver_standings for:', driverName);
      if (!driverName || typeof driverName !== 'string' || !driverName.trim()) {
        setLoading(false);
        return;
      }
      // Fetch driver info
      const { data: driverData } = await supabase
        .from('driver_standings')
        .select('*')
        .eq('driver_name', driverName)
        .single();
      setDriver(driverData);
      // Fetch all drivers for position
      const { data: allDriversData } = await supabase
        .from('driver_standings')
        .select('*');
      setAllDrivers(allDriversData || []);
      // Fetch race-by-race points
      const { data: pointsData } = await supabase
        .from('driver_race_points')
        .select('round, points')
        .eq('driver_name', driverName)
        .order('round', { ascending: true });
      setRacePoints(pointsData || []);
      // Fetch radio card
      const cards = await fetchAllRadioCards();
      const card = cards.find(card =>
        typeof card.driverName === 'string' &&
        typeof driverName === 'string' &&
        card.driverName.toLowerCase() === driverName.toLowerCase()
      );
      setRadioCard(card || null);
      setLoading(false);
    }
    fetchData();
  }, [driverName]);

  if (loading || !driver) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_BG }}><Text style={{ color: '#fff' }}>Loading...</Text></View>;
  }

  // Calculate position
  const sortedDrivers = [...allDrivers].sort((a, b) => b.points - a.points);
  const position = sortedDrivers.findIndex(d => d.driver_name === driver.driver_name) + 1;
  const teamColor = TEAM_COLORS[driver.team_name] || '#fff';
  const [firstName, ...lastNameArr] = driver.driver_name.split(' ');
  const lastName = lastNameArr.join(' ');

  // Get country and number from drivers.ts
  const driverStatic = drivers.find(d => d.name === driver.driver_name);
  const country = driverStatic ? driverStatic.country : '';
  const number = driverStatic ? driverStatic.number : '';
  const teamLogo = TEAM_LOGOS[driver.team_name];

  // Use driverFacts from drivers.ts
  const driverFacts = driverStatic && driverStatic.driverFacts ? driverStatic.driverFacts : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: APP_BG }} contentContainerStyle={{ padding: 0 }}>
      <View style={{ width: screenWidth, height: bannerHeight, position: 'relative' }}>
    <Image
          source={DRIVER_IMAGES[driver.driver_name]}
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
      {/* Header split layout */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 24, marginBottom: 24 }}>
        {/* Left side */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
            <Text style={{ color: '#fff' }}>{firstName} </Text>
            <Text style={{ color: teamColor }}>{lastName}</Text>
          </Text>
          <Text style={{ fontSize: 18, color: '#b0b3b8', marginBottom: 2 }}>{driver.team_name}</Text>
          {/* Team logo, number, country stacked vertically */}
          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 4, marginBottom: 2 }}>
            {teamLogo && <Image source={teamLogo} style={{ width: 28, height: 28, marginBottom: 10 }} resizeMode="contain" />}
            {number && <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>#{number}</Text>}
            {country && <Text style={{ color: '#fff', fontSize: 16, marginBottom: 2 }}>{country}</Text>}
          </View>
        </View>
        {/* Right side */}
        <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.points}</Text>
        <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Points</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.wins}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Wins</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.podiums}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Podiums</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.poles}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Poles</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{driver.dnfs}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 12 }}>DNFs</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{position}</Text>
          <Text style={{ color: '#b0b3b8', fontSize: 12 }}>Position</Text>
        </View>
      </View>
      {/* Bar chart */}
      <View style={{ marginBottom: 32, paddingHorizontal: 20 }}>
        <DriverPointsBarChart pointsData={racePoints} teamColor={teamColor} />
      </View>
      {/* About section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>About</Text>
        <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24 }}>{aboutProp || driver.about}</Text>
      </View>
      {/* Driver Facts section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Driver Facts</Text>
        {driverFacts.map((fact, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22 }}>{fact}</Text>
            {idx < driverFacts.length - 1 && <View style={{ height: 1, backgroundColor: '#fff', opacity: 0.2, marginVertical: 8 }} />}
          </View>
        ))}
      </View>
      {/* Famous Radio Section */}
      {radioCard && (
        <View style={{ marginTop: 32, marginBottom: 32, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Famous Radio:</Text>
          <RadioCard
            teamColor={radioCard.teamColor}
            teamIcon={radioCard.teamIcon}
            title={driver.driver_name}
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