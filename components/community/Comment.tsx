import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CommentProps {
  comment: {
    username: string;
    content: string;
  };
  onReply: (username: string) => void;
}

export default function Comment({ comment, onReply }: CommentProps) {
  return (
    <TouchableOpacity
      onPress={() => onReply(comment.username)}
      className="flex-row items-start mb-4 p-2 rounded-lg"
    >
      <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mr-3">
        <Text className="text-sm font-bold text-muted-foreground">
          {comment.username.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold text-foreground">{comment.username}</Text>
        <Text className="text-foreground">{comment.content}</Text>
      </View>
    </TouchableOpacity>
  );
} 