import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

export interface PostProps {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  profiles: {
    username: string;
    avatar_url: string;
  };
  isLiked: boolean;
  isCard?: boolean; // Keep this optional
}

export default function PostCard({
  username,
  content,
  timestamp,
  likes,
  comments,
  isLiked,
}: Omit<PostProps, 'id' | 'user_id' | 'profiles'> & { username: string, timestamp: string }) {
  
  return (
    <View className="w-full p-4">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3">
          <Text className="text-lg font-bold text-muted-foreground">{username.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text className="font-bold text-foreground">{username}</Text>
          <Text className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</Text>
        </View>
      </View>
      <Text className="text-foreground my-2">{content}</Text>
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="flex-row items-center space-x-1">
            <Heart size={20} color={isLiked ? 'red' : 'hsl(var(--muted-foreground))'} />
            <Text className="text-sm text-muted-foreground">{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center space-x-1">
            <MessageCircle size={20} color="hsl(var(--muted-foreground))" />
            <Text className="text-sm text-muted-foreground">{comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Share2 size={20} color="hsl(var(--muted-foreground))" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
