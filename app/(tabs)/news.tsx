import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { AnimatedRadioCards } from '@/components/AnimatedRadioCards';

const RSS_TO_JSON_URL = 'https://feedtojson.vercel.app/https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest%2Fall.xml';

// Function to truncate text to specified number of lines
const truncateToLines = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      if (data && data.items) {
        const transformedNews = data.items.map((item: any) => ({
          ...item,
          title: item.title || 'No title',
          description: item.description?.replace(/<[^>]*>/g, '')?.trim() || 'No description available',
          link: item.link || '#',
          pubDate: item.published || item.publishedParsed || new Date().toISOString(),
          source: { name: 'Formula 1' },
        }));
        setNews(transformedNews);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, [fetchNews]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-background to-secondary/20 h-screen w-screen overflow-hidden">
        {/* Animated Radio Cards */}
        <AnimatedRadioCards />

        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="max-w-md mx-auto">
            <View className="p-4 border-b border-border bg-card">
              <Text className="text-xl font-semibold text-foreground">F1 News</Text>
              <Text className="text-sm text-muted-foreground">
                Latest Formula 1 news and updates • {news.length} articles
              </Text>
            </View>
            
            {loading ? (
              <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" />
              </View>
            ) : (
              news.map((item, index) => (
                <TouchableOpacity
                  key={`${item.link}-${index}`}
                  className="p-4 border-b border-border bg-card"
                  onPress={() => {
                    if (item.link) {
                      Linking.openURL(item.link).catch(err => {
                        console.error('Failed to open link:', err);
                      });
                    }
                  }}
                >
                  <Text className="font-bold text-foreground text-base mb-2 leading-tight" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-muted-foreground text-sm leading-relaxed mb-2" numberOfLines={3}>
                    {truncateToLines(item.description, 120)}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 