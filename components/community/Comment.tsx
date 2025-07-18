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
      style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, padding: 8, borderRadius: 8, backgroundColor: '#fff' }}
    >
      {/* Avatar Column */}
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#888' }}>
          {comment.username.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      {/* Content Column */}
      <View style={{ flex: 1, paddingLeft: 8 }}>
        <Text style={{ fontWeight: 'bold', color: '#000' }}>{comment.username}</Text>
        <Text style={{ color: '#000' }}>{comment.content}</Text>
      </View>
    </TouchableOpacity>
  );
} 