import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ThreadPostProps {
  post: {
    username: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
  };
}

export default function ThreadPost({ post }: ThreadPostProps) {
  return (
    <View className="p-4 border-b border-border">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3">
          <Text className="text-lg font-bold text-muted-foreground">
            {post.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text className="font-bold text-foreground">{post.username}</Text>
          <Text className="text-sm text-muted-foreground">
            {new Date(post.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text className="text-foreground text-base my-3">{post.content}</Text>

      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="flex-row items-center space-x-1">
            <Text className="text-xl">🤍</Text>
            <Text className="text-sm text-muted-foreground">{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center space-x-1">
            <Text className="text-xl">💬</Text>
            <Text className="text-sm text-muted-foreground">{post.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text className="text-xl">🔗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 