import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trash2 } from 'lucide-react-native';

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
  isLiked?: boolean;
  favoriteTeam?: string;
  userId?: string; // Add userId for profile modal
  userEmail?: string; // Add userEmail for admin check
  onCommentPress: () => void;
  onLikePress: () => void;
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
  isLiked,
  favoriteTeam,
  userId,
  userEmail,
  onCommentPress,
  onLikePress,
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
  const showDeleteButton = canDelete || canAdminDelete;
  
  return (
    <View className="w-full p-4">
      <View className="flex-row items-center mb-2">
        <TouchableOpacity 
          onPress={() => {
            console.log('Avatar clicked - userId:', userId, 'onProfilePress:', !!onProfilePress);
            if (userId && onProfilePress) {
              onProfilePress(userId);
            } else {
              console.log('Avatar click blocked - userId missing or onProfilePress not provided');
            }
          }}
          disabled={!userId || !onProfilePress}
        >
          <Image
            source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
            className="w-10 h-10 rounded-full bg-muted mr-3"
          />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text style={{ fontWeight: 'bold', color: '#000000', fontSize: USERNAME_FONT_SIZE }} selectable={false}>{username}</Text>
            {logoToShow && (
              <Image 
                source={logoToShow} 
                style={{ width: 30, height: 28, marginLeft: 4 }}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={{ fontSize: 14, color: '#505050' }} selectable={false}>{new Date(timestamp).toLocaleString()}</Text>
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
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={onLikePress} className="flex-row items-center space-x-1">
            <Heart size={20} color={isLiked ? '#dc2626' : '#505050'} fill={isLiked ? '#dc2626' : 'none'} />
            {likes > 0 && <Text className="text-sm text-muted-foreground" selectable={false}>{likes}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onCommentPress} className="flex-row items-center space-x-1">
            <MessageCircle size={20} color="#505050" />
            {comments > 0 && <Text className="text-sm text-muted-foreground" selectable={false}>{comments}</Text>}
          </TouchableOpacity>
        </View>
        {showDeleteButton && (
        <TouchableOpacity onPress={onDeletePress}>
          <Trash2 size={18} color="#505050" />
        </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
