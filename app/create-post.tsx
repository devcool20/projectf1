import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CreatePost } from '@/components/community/CreatePost';

export default function CreatePostScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Create Post',
        }} 
      />
      <View style={styles.container}>
        <CreatePost
          onSuccess={() => {
            router.back();
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 