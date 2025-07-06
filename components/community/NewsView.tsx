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
import { ArrowLeft } from 'lucide-react-native';

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

type NewsViewProps = {
  onClose: () => void;
};

export function NewsView({ onClose }: NewsViewProps) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          urlToImage: item.enclosure.link || item.thumbnail || `https://source.unsplash.com/random/800x400?formula1,race,${idx}`,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={28} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>F1 News</Text>
      </View>

      {/* News List */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
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