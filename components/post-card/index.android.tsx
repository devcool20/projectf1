import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trash2, BarChart3 } from 'lucide-react-native';
import { PostCardProps } from './types.android';
import styles from './styles.android';

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

const PostCard: FC<PostCardProps> = ({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  likes,
  comments,
  views,
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
          <Text style={styles.timestamp}>{new Date(timestamp).toLocaleString()}</Text>
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
          <TouchableOpacity onPress={onLikePress} style={styles.actionButton}>
            <Heart size={20} color={isLiked ? '#dc2626' : '#505050'} fill={isLiked ? '#dc2626' : 'none'} />
            {likes > 0 && <Text style={styles.actionText}>{likes}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
            <MessageCircle size={20} color="#505050" />
            {comments > 0 && <Text style={styles.actionText}>{comments}</Text>}
          </TouchableOpacity>
          <View style={styles.actionButton}>
            <BarChart3 size={20} color="#505050" />
            {views > 0 && <Text style={styles.actionText}>{views}</Text>}
          </View>
        </View>
        {showDeleteButton && (
          <TouchableOpacity onPress={onDeletePress}>
            <Trash2 size={18} color="#505050" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PostCard; 