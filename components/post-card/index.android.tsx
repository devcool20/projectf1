import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trash2, Bookmark, Repeat2, MoreHorizontal } from 'lucide-react-native';
import { PostCardProps } from './types.android';
import styles from './styles.android';
import EngagementButton from '../engagement-button';
import { formatThreadTimestamp } from '@/lib/utils';

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

const PostCard: FC<PostCardProps> = ({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  likes,
  comments,

  isLiked,
  isBookmarked,
  favoriteTeam,
  userId,
  userEmail,
  onCommentPress,
  onLikePress,
  onBookmarkPress,
  onRepostPress,
  onDeletePress,
  onProfilePress,
  canDelete = false,
  isAdmin = false,
  canAdminDelete = false,
}) => {
  
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Avatar clicked (Android) - userId:', userId, 'onProfilePress:', !!onProfilePress);
            if (userId && onProfilePress) {
              onProfilePress(userId);
            } else {
              console.log('Avatar click blocked (Android) - userId missing or onProfilePress not provided');
            }
          }}
          disabled={!userId || !onProfilePress}
        >
          <Image
            source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.username}>{username}</Text>
            {logoToShow && (
              <Image 
                source={logoToShow} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.timestamp}>{formatThreadTimestamp(timestamp)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{content}</Text>
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}
      <View style={styles.actions}>
        <View style={styles.actionButtons}>
          <View style={styles.actionButton}>
            <EngagementButton
              icon={Heart}
              active={isLiked || false}
              onPress={onLikePress}
              type="like"
              size={20}
              accessibilityLabel="Like post"
            />
            {likes > 0 && <Text style={styles.actionText}>{likes}</Text>}
          </View>
          <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
            <MessageCircle size={20} color="#6b7280" />
            {comments > 0 && <Text style={styles.actionText}>{comments}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onRepostPress} style={styles.actionButton}>
            <Repeat2 size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookmarkPress} style={styles.actionButton}>
            <Bookmark size={20} color={isBookmarked ? '#f59e0b' : '#6b7280'} fill={isBookmarked ? '#f59e0b' : 'transparent'} />
          </TouchableOpacity>

        </View>
        {showDeleteButton && (
          <TouchableOpacity onPress={onDeletePress}>
            <MoreHorizontal size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PostCard; 