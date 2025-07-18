import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Bookmark, BarChart3, MoreHorizontal } from 'lucide-react-native';
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
};

// Admin logo
const ADMIN_LOGO = require('@/assets/images/favicon.png');

const USERNAME_FONT_SIZE = 18;
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

export type PostCardProps = {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  favoriteTeam?: string;
  userId?: string; // Add userId for profile modal
  userEmail?: string; // Add userEmail for admin check
  onCommentPress: () => void;
  onLikePress: () => void;
  onBookmarkPress: () => void;
  onDeletePress: () => void;
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
  isLiked,
  isBookmarked,
  favoriteTeam,
  userId,
  userEmail,
  onCommentPress,
  onLikePress,
  onBookmarkPress,
  onDeletePress,
  onProfilePress,
  canDelete = false,
  isAdmin = false,
  canAdminDelete = false,
}: PostCardProps) {
  
  // Determine which logo to show
  const getLogoToShow = () => {
    if (isAdmin) {
      return ADMIN_LOGO;
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
    <View className="w-full p-4">
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
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
            className="w-10 h-10 rounded-full bg-muted mr-3"
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
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
        </View>
      </View>
      <Text style={{ color: '#000000', marginVertical: 8 }} selectable={false}>{content}</Text>
      {imageUrl && (
        <View className="mt-3" style={{ alignSelf: 'flex-start' }}>
        <Image
          source={{ uri: imageUrl }}
            className="h-80"
            resizeMode="cover"
            style={{ 
              borderRadius: 12,
              width: 300,
              maxWidth: '100%'
            }}
        />
        </View>
      )}
      {/* Engagement Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        {/* Action Icons - Equal Spacing */}
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Likes */}
          <TouchableOpacity onPress={onLikePress} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Heart size={20} color={isLiked ? '#dc2626' : '#666666'} fill={isLiked ? '#dc2626' : 'none'} />
            <Text style={{ marginLeft: 4, color: '#666666' }}>{likes}</Text>
          </TouchableOpacity>
          {/* Comments */}
          <TouchableOpacity onPress={onCommentPress} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <MessageCircle size={20} color="#666666" />
            <Text style={{ marginLeft: 4, color: '#666666' }}>{comments}</Text>
          </TouchableOpacity>
          {/* Views */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <BarChart3 size={20} color="#666666" />
            <Text style={{ marginLeft: 4, color: '#666666' }}>{views}</Text>
          </View>
          {/* Bookmarks */}
          <TouchableOpacity onPress={onBookmarkPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={20} color={isBookmarked ? '#dc2626' : '#666666'} fill={isBookmarked ? '#dc2626' : 'none'} />
          </TouchableOpacity>
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
