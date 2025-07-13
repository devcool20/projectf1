import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trash2 } from 'lucide-react-native';
import { PostCardProps } from './types.android';
import { styles } from './styles.android';

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

const PostCard: FC<PostCardProps> = ({
  username,
  avatarUrl,
  content,
  imageUrl,
  timestamp,
  likes,
  comments,
  isLiked,
  favoriteTeam,
  onCommentPress,
  onLikePress,
  onDeletePress,
  canDelete = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
          style={styles.avatar}
        />
        <View style={styles.headerTextContainer}>
          <View style={styles.usernameRow}>
            <Text style={styles.username} selectable={false}>{username}</Text>
            {favoriteTeam && TEAM_LOGOS[favoriteTeam] && (
              <Image 
                source={TEAM_LOGOS[favoriteTeam]} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.timestamp} selectable={false}>{new Date(timestamp).toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.content} selectable={false}>{content}</Text>
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={styles.postImage}
          />
        </View>
      )}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={onLikePress} style={styles.actionButton}>
            <Heart size={20} color={isLiked ? '#dc2626' : '#505050'} fill={isLiked ? '#dc2626' : 'none'} />
            {likes > 0 && <Text style={styles.actionText} selectable={false}>{likes}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
            <MessageCircle size={20} color="#505050" />
            {comments > 0 && <Text style={styles.actionText} selectable={false}>{comments}</Text>}
          </TouchableOpacity>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={onDeletePress}>
            <Trash2 size={18} color="#505050" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PostCard; 