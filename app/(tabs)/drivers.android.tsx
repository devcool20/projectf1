import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  Trophy,
  Users,
  Flag,
  Star,
  ChevronRight,
  MapPin,
  Calendar,
  Award,
  Clock,
  Zap,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button.android';
import styles from './drivers.styles.android';

interface Driver {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  number: string;
  nationality: string;
  countryCode: string;
  image: string;
  carImage: string;
  championships: number;
  races: number;
  podiums: number;
  points: number;
  wins: number;
  position: number;
  age: number;
  birthDate: string;
  birthPlace: string;
  isActive: boolean;
}

interface FilterOptions {
  team: string;
  nationality: string;
  championship: 'all' | 'champions' | 'no-champions';
  sortBy: 'position' | 'name' | 'age' | 'wins' | 'podiums';
  sortOrder: 'asc' | 'desc';
}

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    team: 'all',
    nationality: 'all',
    championship: 'all',
    sortBy: 'position',
    sortOrder: 'asc',
  });

  // Mock F1 driver data - in a real app, this would come from F1 API
  const mockDrivers: Driver[] = [
    {
      id: '1',
      name: 'Max Verstappen',
      firstName: 'Max',
      lastName: 'Verstappen',
      team: 'Red Bull Racing',
      teamColor: '#1e3a8a',
      number: '1',
      nationality: 'Dutch',
      countryCode: 'NL',
      image: 'https://via.placeholder.com/150x200/1e3a8a/ffffff?text=MV',
      carImage: 'https://via.placeholder.com/200x100/1e3a8a/ffffff?text=RB',
      championships: 3,
      races: 182,
      podiums: 98,
      points: 575,
      wins: 54,
      position: 1,
      age: 26,
      birthDate: '1997-09-30',
      birthPlace: 'Hasselt, Belgium',
      isActive: true,
    },
    {
      id: '2',
      name: 'Lewis Hamilton',
      firstName: 'Lewis',
      lastName: 'Hamilton',
      team: 'Mercedes',
      teamColor: '#00d2be',
      number: '44',
      nationality: 'British',
      countryCode: 'GB',
      image: 'https://via.placeholder.com/150x200/00d2be/ffffff?text=LH',
      carImage: 'https://via.placeholder.com/200x100/00d2be/ffffff?text=MB',
      championships: 7,
      races: 334,
      podiums: 197,
      points: 234,
      wins: 103,
      position: 2,
      age: 39,
      birthDate: '1985-01-07',
      birthPlace: 'Stevenage, England',
      isActive: true,
    },
    {
      id: '3',
      name: 'Charles Leclerc',
      firstName: 'Charles',
      lastName: 'Leclerc',
      team: 'Ferrari',
      teamColor: '#dc2626',
      number: '16',
      nationality: 'Monégasque',
      countryCode: 'MC',
      image: 'https://via.placeholder.com/150x200/dc2626/ffffff?text=CL',
      carImage: 'https://via.placeholder.com/200x100/dc2626/ffffff?text=SF',
      championships: 0,
      races: 132,
      podiums: 26,
      points: 206,
      wins: 5,
      position: 3,
      age: 26,
      birthDate: '1997-10-16',
      birthPlace: 'Monte Carlo, Monaco',
      isActive: true,
    },
    {
      id: '4',
      name: 'Lando Norris',
      firstName: 'Lando',
      lastName: 'Norris',
      team: 'McLaren',
      teamColor: '#ff8700',
      number: '4',
      nationality: 'British',
      countryCode: 'GB',
      image: 'https://via.placeholder.com/150x200/ff8700/ffffff?text=LN',
      carImage: 'https://via.placeholder.com/200x100/ff8700/ffffff?text=MC',
      championships: 0,
      races: 109,
      podiums: 13,
      points: 189,
      wins: 1,
      position: 4,
      age: 24,
      birthDate: '1999-11-13',
      birthPlace: 'Bristol, England',
      isActive: true,
    },
    {
      id: '5',
      name: 'Oscar Piastri',
      firstName: 'Oscar',
      lastName: 'Piastri',
      team: 'McLaren',
      teamColor: '#ff8700',
      number: '81',
      nationality: 'Australian',
      countryCode: 'AU',
      image: 'https://via.placeholder.com/150x200/ff8700/ffffff?text=OP',
      carImage: 'https://via.placeholder.com/200x100/ff8700/ffffff?text=MC',
      championships: 0,
      races: 43,
      podiums: 4,
      points: 162,
      wins: 2,
      position: 5,
      age: 23,
      birthDate: '2001-04-06',
      birthPlace: 'Melbourne, Australia',
      isActive: true,
    },
    {
      id: '6',
      name: 'Carlos Sainz',
      firstName: 'Carlos',
      lastName: 'Sainz',
      team: 'Ferrari',
      teamColor: '#dc2626',
      number: '55',
      nationality: 'Spanish',
      countryCode: 'ES',
      image: 'https://via.placeholder.com/150x200/dc2626/ffffff?text=CS',
      carImage: 'https://via.placeholder.com/200x100/dc2626/ffffff?text=SF',
      championships: 0,
      races: 200,
      podiums: 23,
      points: 150,
      wins: 3,
      position: 6,
      age: 30,
      birthDate: '1994-09-01',
      birthPlace: 'Madrid, Spain',
      isActive: true,
    },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [drivers, searchQuery, filters]);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      await loadDrivers();
    } catch (error) {
      console.error('Error initializing drivers screen:', error);
      Alert.alert('Error', 'Failed to load drivers data');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      // In a real app, this would fetch from F1 API
      // For now, we'll simulate API delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
      throw error;
    }
  };

  const applyFilters = () => {
    let filtered = [...drivers];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.nationality.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Team filter
    if (filters.team !== 'all') {
      filtered = filtered.filter(driver => driver.team === filters.team);
    }

    // Nationality filter
    if (filters.nationality !== 'all') {
      filtered = filtered.filter(driver => driver.nationality === filters.nationality);
    }

    // Championship filter
    if (filters.championship === 'champions') {
      filtered = filtered.filter(driver => driver.championships > 0);
    } else if (filters.championship === 'no-champions') {
      filtered = filtered.filter(driver => driver.championships === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'position':
          aValue = a.position;
          bValue = b.position;
          break;
        case 'name':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'wins':
          aValue = a.wins;
          bValue = b.wins;
          break;
        case 'podiums':
          aValue = a.podiums;
          bValue = b.podiums;
          break;
        default:
          aValue = a.position;
          bValue = b.position;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDrivers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const handleDriverPress = (driver: Driver) => {
    Alert.alert(
      driver.name,
      `Team: ${driver.team}\nPosition: ${driver.position}\nPoints: ${driver.points}\nWins: ${driver.wins}`
    );
  };

  const resetFilters = () => {
    setFilters({
      team: 'all',
      nationality: 'all',
      championship: 'all',
      sortBy: 'position',
      sortOrder: 'asc',
    });
  };

  const getUniqueTeams = () => {
    const teams = [...new Set(drivers.map(driver => driver.team))];
    return teams.sort();
  };

  const getUniqueNationalities = () => {
    const nationalities = [...new Set(drivers.map(driver => driver.nationality))];
    return nationalities.sort();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#dc2626', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerBanner}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTitleContainer}>
          <Trophy size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>F1 Drivers</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          2024 Championship Standings
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Users size={20} color="#ffffff" />
            <Text style={styles.statText}>{drivers.length} Drivers</Text>
          </View>
          <View style={styles.statItem}>
            <Flag size={20} color="#ffffff" />
            <Text style={styles.statText}>Current Season</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drivers, teams, or nationality..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666666"
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color="#dc2626" />
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Team</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filters.team === 'all' && styles.filterChipActive
                  ]}
                  onPress={() => setFilters({ ...filters, team: 'all' })}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.team === 'all' && styles.filterChipTextActive
                  ]}>All</Text>
                </TouchableOpacity>
                {getUniqueTeams().map(team => (
                  <TouchableOpacity
                    key={team}
                    style={[
                      styles.filterChip,
                      filters.team === team && styles.filterChipActive
                    ]}
                    onPress={() => setFilters({ ...filters, team })}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.team === team && styles.filterChipTextActive
                    ]}>{team}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
          <Text style={styles.resetFiltersText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDriverCard = ({ item: driver }: { item: Driver }) => (
    <TouchableOpacity
      style={styles.driverCard}
      onPress={() => handleDriverPress(driver)}
    >
      <View style={styles.driverCardHeader}>
        <View style={styles.driverPosition}>
          <Text style={styles.driverPositionText}>{driver.position}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverTeam}>{driver.team}</Text>
        </View>
        <View style={styles.driverNumber}>
          <Text style={styles.driverNumberText}>{driver.number}</Text>
        </View>
      </View>

      <View style={styles.driverCardContent}>
        <View style={styles.driverImageContainer}>
          <Image
            source={{ uri: driver.image }}
            style={styles.driverImage}
            resizeMode="cover"
          />
          <View style={styles.nationalityBadge}>
            <Text style={styles.nationalityText}>{driver.countryCode}</Text>
          </View>
        </View>

        <View style={styles.driverStats}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.championships}</Text>
              <Text style={styles.statLabel}>Championships</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.podiums}</Text>
              <Text style={styles.statLabel}>Podiums</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Zap size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Flag size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.races}</Text>
              <Text style={styles.statLabel}>Races</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={16} color="#dc2626" />
              <Text style={styles.statValue}>{driver.age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.driverCardFooter}>
        <View style={[styles.teamColorBar, { backgroundColor: driver.teamColor }]} />
        <ChevronRight size={16} color="#999999" style={styles.chevronRight} />
      </View>
    </TouchableOpacity>
  );

  const renderResultsInfo = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsText}>
        Showing {filteredDrivers.length} of {drivers.length} drivers
      </Text>
      {searchQuery ? (
        <Text style={styles.searchResultsText}>
          Results for "{searchQuery}"
        </Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading F1 Drivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredDrivers}
        renderItem={renderDriverCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchAndFilters()}
            {renderFilters()}
            {renderResultsInfo()}
          </>
        }
        ListFooterComponent={<View style={styles.bottomSpacing} />}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}
