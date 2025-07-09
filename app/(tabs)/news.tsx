import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { RadioCard } from '@/components/RadioCard';
import { getRandomRadioCards, type RadioCardData } from '@/lib/radioCardData';

const RSS_TO_JSON_URL = 'https://feedtojson.vercel.app/https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest%2Fall.xml';

// Function to safely format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'Date unavailable';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date unavailable';
    }
    
    // Format date in a readable way
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Date unavailable';
  }
};

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radioCards, setRadioCards] = useState<RadioCardData[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await getRandomRadioCards(2);
      setRadioCards(cards);
    };
    
    loadCards();
  }, []);

  const [leftCardData, rightCardData] = radioCards;

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      if (data && data.items) {
        // Clean descriptions and map RSS feed format
        const cleanedNews = data.items.map((item: any) => ({
          ...item,
          title: item.title || 'No title',
          description: item.description?.replace(/<[^>]*>/g, '')?.trim() || 'No description available',
          link: item.link || '#',
          pubDate: item.published || item.publishedParsed || new Date().toISOString(),
        }));
        setNews(cleanedNews);
      } else {
        throw new Error('Failed to fetch news or no items found.');
      }
    } catch (e: any) {
      setError(e.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openLink = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View className="flex-1 bg-background">
      
      {/* Left Fixed Radio Card */}
      {leftCardData && (
        <View className="absolute top-1/2 left-12 w-56 -translate-y-1/2 z-10">
          <RadioCard
            teamColor={leftCardData.teamColor}
            teamIcon={leftCardData.teamIcon}
            title={leftCardData.driverName}
            driverResponse={leftCardData.driverResponse}
            teamResponse={leftCardData.teamResponse}
            responseOrder={leftCardData.responseOrder}
          />
        </View>
      )}
      
      {/* Right Fixed Radio Card */}
      {rightCardData && (
        <View className="absolute top-1/2 right-12 w-56 -translate-y-1/2 z-10">
          <RadioCard
            teamColor={rightCardData.teamColor}
            teamIcon={rightCardData.teamIcon}
            title={rightCardData.driverName}
            driverResponse={rightCardData.driverResponse}
            teamResponse={rightCardData.teamResponse}
            responseOrder={rightCardData.responseOrder}
          />
        </View>
      )}

      <View className="p-4 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">F1 News</Text>
        <Text className="text-muted-foreground text-sm mt-1">
          Latest Formula 1 news and updates • {news.length} articles
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <View className="p-4 items-center">
            <Text className="text-red-500 text-center mb-4">{error}</Text>
            <Button onPress={fetchNews}>Retry</Button>
          </View>
        ) : (
          <ScrollView
            className="w-full max-w-xl"
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={true}
          >
            {news.map((article, idx) => (
              <TouchableOpacity
                key={`${article.link}-${idx}`}
                className="mb-4 bg-card rounded-lg p-4 border border-border hover:shadow-md transition-all duration-200"
                onPress={() => openLink(article.link)}
              >
                <View className="flex-1">
                  <Text className="font-bold text-base mb-2 text-foreground leading-tight">
                    {article.title}
                  </Text>
                  <Text className="text-muted-foreground text-xs mb-3">
                    {formatDate(article.pubDate)}
                  </Text>
                  <Text className="text-foreground text-sm leading-relaxed" numberOfLines={3}>
                    {article.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {news.length === 0 && !loading && (
              <View className="items-center py-8">
                <Text className="text-muted-foreground text-center">
                  No news articles available at the moment.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
} 