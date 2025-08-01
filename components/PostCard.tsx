import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Repeat2 } from 'lucide-react-native';
import { formatThreadTimestamp, getResponsiveImageStyle, getCompactImageStyle, getVeryCompactImageStyle } from '@/lib/utils';
import { Modal, Pressable } from 'react-native';
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

// Admin logo
const ADMIN_LOGO = require('@/assets/images/favicon.png');

const USERNAME_FONT_SIZE = 18;
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

// Using imported utility functions from lib/utils.ts

export type PostCardProps = {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;

  reposts?: number; // Add repost count
  isLiked?: boolean;
  isBookmarked?: boolean;
  favoriteTeam?: string;
  userId?: string; // Add userId for profile modal
  userEmail?: string; // Add userEmail for admin check
  onCommentPress: () => void;
  onLikePress: () => void;
  onBookmarkPress: () => void;
  onDeletePress: () => void;
  onRepostPress?: () => void; // Add repost press handler
  onProfilePress?: (userId: string) => void; // Add profile press handler
  canDelete?: boolean; // New prop to control delete button visibility
  isAdmin?: boolean; // Add isAdmin prop
  canAdminDelete?: boolean; // Add admin delete capability
  onImagePress?: (imageUrl: string) => void;
};

export default function PostCard({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  likes,
  comments,

  reposts = 0,
  isLiked,
  isBookmarked,
  favoriteTeam,
  userId,
  userEmail,
  onCommentPress,
  onLikePress,
  onBookmarkPress,
  onDeletePress,
  onRepostPress,
  onProfilePress,
  canDelete = false,
  isAdmin = false,
  canAdminDelete = false,
  showReadMore = false, // NEW PROP: only true in community feed
  onImagePress,
}: PostCardProps & { showReadMore?: boolean }) {
  
  const { width: screenWidth } = Dimensions.get('window');
  
  // Determine which logo to show
  const getLogoToShow = () => {
    if (userEmail === 'sharmadivyanshu265@gmail.com') {
      return require('@/assets/images/favicon.png');
    }
    if (favoriteTeam && TEAM_LOGOS[favoriteTeam]) {
      return TEAM_LOGOS[favoriteTeam];
    }
    return null;
  };

  const logoToShow = getLogoToShow();
  const [menuVisible, setMenuVisible] = useState(false);
  const showDelete = canDelete || canAdminDelete;
  const menuAnchorRef = useRef<any>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [expanded, setExpanded] = useState(false);
  const contentLines = content.split('\n');
  const shouldTruncate = showReadMore && contentLines.length > 4 && !expanded;
  const displayedContent = shouldTruncate ? contentLines.slice(0, 4).join('\n') : content;
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => setImageDimensions({ width, height }),
        () => setImageDimensions(null)
      );
    } else {
      setImageDimensions(null);
    }
  }, [imageUrl]);

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
  
  return (
    <View style={{ width: '100%', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
        {/* Avatar Column */}
        <TouchableOpacity 
          onPress={() => {
            if (userId && onProfilePress) {
              onProfilePress(userId);
            }
          }}
          disabled={!userId || !onProfilePress}
        >
          <Image
            source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6' }}
          />
        </TouchableOpacity>
        {/* Content Column */}
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: '600', color: '#000', fontSize: 15, fontFamily: 'Formula1-Regular' }} selectable={false}>{username}</Text>
            {logoToShow && (
              <Image 
                source={logoToShow} 
                style={{ width: 30, height: 28, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
            {showDelete && (
              <View style={{ marginLeft: 'auto' }}>
                <TouchableOpacity
                  ref={menuAnchorRef}
                  onPress={openMenu}
                  style={{ padding: 4 }}
                >
                  <MoreHorizontal size={20} color="#888" />
                </TouchableOpacity>
              </View>
            )}
          </View>
                      <Text style={{ fontSize: 13, color: '#888', marginTop: -2, marginLeft: 2, fontFamily: 'Formula1-Regular' }} selectable={false}>{formatThreadTimestamp(timestamp)}</Text>
          <Text style={{ color: '#000000', marginVertical: 8, fontSize: 14, lineHeight: 18, fontFamily: 'Formula1-Regular' }} selectable={false}>{displayedContent}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 13, marginBottom: 4, fontFamily: 'Formula1-Regular' }}>Read more</Text>
            </TouchableOpacity>
          )}
          {imageUrl && (
            <TouchableOpacity onPress={() => onImagePress && imageUrl && onImagePress(imageUrl)}>
              <Image
                source={{ uri: imageUrl }}
                style={(() => {
                  if (!imageDimensions) {
                    return getResponsiveImageStyle(screenWidth);
                  }
                  const imgW = imageDimensions.width;
                  const imgH = imageDimensions.height;
                  const aspectRatio = imgW / imgH;
                  const maxWidth = screenWidth < 400 ? screenWidth - 120 : 280;
                  const maxHeight = 400;
                  let width = maxWidth;
                  let height = imgH * (maxWidth / imgW);
                  if (height > maxHeight) {
                    height = maxHeight;
                    width = imgW * (maxHeight / imgH);
                  }
                  return { borderRadius: 12, width, height, backgroundColor: '#f3f4f6', marginTop: 8 };
                })()}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {/* Engagement Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            {/* Like */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={Heart}
                active={isLiked || false}
                onPress={onLikePress}
                type="like"
                size={14}
                accessibilityLabel="Like post"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12, fontFamily: 'Formula1-Regular' }}>{likes}</Text>
            </View>
            {/* Comment */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={MessageCircle}
                active={false}
                onPress={onCommentPress}
                type="comment"
                size={14}
                accessibilityLabel="Comment"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12, fontFamily: 'Formula1-Regular' }}>{comments}</Text>
            </View>
            {/* Repost */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <EngagementButton
                icon={Repeat2}
                active={false}
                onPress={onRepostPress || (() => {})}
                type="repost"
                size={14}
                accessibilityLabel="Repost"
              />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12, fontFamily: 'Formula1-Regular' }}>{reposts}</Text>
            </View>
            {/* Bookmark */}
            <EngagementButton
              icon={Bookmark}
              active={isBookmarked || false}
              onPress={onBookmarkPress}
              type="bookmark"
              size={14}
              accessibilityLabel="Bookmark post"
            />
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
            {showDelete && (
              <TouchableOpacity onPress={() => { setMenuVisible(false); onDeletePress(); }} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                <Text style={{ color: '#dc2626', fontWeight: '600', fontFamily: 'Formula1-Regular' }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
