import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MessageCircle, Bookmark, BarChart3, MoreHorizontal, Repeat2 } from 'lucide-react-native';
import { formatThreadTimestamp } from '@/lib/utils';
import { Modal, Pressable } from 'react-native';

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

// Helper function to calculate responsive image dimensions
const getResponsiveImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // More aggressive margin for very narrow screens
    const responsiveWidth = screenWidth - 120; // 60px margin each side
    const responsiveHeight = (responsiveWidth * 200) / 280;
    return {
      width: responsiveWidth,
      height: responsiveHeight,
      borderRadius: 12,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 280,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  };
};

export type PostCardProps = {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number;
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
};

export default function PostCard({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  likes,
  comments,
  views,
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
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: USERNAME_FONT_SIZE }} selectable={false}>{username}</Text>
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
          <Text style={{ fontSize: 13, color: '#888', marginTop: -2, marginLeft: 2 }} selectable={false}>{formatThreadTimestamp(timestamp)}</Text>
          <Text style={{ color: '#000000', marginVertical: 8 }} selectable={false}>{displayedContent}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>Read more</Text>
            </TouchableOpacity>
          )}
          {imageUrl && (
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
          )}
          {/* Engagement Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            {/* Likes */}
            <TouchableOpacity onPress={onLikePress} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Heart size={14} color={isLiked ? '#dc2626' : '#666666'} fill={isLiked ? '#dc2626' : 'none'} />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 13 }}>{likes}</Text>
            </TouchableOpacity>
            {/* Comments */}
            <TouchableOpacity onPress={onCommentPress} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <MessageCircle size={14} color="#666666" />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 13 }}>{comments}</Text>
            </TouchableOpacity>
            {/* Reposts */}
            <TouchableOpacity onPress={onRepostPress} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Repeat2 size={14} color="#666666" />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 13 }}>{reposts}</Text>
            </TouchableOpacity>
            {/* Views */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <BarChart3 size={14} color="#666666" />
              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 13 }}>{views}</Text>
            </View>
            {/* Bookmarks */}
            <TouchableOpacity onPress={onBookmarkPress} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Bookmark size={14} color={isBookmarked ? '#dc2626' : '#666666'} fill={isBookmarked ? '#dc2626' : 'none'} />
            </TouchableOpacity>
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
                <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
