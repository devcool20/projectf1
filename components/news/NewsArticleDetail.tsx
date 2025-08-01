import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { X, Share2, Calendar, User, ExternalLink, ArrowLeft } from 'lucide-react-native';
import { newsService, NewsArticle } from '@/lib/newsService';

const { width: screenWidth } = Dimensions.get('window');

interface NewsArticleDetailProps {
  article: NewsArticle;
  onClose: () => void;
  onBack?: () => void;
}

export default function NewsArticleDetail({ article, onClose, onBack }: NewsArticleDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        message: `${article.title}\n\n${article.description}\n\nRead more: ${article.url}`,
        title: article.title,
        url: article.url,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleOpenExternal = async () => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clean content by removing truncation indicators and improving readability
  const cleanContent = (content: string) => {
    if (!content) return '';
    
    let cleaned = content;
    
    // Remove truncation patterns like "+754 chars" or similar
    cleaned = cleaned.replace(/\+\d+\s*chars?/gi, '');
    cleaned = cleaned.replace(/\[.*?\]/g, ''); // Remove square bracket content
    cleaned = cleaned.replace(/\.\.\.$/, ''); // Remove trailing ellipsis
    
    // Remove common unwanted patterns
    cleaned = cleaned.replace(/subscribe to our newsletter/gi, '');
    cleaned = cleaned.replace(/follow us on/gi, '');
    cleaned = cleaned.replace(/share this article/gi, '');
    cleaned = cleaned.replace(/related articles/gi, '');
    cleaned = cleaned.replace(/advertisement/gi, '');
    cleaned = cleaned.replace(/sponsored content/gi, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Get the content to display
  const getDisplayContent = () => {
    // Always prioritize content over description, even if it's truncated
    if (article?.content) {
      return cleanContent(article.content);
    }
    // Fallback to description only if no content is available
    return article?.description || '';
  };

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#181a20' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#dc2626', textAlign: 'center', marginBottom: 16, fontFamily: 'Formula1-Regular' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#dc2626',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontFamily: 'Formula1-Regular' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181a20' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#23272f',
        borderBottomWidth: 1,
        borderBottomColor: '#23272f',
      }}>
        <View style={{ 
          maxWidth: 800, 
          alignSelf: 'center', 
          width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={{
                padding: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', fontFamily: 'Formula1-Regular' }}>
            {article.source}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              padding: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Share2 size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenExternal}
            style={{
              padding: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <ExternalLink size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
            }}
          >
            <X size={18} color="#dc2626" />
          </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Article Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
        {/* Hero Image */}
        {article.image_url && (
          <View style={{ marginBottom: 20 }}>
            <Image
              source={{ uri: article.image_url }}
              style={{
                  width: '100%',
                height: 250,
                backgroundColor: '#23272f',
                  borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Article Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '600',
            color: '#fff',
            lineHeight: 32,
            marginBottom: 16,
            fontFamily: 'Formula1-Regular'
          }}>
            {article.title}
          </Text>

          {/* Meta Information */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Calendar size={14} color="#b0b3b8" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
                {formatDate(article.published_at)}
              </Text>
            </View>
            {article.author && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={14} color="#b0b3b8" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
                  {article.author}
                </Text>
              </View>
            )}
          </View>

          {/* Category Badge */}
          {article.category && (
            <View style={{
              backgroundColor: '#dc2626',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', fontFamily: 'Formula1-Regular' }}>
                {article.category}
              </Text>
            </View>
          )}
        </View>

        {/* Article Content */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{
              fontSize: 16,
              color: '#fff',
              lineHeight: 26,
              fontFamily: 'Formula1-Regular'
            }}>
              {getDisplayContent()}
            </Text>
          </View>

        {/* Source Attribution */}
        <View style={{
          marginTop: 32,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#23272f',
          borderTopWidth: 1,
          borderTopColor: '#23272f',
            borderRadius: 12,
            marginHorizontal: 20,
        }}>
          <Text style={{ fontSize: 14, color: '#b0b3b8', textAlign: 'center', fontFamily: 'Formula1-Regular' }}>
            Source: {article.source}
          </Text>
          <Text style={{ fontSize: 12, color: '#a0a0a0', textAlign: 'center', marginTop: 4, fontFamily: 'Formula1-Regular' }}>
            Published on {formatDate(article.published_at)}
          </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 