import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Users, Clapperboard, ShoppingBag, Trophy, User } from 'lucide-react-native';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Community', icon: Users, path: '/community' },
  { label: 'Screenings', icon: Clapperboard, path: '/screenings' },
  { label: 'Shop', icon: ShoppingBag, path: '/shop' },
  { label: 'Drivers', icon: Trophy, path: '/drivers' },
];

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        const transformedNews = data.items.map((item: any, idx: number) => ({
          title: item.title,
          description: item.description?.replace(/<[^>]*>/g, '') || 'No description available',
          urlToImage: item.enclosure?.link || item.thumbnail || `https://source.unsplash.com/random/800x400?formula1,race,${idx}`,
          publishedAt: item.pubDate,
          source: { name: 'Formula 1' },
          url: item.link,
          id: item.guid
        }));
        setNews(transformedNews);
      }
    } catch (e) {
      console.error('Error fetching news:', e);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Left Sidebar Nav */}
      <View style={styles.sidebar}>
        <View>
          <View  style={{ marginBottom: 24, marginLeft: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'hsl(var(--f1-red))' }}>F1</Text>
          </View>
          <View style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.path as any)}
                style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9999 }}
              >
                <item.icon size={24} color="hsl(var(--foreground))" strokeWidth={1.5} />
                <Text style={{ fontSize: 18, fontWeight: '500', color: 'hsl(var(--foreground))', marginLeft: 16 }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {}}
            style={{ width: '91.666667%', backgroundColor: 'hsl(var(--f1-red))', marginTop: 20, paddingVertical: 10, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999 }}
        >
          <View style={{ width: 36, height: 36, backgroundColor: 'hsl(var(--muted))', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="hsl(var(--foreground))" />
          </View>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'hsl(var(--foreground))' }}>Guest</Text>
            <Text style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>@guest</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* News List */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="hsl(var(--f1-red))" size="large" />
            </View>
          ) : (
            news.map((article) => (
              <TouchableOpacity key={article.id} onPress={() => Linking.openURL(article.url)} style={styles.card}>
                {article.urlToImage && (
                  <Image source={{ uri: article.urlToImage }} style={styles.image} resizeMode="cover" />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{article.title}</Text>
                  <Text style={styles.meta}>
                    {article.source?.name} • {new Date(article.publishedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.description}>{article.description}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'hsl(var(--background))',
  },
  sidebar: {
    width: 240,
    minHeight: '100vh',
    backgroundColor: 'hsl(var(--background))',
    paddingHorizontal: 8,
    paddingVertical: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'hsl(var(--border))',
    marginLeft: 96,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  card: {
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
  },
  image: {
    width: '100%',
    height: 200,
  },
  textContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: 'hsl(var(--muted-foreground))',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'hsl(var(--foreground))',
    lineHeight: 20,
  },
}); 