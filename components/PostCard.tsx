import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Trash2 } from 'lucide-react-native';

export type PostCardProps = {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  onCommentPress: () => void;
  onLikePress: () => void;
  onDeletePress: () => void;
  canDelete?: boolean; // New prop to control delete button visibility
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
  onCommentPress,
  onLikePress,
  onDeletePress,
  canDelete = false,
}: PostCardProps) {
  
  return (
    <View className="w-full p-4">
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=random` }}
          className="w-10 h-10 rounded-full bg-muted mr-3"
        />
        <View>
          <Text className="font-bold text-foreground">{username}</Text>
          <Text className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</Text>
        </View>
      </View>
      <Text className="text-foreground my-2">{content}</Text>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-48 rounded-xl mt-2"
          resizeMode="contain"
          style={{ backgroundColor: '#f3f4f6' }}
        />
      )}
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={onLikePress} className="flex-row items-center space-x-1">
            <Heart size={20} color={isLiked ? 'red' : 'hsl(var(--muted-foreground))'} />
            <Text className="text-sm text-muted-foreground">{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCommentPress} className="flex-row items-center space-x-1">
            <MessageCircle size={20} color="hsl(var(--muted-foreground))" />
            <Text className="text-sm text-muted-foreground">{comments}</Text>
          </TouchableOpacity>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={onDeletePress}>
            <Trash2 size={18} color="hsl(var(--muted-foreground))" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
