import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, LayoutChangeEvent } from 'react-native';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle, getCompactImageStyle, getVeryCompactImageStyle } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

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
  'FIA': require('@/team-logos/fia.png'), // Admin-only team
};

const ADMIN_LOGO = require('@/assets/images/favicon.png');
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

// Using imported utility functions from lib/utils.ts

export type TwitterStyleReplyCardProps = {
  reply: any;
  onProfilePress?: (userId: string) => void;
  onThreadPress?: (threadId: string) => void;
  onLikePress?: (replyId: string) => void;
  session?: any;
};

export default function TwitterStyleReplyCard({
  reply,
  onProfilePress,
  onThreadPress,
  onLikePress,
  session,
}: TwitterStyleReplyCardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const [replyLikeCount, setReplyLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const avatarSize = 40;
  const avatarMargin = 12;
  const parentAvatarRef = useRef<View>(null);
  const replyAvatarRef = useRef<View>(null);

  // State to store the TOP Y coordinate of the avatar wrappers
  const [parentAvatarTopY, setParentAvatarTopY] = useState<number | null>(null);
  const [replyAvatarTopY, setReplyAvatarTopY] = useState<number | null>(null);

  useEffect(() => {
    fetchReplyEngagement();
    // No longer logging layout Y values here, as it's not relevant for data fetching.
    // The line rendering itself will re-render when state changes.
  }, [reply.id, session]);

  // Measure the TOP Y position of the parent and reply avatars' containers
  const onParentAvatarLayout = (event: LayoutChangeEvent) => {
    setParentAvatarTopY(event.nativeEvent.layout.y);
  };
  const onReplyAvatarLayout = (event: LayoutChangeEvent) => {
    setReplyAvatarTopY(event.nativeEvent.layout.y);
  };

  const fetchReplyEngagement = async () => {
    try {
      // Fetch like count for this reply
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('reply_id', reply.id);

      if (likesError) throw likesError;
      
      setReplyLikeCount(likesData?.length || 0);

      // Check if current user has liked this reply
      if (session?.user) {
        const userLiked = likesData?.some(like => like.user_id === session.user.id);
        setIsLiked(userLiked || false);
      }
    } catch (error) {
      console.error('Error fetching reply engagement:', error);
    }
  };

  const handleLikePress = async () => {
    if (!session?.user) {
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('reply_id', reply.id)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setReplyLikeCount(prev => prev - 1);
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            reply_id: reply.id,
            user_id: session.user.id,
          });
        
        if (error) throw error;
        setIsLiked(true);
        setReplyLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Determine which logo to show for the reply author
  const getLogoToShow = (userProfile: any) => {
    if (userProfile?.email === ADMIN_EMAIL) {
      return ADMIN_LOGO;
    }
    if (userProfile?.favorite_team && TEAM_LOGOS[userProfile.favorite_team]) {
      return TEAM_LOGOS[userProfile.favorite_team];
    }
    return null;
  };

  // Determine which logo to show for the original thread author
  const getThreadLogoToShow = (threadProfile: any) => {
    if (threadProfile?.email === ADMIN_EMAIL) {
      return ADMIN_LOGO;
    }
    if (threadProfile?.favorite_team && TEAM_LOGOS[threadProfile.favorite_team]) {
      return TEAM_LOGOS[threadProfile.favorite_team];
    }
    return null;
  };

  const replyLogo = getLogoToShow(reply.profiles);
  const threadLogo = getThreadLogoToShow(reply.threads?.profiles);

  return (
    <View style={{ padding: 16, backgroundColor: '#ffffff', position: 'relative', minHeight: 120 }}>
      {/* Line connecting avatars */}
      {parentAvatarTopY !== null && replyAvatarTopY !== null && (
        <View
          style={{
            position: 'absolute',
            // Adjust left to center the line in the avatar column, considering card padding (16)
            left: 16 + avatarSize / 2 - (4 / 2), // 16px padding + half avatar width - half line width
            top: parentAvatarTopY + avatarSize, // Starts at the bottom of the parent avatar
            height: replyAvatarTopY - (parentAvatarTopY + avatarSize), // Height covers the gap
            width: 4, // Line thickness
            backgroundColor: '#e0e0e0', // Light gray color for the line
            zIndex: 100, // Ensure it draws on top
          }}
        />
      )}
      {/* Original thread block */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
        {/* Attach onLayout to the View wrapping the avatar for accurate Y position */}
        <View ref={parentAvatarRef} onLayout={onParentAvatarLayout}>
          <TouchableOpacity onPress={() => onProfilePress?.(reply.threads?.user_id)}>
            <Image
              source={{
                uri: reply.threads?.profiles?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${reply.threads?.profiles?.username?.charAt(0)}&background=random`
              }}
              style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, marginLeft: avatarMargin }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
              {reply.threads?.profiles?.username || 'Unknown User'}
            </Text>
            {threadLogo && (
              <Image 
                source={threadLogo} 
                style={{ width: 24, height: 22, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>
              {formatThreadTimestamp(reply.threads?.created_at)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onThreadPress?.(reply.threads?.id)}>
            <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
              {reply.threads?.content || 'Original thread content'}
            </Text>
            {reply.threads?.image_url && (
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <Image
                  source={{ uri: reply.threads.image_url }}
                  style={getResponsiveImageStyle(screenWidth)}
                  resizeMode="cover"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Reply block */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Attach onLayout to the View wrapping the avatar for accurate Y position */}
        <View ref={replyAvatarRef} onLayout={onReplyAvatarLayout}>
          <TouchableOpacity onPress={() => onProfilePress?.(reply.user_id)}>
            <Image
              source={{
                uri: reply.profiles?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${reply.profiles?.username?.charAt(0)}&background=random`
              }}
              style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, marginLeft: avatarMargin }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
              {reply.profiles?.username || 'Unknown User'}
            </Text>
            {replyLogo && (
              <Image 
                source={replyLogo} 
                style={{ width: 24, height: 22, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>
              {formatThreadTimestamp(reply.created_at)}
            </Text>
          </View>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
            Replying to @{reply.threads?.profiles?.username || 'unknown'}
          </Text>
          <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
            {reply.content}
          </Text>
          {reply.image_url && (
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={{ uri: reply.image_url }}
                style={getResponsiveImageStyle(screenWidth)}
                resizeMode="cover"
              />
            </View>
          )}
          {/* Engagement Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            {/* Likes */}
            <TouchableOpacity 
              onPress={handleLikePress} 
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
            >
              <Heart 
                size={14} 
                color={isLiked ? '#dc2626' : '#666666'} 
                fill={isLiked ? '#dc2626' : 'none'} 
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                {replyLikeCount}
              </Text>
            </TouchableOpacity>

            {/* Comments (Reply to Reply - could be implemented later) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <MessageCircle size={14} color="#666666" />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>0</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}