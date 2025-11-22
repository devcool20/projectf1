import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useEngagementStore } from './engagementStore';

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
  const { replyLikes, setReplyLike } = useEngagementStore();
  const isLiked = replyLikes[reply.id] || false;
  const avatarSize = 40;

  useEffect(() => {
    fetchReplyEngagement();
  }, [reply.id, session]);

  const fetchReplyEngagement = async () => {
    try {
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('reply_id', reply.id);

      if (likesError) throw likesError;
      
      setReplyLikeCount(likesData?.length || 0);

      if (session?.user) {
        const userLiked = likesData?.some(like => like.user_id === session.user.id);
        setReplyLike(reply.id, userLiked || false);
      }
    } catch (error) {
      console.error('Error fetching reply engagement:', error);
    }
  };

  const handleLikePress = async () => {
    if (!session?.user) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('reply_id', reply.id)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        setReplyLike(reply.id, false);
        setReplyLikeCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            reply_id: reply.id,
            user_id: session.user.id,
          });
        
        if (error) throw error;
        setReplyLike(reply.id, true);
        setReplyLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getLogoToShow = (userProfile: any) => {
    if (userProfile?.email === ADMIN_EMAIL) return ADMIN_LOGO;
    if (userProfile?.favorite_team && TEAM_LOGOS[userProfile.favorite_team]) {
      return TEAM_LOGOS[userProfile.favorite_team];
    }
    return null;
  };

  const replyLogo = getLogoToShow(reply.profiles);
  const threadLogo = getLogoToShow(reply.threads?.profiles);

  return (
    <TouchableOpacity 
      onPress={() => onThreadPress?.(reply.threads?.id)}
      activeOpacity={0.7}
      style={{ backgroundColor: '#ffffff', padding: 16 }}
    >
      {/* Parent Thread Section */}
      <View style={{ flexDirection: 'row' }}>
        {/* Left Column: Avatar + Line */}
        <View style={{ width: 40, alignItems: 'center' }}>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            onProfilePress?.(reply.threads?.user_id);
          }} style={{ zIndex: 2 }}>
            <Image
              source={{
                uri: reply.threads?.profiles?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${reply.threads?.profiles?.username?.charAt(0)}&background=random`
              }}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
          
          {/* Vertical Line connecting to next section */}
          <View style={{ 
            width: 2, 
            flex: 1, 
            backgroundColor: '#cfd9de',
            marginVertical: 4
          }} />
        </View>

        {/* Right Column: Content */}
        <View style={{ flex: 1, paddingLeft: 12, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, height: 20 }}>
            <Text style={{ fontWeight: '700', color: '#0f1419', fontSize: 15, marginRight: 4, fontFamily: 'Formula1-Regular' }} numberOfLines={1}>
              {reply.threads?.profiles?.username || 'Unknown User'}
            </Text>
            {threadLogo && (
              <Image 
                source={threadLogo} 
                style={{ width: 16, height: 16, marginRight: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 14, color: '#536471', fontFamily: 'Inter' }}>
              · {formatThreadTimestamp(reply.threads?.created_at)}
            </Text>
          </View>
          
          <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20, fontFamily: 'Inter' }} numberOfLines={3}>
            {reply.threads?.content || 'Original thread content'}
          </Text>
        </View>
      </View>

      {/* Reply Section */}
      <View style={{ flexDirection: 'row' }}>
        {/* Left Column: Avatar only */}
        <View style={{ width: 40, alignItems: 'center' }}>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            onProfilePress?.(reply.user_id);
          }} style={{ zIndex: 2 }}>
            <Image
              source={{
                uri: reply.profiles?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${reply.profiles?.username?.charAt(0)}&background=random`
              }}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
            />
          </TouchableOpacity>
        </View>

        {/* Right Column: Content */}
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, height: 20 }}>
            <Text style={{ fontWeight: '700', color: '#0f1419', fontSize: 15, marginRight: 4, fontFamily: 'Formula1-Regular' }} numberOfLines={1}>
              {reply.profiles?.username || 'Unknown User'}
            </Text>
            {replyLogo && (
              <Image 
                source={replyLogo} 
                style={{ width: 16, height: 16, marginRight: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 14, color: '#536471', fontFamily: 'Inter' }}>
              · {formatThreadTimestamp(reply.created_at)}
            </Text>
          </View>
          
          <Text style={{ color: '#536471', fontSize: 13, marginBottom: 4, fontFamily: 'Inter' }}>
            Replying to <Text style={{ color: '#1d9bf0' }}>@{reply.threads?.profiles?.username || 'unknown'}</Text>
          </Text>
          
          <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20, marginBottom: 8, fontFamily: 'Inter' }}>
            {reply.content}
          </Text>

          {reply.image_url && (
            <View style={{ marginTop: 8, marginBottom: 8 }}>
              <Image
                source={{ uri: reply.image_url }}
                style={[getResponsiveImageStyle(screenWidth), { borderRadius: 12 }]}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Engagement Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleLikePress();
              }} 
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
            >
              <Heart 
                size={18} 
                color={isLiked ? '#f91880' : '#536471'} 
                fill={isLiked ? '#f91880' : 'none'} 
              />
              {replyLikeCount > 0 && (
                <Text style={{ marginLeft: 4, color: isLiked ? '#f91880' : '#536471', fontSize: 13, fontFamily: 'Inter' }}>
                  {replyLikeCount}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MessageCircle size={18} color="#536471" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
