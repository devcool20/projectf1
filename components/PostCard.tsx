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
    <View style={{ width: '100%', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eff3f4', backgroundColor: '#ffffff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar Column */}
        <TouchableOpacity 
          onPress={() => {
            if (userId && onProfilePress) {
              onProfilePress(userId);
            }
          }}
          disabled={!userId || !onProfilePress}
          style={{ marginRight: 10 }}
        >
          <Image
            source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
          />
        </TouchableOpacity>

        {/* Content Column */}
        <View style={{ flex: 1 }}>
          {/* Header: Name, Team, Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text 
                style={{ 
                  fontWeight: '600', 
                  color: 'rgba(15, 20, 25, 0.85)', 
                  fontSize: 15, 
                  fontFamily: 'Chirp',
                  marginRight: 4 
                }} 
                numberOfLines={1}
                ellipsizeMode="tail"
                selectable={false}
              >
                {username}
              </Text>
              
              {logoToShow && (
                <Image 
                  source={logoToShow} 
                  style={{ width: 14, height: 14, marginHorizontal: 4 }}
                  resizeMode="contain"
                />
              )}

              <Text style={{ fontSize: 13, color: 'rgba(83, 100, 113, 0.85)', fontFamily: 'Chirp', fontWeight: '400' }}>· {formatThreadTimestamp(timestamp)}</Text>
            </View>

            {showDelete && (
              <TouchableOpacity
                ref={menuAnchorRef}
                onPress={openMenu}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreHorizontal size={16} color="#536471" />
              </TouchableOpacity>
            )}
          </View>

          {/* Post Content */}
          <Text 
            style={{ 
              color: 'rgba(15, 20, 25, 0.85)', 
              marginBottom: 12, 
              fontSize: 15, 
              lineHeight: 20, 
              fontFamily: 'Chirp',
              fontWeight: '400'
            }} 
            selectable={false}
          >
            {displayedContent}
          </Text>
          
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={{ color: '#1d9bf0', fontSize: 15, marginBottom: 12, fontFamily: 'Chirp', fontWeight: '400' }}>Show more</Text>
            </TouchableOpacity>
          )}

          {/* Post Image */}
          {imageUrl && (
            <TouchableOpacity 
              onPress={() => onImagePress && imageUrl && onImagePress(imageUrl)}
              style={{ marginBottom: 8 }}
            >
              <Image
                source={{ uri: imageUrl }}
                style={(() => {
                  if (!imageDimensions) {
                    return getResponsiveImageStyle(screenWidth);
                  }
                  const imgW = imageDimensions.width;
                  const imgH = imageDimensions.height;
                  
                  // Calculate aspect ratio but cap max height
                  const aspectRatio = imgW / imgH;
                  
                  return { 
                    borderRadius: 12, 
                    width: '100%', 
                    aspectRatio: aspectRatio,
                    maxHeight: 400,
                    backgroundColor: '#f3f4f6',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.05)'
                  };
                })()}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Engagement Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: '100%', marginTop: 4, paddingTop: 4, paddingRight: 40 }}>
            {/* Comment */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <EngagementButton
                icon={MessageCircle}
                active={false}
                onPress={onCommentPress}
                type="comment"
                size={14}
                accessibilityLabel="Comment"
              />
              <Text style={{ color: 'rgba(83, 100, 113, 0.85)', fontSize: 13, fontFamily: 'Chirp', fontWeight: '400', minWidth: 16 }}>{comments > 0 ? comments : ''}</Text>
            </View>

            {/* Repost */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <EngagementButton
                icon={Repeat2}
                active={false}
                onPress={onRepostPress || (() => {})}
                type="repost"
                size={14}
                accessibilityLabel="Repost"
              />
              <Text style={{ color: 'rgba(83, 100, 113, 0.85)', fontSize: 13, fontFamily: 'Chirp', fontWeight: '400', minWidth: 16 }}>{reposts > 0 ? reposts : ''}</Text>
            </View>

            {/* Like */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <EngagementButton
                icon={Heart}
                active={isLiked || false}
                onPress={onLikePress}
                type="like"
                size={14}
                accessibilityLabel="Like post"
              />
              <Text style={{ color: isLiked ? '#f91880' : 'rgba(83, 100, 113, 0.85)', fontSize: 13, fontFamily: 'Chirp', fontWeight: '400', minWidth: 16 }}>{likes > 0 ? likes : ''}</Text>
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
            
            {/* Share (Placeholder for visual balance if needed, currently just spacing) */}
            {/* <Share size={16} color="#536471" /> */}
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
                <Text style={{ color: '#dc2626', fontWeight: '600', fontFamily: 'Chirp', fontSize: 14 }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
