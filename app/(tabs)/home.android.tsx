import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRight,
  Trophy,
  Calendar,
  MessageCircle,
  Users,
  ShoppingBag,
  Flag,
  Zap,
  Clock,
  Star,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button.android';
import { supabase } from '@/lib/supabase';
import styles from './home.styles.android';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  category: string;
}

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  route: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Mock data for quick access buttons
  const quickAccessItems: QuickAccessItem[] = [
    {
      id: '1',
      title: 'Community',
      description: 'Join discussions',
      icon: MessageCircle,
      color: '#dc2626',
      route: '/community',
    },
    {
      id: '2',
      title: 'Race Calendar',
      description: 'Upcoming races',
      icon: Calendar,
      color: '#000000',
      route: '/races',
    },
    {
      id: '3',
      title: 'Drivers',
      description: 'Driver standings',
      icon: Users,
      color: '#dc2626',
      route: '/drivers',
    },
    {
      id: '4',
      title: 'Shop',
      description: 'F1 merchandise',
      icon: ShoppingBag,
      color: '#000000',
      route: '/shop',
    },
  ];

  // Mock news data (in real app, this would come from API)
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Max Verstappen Wins Qatar Grand Prix',
      summary: 'Red Bull driver secures another victory in commanding fashion at Losail International Circuit.',
      image_url: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=F1+News',
      created_at: new Date().toISOString(),
      category: 'Race Results',
    },
    {
      id: '2',
      title: 'Ferrari Announces 2024 Car Development',
      summary: 'Scuderia Ferrari reveals major updates coming to their 2024 Formula 1 car.',
      image_url: 'https://via.placeholder.com/300x200/000000/ffffff?text=Ferrari',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      category: 'Team News',
    },
    {
      id: '3',
      title: 'Mercedes Shows Improvement in Practice',
      summary: 'Lewis Hamilton and George Russell show promising pace in latest practice sessions.',
      image_url: 'https://via.placeholder.com/300x200/008f00/ffffff?text=Mercedes',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      category: 'Practice',
    },
  ];

  useEffect(() => {
    initializeScreen();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Load news (mock data for now)
      await loadNews();
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to load home screen data');
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    try {
      // In a real app, this would fetch from your news API or database
      // For now, we'll use mock data
      setNews(mockNews);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleQuickAccessPress = (item: QuickAccessItem) => {
    // In a real app, this would navigate to the specific route
    console.log('Navigate to:', item.route);
    Alert.alert('Navigation', `Would navigate to ${item.title}`);
  };

  const handleNewsPress = (newsItem: NewsItem) => {
    console.log('Open news item:', newsItem.id);
    Alert.alert('News', `Would open: ${newsItem.title}`);
  };

  const renderWelcomeBanner = () => (
    <LinearGradient
      colors={['#dc2626', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.welcomeBanner}
    >
      <View style={styles.bannerContent}>
        <View style={styles.bannerHeader}>
          <Flag size={32} color="#ffffff" />
          <Text style={styles.bannerTitle}>Project F1</Text>
        </View>
        <Text style={styles.bannerSubtitle}>
          Your Ultimate Formula 1 Community
        </Text>
        <Text style={styles.bannerDescription}>
          Connect with fellow F1 enthusiasts, get latest race updates, and join the excitement!
        </Text>
        <View style={styles.bannerStats}>
          <View style={styles.statItem}>
            <Trophy size={20} color="#ffffff" />
            <Text style={styles.statText}>2024 Season</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color="#ffffff" />
            <Text style={styles.statText}>Active Community</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickAccess = () => (
    <View style={styles.quickAccessContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Zap size={20} color="#dc2626" />
      </View>
      <View style={styles.quickAccessGrid}>
        {quickAccessItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.quickAccessItem}
            onPress={() => handleQuickAccessPress(item)}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: item.color }]}>
              <item.icon size={24} color="#ffffff" />
            </View>
            <Text style={styles.quickAccessTitle}>{item.title}</Text>
            <Text style={styles.quickAccessDescription}>{item.description}</Text>
            <ChevronRight size={16} color="#999999" style={styles.quickAccessArrow} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNewsSection = () => (
    <View style={styles.newsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <View style={styles.newsHeaderRight}>
          <Clock size={16} color="#dc2626" />
          <Text style={styles.newsUpdateText}>Live Updates</Text>
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.newsScrollContainer}
      >
        {news.map((newsItem) => (
          <TouchableOpacity
            key={newsItem.id}
            style={styles.newsCard}
            onPress={() => handleNewsPress(newsItem)}
          >
            <Image 
              source={{ uri: newsItem.image_url }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.newsContent}>
              <Text style={styles.newsCategory}>{newsItem.category}</Text>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {newsItem.title}
              </Text>
              <Text style={styles.newsSummary} numberOfLines={3}>
                {newsItem.summary}
              </Text>
              <View style={styles.newsFooter}>
                <Star size={14} color="#dc2626" />
                <Text style={styles.newsTime}>
                  {new Date(newsItem.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWelcomeMessage = () => {
    if (!session) {
      return (
        <View style={styles.welcomeMessage}>
          <Text style={styles.welcomeText}>
            Welcome! Sign in to join the F1 community and get personalized updates.
          </Text>
          <Button 
            variant="cta" 
            style={styles.signInButton}
            onPress={() => Alert.alert('Sign In', 'Would open authentication modal')}
          >
            Sign In / Sign Up
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.welcomeMessage}>
        <Text style={styles.welcomeText}>
          Welcome back! Ready for the next race?
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading F1 Community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeBanner()}
        {renderWelcomeMessage()}
        {renderQuickAccess()}
        {renderNewsSection()}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
