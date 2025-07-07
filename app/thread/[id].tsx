import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import ThreadPost from '@/components/community/ThreadPost';
import Comment from '@/components/community/Comment';

export default function ThreadScreen() {
  const router = useRouter();
  const [reply, setReply] = useState('');

  const post = {
    username: 'sharmadivyanshu265',
    timestamp: '2025-06-20T14:34:05.957606+00:00',
    content: 'thread',
    likes: 0,
    comments: 6,
  };

  const comments = [
    { username: 'sharmadivyanshu265', content: 'hghjg' },
    { username: 'sharmadivyanshu265', content: 'hi' },
    { username: 'sharmadivyanshu265', content: '@sharmadivyanshu265 jhggh' },
    { username: 'sharmadivyanshu265', content: 'hgjgjh' },
    { username: 'sharmadivyanshu265', content: 'gjghj' },
    { username: 'sharmadivyanshu265', content: 'another comment' },
    { username: 'sharmadivyanshu265', content: 'yet another comment' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleReply = (username: string) => {
    setReply(`@${username} `);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border bg-card">
        <Pressable onPress={handleBack} className="mr-3 p-1">
          <Text className="text-foreground text-2xl">←</Text>
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Thread</Text>
      </View>

      <ScrollView className="flex-1">
        <ThreadPost post={post} />

        {/* Reply Section */}
        <View className="p-4 border-b border-border">
          <Text className="text-sm text-muted-foreground mb-2">Post your reply</Text>
          <View className="flex-row items-center">
            <TextInput
              placeholder="Reply..."
              value={reply}
              onChangeText={setReply}
              className="flex-1 bg-transparent border-b border-border text-foreground py-2"
            />
            <Button variant="ghost">Reply</Button>
          </View>
        </View>

        {/* Comments List */}
        <View className="p-4">
          {comments.map((comment, index) => (
            <Comment key={index} comment={comment} onReply={handleReply} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 