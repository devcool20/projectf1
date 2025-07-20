import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
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

  useEffect(() => {
    fetchReplyEngagement();
  }, [reply.id, session]);

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
    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
      {/* Twitter-style layout with vertical connecting line */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Left column with avatars and connecting line */}
        <View style={{ alignItems: 'center', marginRight: 12, width: 40 }}>
          {/* Original thread avatar */}
          <TouchableOpacity 
            onPress={() => onProfilePress?.(reply.threads?.user_id)}
            style={{ marginBottom: 8 }}
          >
            <Image
              source={{ 
                uri: reply.threads?.profiles?.avatar_url || 
                     `https://ui-avatars.com/api/?name=${reply.threads?.profiles?.username?.charAt(0)}&background=random` 
              }}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
          
          {/* Vertical connecting line - extends from original post to reply */}
          <View style={{
            width: 2,
            height: 80, // Fixed height to connect original post to reply
            backgroundColor: '#e5e5e5',
            marginVertical: 4
          }} />
          
          {/* Reply avatar - positioned to align with username */}
          <TouchableOpacity 
            onPress={() => onProfilePress?.(reply.user_id)}
          >
            <Image
              source={{ 
                uri: reply.profiles?.avatar_url || 
                     `https://ui-avatars.com/api/?name=${reply.profiles?.username?.charAt(0)}&background=random` 
              }}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
        </View>

        {/* Right column with content */}
        <View style={{ flex: 1 }}>
          {/* Original thread content */}
          <View style={{ marginBottom: 12 }}>
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

          {/* Reply content - starts immediately after original thread */}
          <View>
            {/* Reply Header */}
            <View style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            </View>

            {/* Reply Content */}
            <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
              {reply.content}
            </Text>

            {/* Reply Image (if any) */}
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
    </View>
  );
} 