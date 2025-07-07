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

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        setNews(data.items);
      } else {
        throw new Error(data.message || 'Failed to fetch news.');
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
      <View className="p-4 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">F1 News</Text>
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
                key={idx}
                className="mb-4 bg-card rounded-lg p-4 border border-border"
                onPress={() => openLink(article.link)}
              >
                <View className="flex-1">
                  <Text className="font-bold text-base mb-1 text-foreground">
                    {article.title}
                  </Text>
                  <Text className="text-muted-foreground text-xs mb-2">
                    {new Date(article.pubDate).toLocaleDateString()}
                  </Text>
                  <Text className="text-foreground text-sm" numberOfLines={3}>
                    {article.description.replace(/<[^>]*>/g, '').trim()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
} 