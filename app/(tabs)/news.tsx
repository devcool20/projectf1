import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Dimensions,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Search, Filter, X, Calendar, User, ExternalLink } from 'lucide-react-native';
import { globalNewsService } from '@/lib/globalNewsService';
import { NewsArticle } from '@/lib/newsService';
import NewsArticleDetail from '@/components/news/NewsArticleDetail';

const { width: screenWidth } = Dimensions.get('window');

// Function to truncate text to specified number of lines
const truncateToLines = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

export default function NewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showArticleDetail, setShowArticleDetail] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const sources = ['all', 'Formula 1 Official', 'ESPN F1', 'Autosport', 'Motorsport.com'];

  const fetchNews = useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true);
      
      // Get articles from global service (should already be loaded)
      const newsData = globalNewsService.getArticles();
      
      if (newsData.length > 0) {
        // Use cached data if available
        setArticles(newsData);
        setFilteredArticles(newsData);
      } else {
        // Fallback: initialize if not already done
        await globalNewsService.initialize();
        const freshData = globalNewsService.getArticles();
        setArticles(freshData);
        setFilteredArticles(freshData);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load more articles when user scrolls to bottom
  const loadMoreArticles = useCallback(async () => {
    if (loadingMore || !globalNewsService.hasMoreArticles()) {
      return;
    }

    try {
      setLoadingMore(true);
      const newArticles = await globalNewsService.loadMoreArticles();
      if (newArticles.length > 0) {
        setArticles(prev => [...prev, ...newArticles]);
        // Update filtered articles as well
        const updatedFiltered = globalNewsService.searchArticles(searchQuery);
        if (selectedSource !== 'all') {
          const sourceFiltered = updatedFiltered.filter(article => article.source === selectedSource);
          setFilteredArticles(sourceFiltered);
        } else {
          setFilteredArticles(updatedFiltered);
        }
      }
    } catch (error) {
      console.error('Failed to load more articles:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, searchQuery, selectedSource]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Filter articles based on search query and source
  useEffect(() => {
    let filtered = globalNewsService.searchArticles(searchQuery);

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(article => article.source === selectedSource);
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedSource]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const freshArticles = await globalNewsService.refresh();
      setArticles(freshArticles);
      setFilteredArticles(freshArticles);
    } catch (error) {
      // Silent error handling
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleArticlePress = (article: NewsArticle) => {
    setSelectedArticle(article);
    setShowArticleDetail(true);
  };

  const handleReadFullArticle = async (article: NewsArticle) => {
    if (!article?.url) return;
    
    try {
      const supported = await Linking.canOpenURL(article.url);
      
      if (supported) {
        await Linking.openURL(article.url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'This link cannot be opened in your browser.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open the article in your browser.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCloseArticle = () => {
    setShowArticleDetail(false);
    setSelectedArticle(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    setShowFilters(false);
  };

  // Handle scroll to load more articles
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= 
        contentSize.height - paddingToBottom) {
      loadMoreArticles();
    }
  };

  const renderArticleCard = (article: NewsArticle) => (
    <TouchableOpacity
      key={article.id}
      style={{
        backgroundColor: '#23272f',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
      }}
      onPress={() => handleArticlePress(article)}
      activeOpacity={0.8}
    >
      {/* Hero Image */}
      {article.image_url && (
        <View style={{ height: 200, backgroundColor: '#181a20' }}>
          <Image
            source={{ uri: article.image_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={{ padding: 16 }}>
        {/* Article Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            backgroundColor: '#dc2626',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginRight: 8,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '600', fontFamily: 'Formula1-Regular' }}>
              {article.source}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
            {formatDate(article.published_at)}
          </Text>
        </View>

        {/* Article Title */}
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#fff',
          marginBottom: 8,
          lineHeight: 24,
          fontFamily: 'Formula1-Regular'
        }} numberOfLines={2}>
          {article.title}
        </Text>

        {/* Article Content/Description */}
        <Text style={{
          fontSize: 14,
          color: '#b0b3b8',
          lineHeight: 20,
          marginBottom: 12,
          fontFamily: 'Formula1-Regular'
        }} numberOfLines={4}>
          {article.content ? 
            truncateToLines(article.content, 200) : 
            truncateToLines(article.description, 150)
          }
        </Text>

        {/* Article Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {article.author && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <User size={12} color="#999" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: '#999', fontFamily: 'Formula1-Regular' }}>
                  {article.author}
                </Text>
              </View>
            )}
            {article.category && (
              <Text style={{
                fontSize: 11,
                color: '#dc2626',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontFamily: 'Formula1-Regular'
              }}>
                {article.category}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => handleReadFullArticle(article)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, color: '#999', marginRight: 8, fontFamily: 'Formula1-Regular' }}>
              Read full article
            </Text>
            <ExternalLink size={14} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => {
    if (!globalNewsService.hasMoreArticles()) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
            No more articles to load
          </Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
            Loading more articles...
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={loadMoreArticles}
        style={{
          margin: 16,
          padding: 16,
          backgroundColor: '#dc2626',
          borderRadius: 12,
          alignItems: 'center',
        }}
        activeOpacity={0.8}
      >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', fontFamily: 'Formula1-Regular' }}>
            Load More Articles
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 4, opacity: 0.8, fontFamily: 'Formula1-Regular' }}>
            Load 5 more articles
          </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181a20' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#23272f',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#23272f',
      }}>
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 12,
        }}>
          F1 News
        </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={{
        backgroundColor: '#23272f',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#23272f',
      }}>
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#181a20',
            borderRadius: 12,
            paddingHorizontal: 12,
            marginRight: 12,
          }}>
            <Search size={16} color="#b0b3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#fff',
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#08090a',
                borderRadius: 8,
                backgroundColor: 'transparent',
              }}
              placeholder="Search articles..."
              placeholderTextColor="#a0a0a0"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#b0b3b8" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              padding: 12,
              backgroundColor: selectedSource !== 'all' ? '#dc2626' : '#181a20',
              borderRadius: 12,
            }}
          >
            <Filter size={16} color={selectedSource !== 'all' ? '#fff' : '#b0b3b8'} />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={{
            marginTop: 12,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {sources.map((source) => (
              <TouchableOpacity
                key={source}
                onPress={() => handleSourceFilter(source)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: selectedSource === source ? '#dc2626' : '#181a20',
                  borderWidth: 1,
                  borderColor: selectedSource === source ? '#dc2626' : '#23272f',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedSource === source ? '#fff' : '#b0b3b8',
                }}>
                  {source === 'all' ? 'All Sources' : source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        </View>
      </View>

      {/* Articles List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#b0b3b8', textAlign: 'center' }}>
              Loading latest news...
            </Text>
            <Text style={{ fontSize: 14, color: '#a0a0a0', marginTop: 8, textAlign: 'center' }}>
              Loading first 5 articles to get you started
            </Text>
          </View>
        ) : filteredArticles.length > 0 ? (
          <>
            <View style={{ marginBottom: 8, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 14, color: '#b0b3b8' }}>
                {`${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} loaded`}
              </Text>
            </View>
            {filteredArticles.map(renderArticleCard)}
            {renderLoadMoreButton()}
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 18, color: '#b0b3b8', textAlign: 'center', marginBottom: 8 }}>
              {searchQuery ? 'No articles found' : 'No news available'}
            </Text>
            <Text style={{ fontSize: 14, color: '#a0a0a0', textAlign: 'center', marginBottom: 16 }}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for updates'}
            </Text>
            <TouchableOpacity
              onPress={() => fetchNews(false)}
              style={{
                backgroundColor: '#dc2626',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                Retry Loading News
              </Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={showArticleDetail}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedArticle && (
          <NewsArticleDetail
            article={selectedArticle}
            onClose={handleCloseArticle}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
} 