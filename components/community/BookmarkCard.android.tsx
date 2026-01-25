import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MessageCircle, Repeat2, Bookmark, Trash2 } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle } from '@/lib/utils';

const TEAM_LOGOS: { [key: string]: any } = {
  'Red Bull Racing': require('@/team-logos/redbull.png'),
  'Scuderia Ferrari': require('@/team-logos/ferrari.png'),
  'Mercedes-AMG': require('@/team-logos/mercedes.png'),
  'McLaren': require('@/team-logos/mclaren.png'),
  'Aston Martin': require('@/team-logos/astonmartin.png'),
  'Alpine': require('@/team-logos/alpine.png'),
  'Williams': require('@/team-logos/williams.png'),
  'Haas': require('@/team-logos/haas.png'),
  'Stake F1': require('@/team-logos/stake.png'),
  'RB': require('@/team-logos/racingbulls.png'),
  'FIA': require('@/team-logos/fia.png'),
};

interface BookmarkCardProps {
  thread: any;
  onThreadPress: (thread: any) => void;
  onLikePress: (threadId: string, isLiked: boolean, type?: 'thread' | 'repost') => void;
  onCommentPress: (thread: any) => void;
  onRepostPress: (thread: any) => void;
  onBookmarkPress: (threadId: string, isBookmarked: boolean) => void;
  onProfilePress: (userId: string) => void;
  onImagePress?: (imageUrl: string) => void;
}

export function BookmarkCard({
  thread,
  onThreadPress,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onBookmarkPress,
  onProfilePress,
  onImagePress,
}: BookmarkCardProps) {
  const { width: screenWidth } = Dimensions.get('window');

  const renderThread = (threadData: any) => (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => onProfilePress(threadData.user_id)}>
          <Image
            source={{
              uri: threadData.profiles?.avatar_url ||
                `https://ui-avatars.com/api/?name=${threadData.profiles?.username?.charAt(0) || 'U'}&background=random`
            }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6' }}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontWeight: '700', color: '#0f1419', fontSize: 15 }}>
              {threadData.profiles?.username || 'Unknown User'}
            </Text>
            {threadData.profiles?.favorite_team && TEAM_LOGOS[threadData.profiles.favorite_team] && (
              <Image
                source={TEAM_LOGOS[threadData.profiles.favorite_team]}
                style={{ width: 14, height: 14, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 13, color: '#536471', marginLeft: 6 }}>
              · {formatThreadTimestamp(threadData.created_at)}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onThreadPress(threadData)}>
            <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20, marginBottom: 8 }}>
              {threadData.content}
            </Text>
          </TouchableOpacity>

          {threadData.image_url && (
            <TouchableOpacity onPress={() => onImagePress?.(threadData.image_url)}>
              <Image
                source={{ uri: threadData.image_url }}
                style={getResponsiveImageStyle(screenWidth)}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Engagement Buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => onLikePress(threadData.id, threadData.isLiked, threadData.type || 'thread')}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
            >
              <Heart
                size={18}
                color={threadData.isLiked ? '#dc2626' : '#536471'}
                fill={threadData.isLiked ? '#dc2626' : 'none'}
              />
              {threadData.likeCount > 0 && (
                <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                  {threadData.likeCount}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onCommentPress(threadData)}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
            >
              <MessageCircle size={18} color="#536471" />
              {threadData.replyCount > 0 && (
                <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                  {threadData.replyCount}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onRepostPress(threadData)}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
            >
              <Repeat2 size={18} color="#536471" />
              {threadData.repostCount > 0 && (
                <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                  {threadData.repostCount}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onBookmarkPress(threadData.id, threadData.isBookmarked)}>
              <Bookmark
                size={18}
                color={threadData.isBookmarked ? '#dc2626' : '#536471'}
                fill={threadData.isBookmarked ? '#dc2626' : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Handle repost display
  if (thread.type === 'repost' && thread.original_thread) {
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#fff' }}>
        {/* Repost indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 }}>
          <Repeat2 size={14} color="#536471" />
          <Text style={{ fontSize: 13, color: '#536471', marginLeft: 6 }}>
            {thread.profiles?.username} reposted
          </Text>
        </View>

        {/* Repost content if any */}
        {thread.content && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20 }}>
              {thread.content}
            </Text>
          </View>
        )}

        {/* Original thread */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e5e5',
          borderRadius: 12,
          backgroundColor: '#f8f9fa',
          overflow: 'hidden'
        }}>
          {renderThread(thread.original_thread)}
        </View>
      </View>
    );
  }

  // Regular thread
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#fff' }}>
      {renderThread(thread)}
    </View>
  );
}
