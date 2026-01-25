import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle, getCompactImageStyle } from '@/lib/utils';

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

const ADMIN_LOGO = require('@/assets/images/favicon.png');

interface RepostCardProps {
  repost: any;
  onThreadPress: (thread: any) => void;
  onLikePress: (threadId: string, isLiked: boolean, type?: 'thread' | 'repost') => void;
  onCommentPress: (thread: any) => void;
  onRepostPress: (thread: any) => void;
  onBookmarkPress: (threadId: string, isBookmarked: boolean) => void;
  onDeletePress?: (repostId: string) => void;
  onProfilePress: (userId: string) => void;
  onImagePress?: (imageUrl: string) => void;
  canDelete?: boolean;
  canAdminDelete?: boolean;
  isAdmin?: boolean;
}

export function RepostCard({
  repost,
  onThreadPress,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onBookmarkPress,
  onDeletePress,
  onProfilePress,
  onImagePress,
  canDelete,
  canAdminDelete,
  isAdmin,
}: RepostCardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const originalThread = repost.original_thread;

  if (!originalThread) {
    return null;
  }

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#fff' }}>
      {/* Repost Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 }}>
        <Repeat2 size={14} color="#536471" />
        <Text style={{ fontSize: 13, color: '#536471', marginLeft: 6 }}>
          {repost.profiles?.username || 'Someone'} reposted
        </Text>
      </View>

      {/* Reposter's Content */}
      <View style={{ padding: 16, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => onProfilePress(repost.user_id)}>
            <Image
              source={{
                uri: repost.profiles?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${repost.profiles?.username?.charAt(0) || 'U'}&background=random`
              }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#0f1419', fontSize: 15 }}>
                  {repost.profiles?.username || 'Unknown User'}
                </Text>
                {isAdmin ? (
                  <Image
                    source={ADMIN_LOGO}
                    style={{ width: 14, height: 14, marginLeft: 4 }}
                    resizeMode="contain"
                  />
                ) : repost.profiles?.favorite_team && TEAM_LOGOS[repost.profiles.favorite_team] && (
                  <Image
                    source={TEAM_LOGOS[repost.profiles.favorite_team]}
                    style={{ width: 14, height: 14, marginLeft: 4 }}
                    resizeMode="contain"
                  />
                )}
                <Text style={{ fontSize: 13, color: '#536471', marginLeft: 6 }}>
                  · {formatThreadTimestamp(repost.created_at)}
                </Text>
              </View>
              {(canDelete || canAdminDelete) && onDeletePress && (
                <TouchableOpacity onPress={() => onDeletePress(repost.id)}>
                  <MoreHorizontal size={18} color="#536471" />
                </TouchableOpacity>
              )}
            </View>

            {/* Reposter's comment */}
            {repost.content && (
              <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20, marginBottom: 12 }}>
                {repost.content}
              </Text>
            )}

            {/* Reposter's image */}
            {repost.image_url && (
              <TouchableOpacity onPress={() => onImagePress?.(repost.image_url)} style={{ marginBottom: 12 }}>
                <Image
                  source={{ uri: repost.image_url }}
                  style={getResponsiveImageStyle(screenWidth)}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            {/* Original Thread Preview */}
            <TouchableOpacity
              onPress={() => onThreadPress(originalThread)}
              style={{
                borderWidth: 1,
                borderColor: '#e5e5e5',
                borderRadius: 12,
                padding: 12,
                backgroundColor: '#f8f9fa',
                marginBottom: 12
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Image
                  source={{
                    uri: originalThread.profiles?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${originalThread.profiles?.username?.charAt(0) || 'U'}&background=random`
                  }}
                  style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: '600', color: '#1a1a1a', fontSize: 14 }}>
                      {originalThread.profiles?.username || 'Unknown User'}
                    </Text>
                    {originalThread.profiles?.favorite_team && TEAM_LOGOS[originalThread.profiles.favorite_team] && (
                      <Image
                        source={TEAM_LOGOS[originalThread.profiles.favorite_team]}
                        style={{ width: 12, height: 12, marginLeft: 4 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={{ color: '#536471', fontSize: 13, lineHeight: 18, marginBottom: 8 }} numberOfLines={3}>
                    {originalThread.content}
                  </Text>
                  {originalThread.image_url && (
                    <Image
                      source={{ uri: originalThread.image_url }}
                      style={getCompactImageStyle(screenWidth)}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Engagement Buttons */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => onLikePress(repost.id, repost.isLiked, 'repost')}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
              >
                <Heart
                  size={18}
                  color={repost.isLiked ? '#dc2626' : '#536471'}
                  fill={repost.isLiked ? '#dc2626' : 'none'}
                />
                {repost.likeCount > 0 && (
                  <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                    {repost.likeCount}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onCommentPress(repost)}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
              >
                <MessageCircle size={18} color="#536471" />
                {repost.replyCount > 0 && (
                  <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                    {repost.replyCount}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onRepostPress(originalThread)}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
              >
                <Repeat2 size={18} color="#536471" />
                {repost.repostCount > 0 && (
                  <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                    {repost.repostCount}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onBookmarkPress(repost.id, repost.isBookmarked)}>
                <Bookmark
                  size={18}
                  color={repost.isBookmarked ? '#dc2626' : '#536471'}
                  fill={repost.isBookmarked ? '#dc2626' : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
