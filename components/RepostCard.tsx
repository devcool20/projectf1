import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Modal, Pressable } from 'react-native';
import { Heart, MessageCircle, Bookmark, Repeat2, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle, getCompactImageStyle, getVeryCompactImageStyle } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import EngagementButton from './engagement-button';

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

export type RepostCardProps = {
  repost: any;
  onProfilePress?: (userId: string) => void;
  onThreadPress?: (threadId: string) => void;
  onLikePress?: (repostId: string, isLiked: boolean) => void;
  onRepostPress?: (repostId: string) => void;
  onDeletePress?: (repostId: string, threadType: string) => void;
  session?: any;
};

export default function RepostCard({
  repost,
  onProfilePress,
  onThreadPress,
  onLikePress,
  onRepostPress,
  onDeletePress,
  session,
}: RepostCardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  
  // Use engagement metrics from the repost object passed from parent
  const likeCount = repost.likeCount || 0;
  const isLiked = repost.isLiked || false;
  const repostCount = repost.repostCount || 0;

  // Add state for dropdown menu
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnchorRef = useRef<any>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const openMenu = () => {
    if (menuAnchorRef.current && 'measure' in menuAnchorRef.current) {
      (menuAnchorRef.current as any).measure(
        (
          fx: number,
          fy: number,
          width: number,
          height: number,
          px: number,
          py: number
        ) => {
          setMenuPos({ top: py + height + 4, left: px - 60 });
          setMenuVisible(true);
        }
      );
    } else {
      setMenuVisible(true);
    }
  };

  const handleLikePress = (e: any) => {
    e.stopPropagation(); // Prevent triggering parent TouchableOpacity
    if (!session?.user) {
      return;
    }
    onLikePress?.(repost.id, isLiked);
  };

  const handleRepostPress = (e: any) => {
    e.stopPropagation(); // Prevent triggering parent TouchableOpacity
    onRepostPress?.(repost.id);
  };

  const handleProfilePress = (userId: string, e: any) => {
    e.stopPropagation(); // Prevent triggering parent TouchableOpacity
    onProfilePress?.(userId);
  };

  const handleOriginalThreadPress = (threadId: string, e: any) => {
    e.stopPropagation(); // Prevent triggering parent TouchableOpacity
    onThreadPress?.(threadId);
  };

  const isUserAdmin = (userProfile: any) => {
    return userProfile?.is_admin || userProfile?.email === ADMIN_EMAIL;
  };

  const getLogoToShow = (userProfile: any) => {
    if (userProfile?.email === ADMIN_EMAIL) {
      return ADMIN_LOGO;
    }
    if (userProfile?.favorite_team && TEAM_LOGOS[userProfile.favorite_team]) {
      return TEAM_LOGOS[userProfile.favorite_team];
    }
    return null;
  };

  const repostUserLogo = getLogoToShow(repost.profiles);
  const originalUserLogo = getLogoToShow(repost.original_thread?.profiles);

  return (
    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
      {/* Main repost content - looks like a regular post */}
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity 
          onPress={(e) => handleProfilePress(repost.user_id, e)}
          style={{ marginRight: 12 }}
        >
          <Image
            source={{ 
              uri: repost.profiles?.avatar_url || 
                   `https://ui-avatars.com/api/?name=${repost.profiles?.username?.charAt(0)}&background=random` 
            }}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          {/* Repost user info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600', color: '#3a3a3a', fontSize: 15, fontFamily: 'Formula1-Regular' }}>
              {repost.profiles?.username || 'Unknown User'}
            </Text>
            {repostUserLogo && (
              <Image 
                source={repostUserLogo} 
                style={{ width: 24, height: 22, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ fontSize: 11, color: '#6b7280', marginLeft: 8, fontFamily: 'Inter' }}>
              {formatThreadTimestamp(repost.created_at)}
            </Text>
            {/* More options button for repost owner or admin - moved to top right */}
            {session && (repost.user_id === session.user.id || repost.profiles?.is_admin) && onDeletePress && (
              <TouchableOpacity 
                ref={menuAnchorRef}
                onPress={openMenu}
                style={{ marginLeft: 'auto', padding: 4 }}
              >
                <MoreHorizontal size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Repost content */}
          {repost.content && (
            <Text style={{ color: '#3a3a3a', fontSize: 14, lineHeight: 20, marginBottom: 12, fontFamily: 'Inter' }}>
              {repost.content}
            </Text>
          )}

          {/* Original thread preview - embedded like Twitter */}
          <TouchableOpacity 
            onPress={(e) => handleOriginalThreadPress(repost.original_thread_id, e)}
            style={{
              borderWidth: 1,
              borderColor: '#e5e5e5',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#f9f9f9',
              marginTop: 16,
              marginBottom: 12
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={{ 
                  uri: repost.original_thread?.profiles?.avatar_url || 
                       `https://ui-avatars.com/api/?name=${repost.original_thread?.profiles?.username?.charAt(0)}&background=random` 
                }}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontWeight: '600', color: '#3a3a3a', fontSize: 15, fontFamily: 'Formula1-Regular' }}>
                    {repost.original_thread?.profiles?.username || 'Unknown User'}
                  </Text>
                  {originalUserLogo && (
                    <Image 
                      source={originalUserLogo} 
                      style={{ width: 16, height: 14, marginLeft: 2 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text style={{ color: '#3a3a3a', fontSize: 12, lineHeight: 16, fontFamily: 'Inter' }}>
                  {repost.original_thread?.content}
                </Text>
                {repost.original_thread?.image_url && (
                  <View style={{ alignItems: 'center', marginTop: 4 }}>
                    <Image
                      source={{ uri: repost.original_thread.image_url }}
                      style={getVeryCompactImageStyle(screenWidth)}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Engagement bar - fixed order: Like, Comment, Repost, Bookmark */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            {/* Like */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={Heart}
                active={isLiked}
                onPress={handleLikePress}
                type="like"
                size={14}
                accessibilityLabel="Like repost"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                {likeCount}
              </Text>
            </View>

            {/* Comment */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={MessageCircle}
                active={false}
                onPress={() => onThreadPress?.(repost.id)}
                type="comment"
                size={14}
                accessibilityLabel="Comment"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{repost.replyCount || 0}</Text>
            </View>

            {/* Repost */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={Repeat2}
                active={false}
                onPress={handleRepostPress}
                type="repost"
                size={14}
                accessibilityLabel="Repost"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{repostCount}</Text>
            </View>

            {/* Bookmark (if reposts should be bookmarkable, otherwise remove this block) */}
            {/* <EngagementButton
              icon={Bookmark}
              active={false} // TODO: Add isBookmarked prop to RepostCardProps
              onPress={() => {}} // TODO: Add bookmark handler
              type="bookmark"
              size={14}
              accessibilityLabel="Bookmark repost"
            /> */}
          </View>
        </View>
      </View>

      {/* Three-dot menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
          <View style={{ position: 'absolute', top: menuPos.top, left: menuPos.left, backgroundColor: '#fff', borderRadius: 8, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, padding: 8, minWidth: 120 }}>
            <TouchableOpacity 
              onPress={() => { 
                setMenuVisible(false); 
                onDeletePress?.(repost.id, 'repost'); 
              }} 
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
} 