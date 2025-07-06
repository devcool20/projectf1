import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

export default function ThreadScreen() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const post = {
    username: "sharmadivyanshu265",
    content: "hgj\njhkh",
    likes: 0,
    comments: 0,
  };

  const handleBack = () => {
    router.back();
  };

  const handlePost = () => {
    if (comment.trim()) {
      // Handle comment posting logic here
      setComment("");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="max-w-md mx-auto pb-24">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-border bg-card">
          <Pressable 
            onPress={handleBack}
            className="mr-3 p-1"
          >
            <Text className="text-foreground text-2xl">←</Text>
          </Pressable>
          <Text className="text-xl font-semibold text-foreground">Thread</Text>
        </View>

        {/* Original Post */}
        <View className="p-4 border-b border-border">
          <View className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <View className="mb-2">
              <Text className="font-medium text-foreground">{post.username}</Text>
            </View>
            
            <Text className="text-foreground mb-3">{post.content}</Text>
            
            <View className="flex-row items-center space-x-6">
              <View className="flex-row items-center space-x-1">
                <Text className="text-muted-foreground">🤍</Text>
                <Text className="text-sm text-muted-foreground">{post.likes}</Text>
              </View>
              
              <View className="flex-row items-center space-x-1">
                <Text className="text-muted-foreground">💬</Text>
                <Text className="text-sm text-muted-foreground">{post.comments}</Text>
              </View>
              
              <View className="flex-row items-center space-x-1">
                <Text className="text-muted-foreground">🔗</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Comments Section */}
        <View className="p-4">
          <Text className="text-lg font-medium text-foreground mb-4">Comments</Text>
          {/* Comments would be rendered here */}
        </View>

        {/* Comment Input */}
        <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <View className="max-w-md mx-auto">
            <View className="flex-row items-center space-x-2 mb-3">
              <Text className="text-2xl">📷</Text>
              <TextInput
                placeholder="Add a comment..."
                value={comment}
                onChangeText={setComment}
                className="flex-1 text-muted-foreground bg-transparent"
                multiline
              />
            </View>
            <Button 
              onPress={handlePost}
              className="w-full bg-f1-red text-white font-medium rounded-lg py-3"
            >
              Post
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
} 