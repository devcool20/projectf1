import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const NAV_ITEMS = [
  { label: 'Community', icon: '💬', path: '/community' },
  { label: 'Screenings', icon: '🎬', path: '/screenings' },
  { label: 'Shop', icon: '🛍️', path: '/shop' },
  { label: 'Drivers', icon: '🏆', path: '/drivers' },
  { label: 'Home', icon: '🏠', path: '/' },
];

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        const transformedNews = data.items.map((item: any) => ({
          title: item.title,
          description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) + '...' || 'No description available',
          urlToImage: item.enclosure?.link || item.thumbnail || 'https://via.placeholder.com/400x200?text=F1+News',
          publishedAt: item.pubDate,
          source: { name: 'Formula 1' },
          url: item.link
        }));
        setNews(transformedNews);
      } else {
        setNews([]);
      }
    } catch (e) {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <View className="flex-row w-full min-h-screen bg-background">
      {/* Left Sidebar Nav */}
      <View className="w-56 min-h-screen bg-background px-2 py-8 flex items-end">
        <View className="w-full flex flex-col items-end gap-2">
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.path as any)}
              className="flex-row items-center mb-2 px-6 py-3 rounded-full transition-all duration-200 active:bg-f1-red/20 hover:bg-f1-red/10"
              style={{ minWidth: 180 }}
            >
              <Text className="text-2xl mr-4 text-foreground">{item.icon}</Text>
              <Text className="text-lg font-semibold text-foreground">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Center News Container */}
      <View className="flex-1 flex items-center">
        <View className="w-full max-w-xl min-h-screen flex flex-col items-center">
          <View className="w-full bg-card rounded-2xl shadow-kodama-lg flex flex-col mt-2 mb-4 h-[95vh]">
            <Text className="text-2xl font-heading font-bold mb-4 text-f1-red px-4 pt-4">F1 News</Text>
            <View className="flex-1 overflow-hidden">
              {newsLoading ? (
                <View className="flex-1 justify-center items-center py-8">
                  <ActivityIndicator color="hsl(var(--f1-red))" />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {news.map((article, idx) => (
                    <View key={idx} className="mb-6 bg-background/50 rounded-lg p-4 border border-border flex-row gap-4">
                      <Image
                        source={{ uri: article.urlToImage }}
                        className="w-32 h-20 rounded-lg bg-muted"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text className="font-heading font-semibold text-lg mb-1 text-foreground" numberOfLines={2}>
                          {article.title}
                        </Text>
                        <Text className="text-muted-foreground text-xs mb-2">
                          {article.source?.name} • {new Date(article.publishedAt).toLocaleDateString()}
                        </Text>
                        <Text className="text-foreground text-sm mb-2" numberOfLines={3}>
                          {article.description}
                        </Text>
                        <TouchableOpacity onPress={() => router.push(article.url)} className="mt-2 bg-f1-red px-4 py-2 rounded-full self-start shadow-kodama-md">
                          <Text className="text-white font-semibold text-xs">Read More</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Right area intentionally left empty for now */}
      <View className="w-80 min-h-screen flex flex-col bg-background px-4 pt-6"></View>
    </View>
  );
} 