import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThreadView } from '@/components/community/ThreadView';
import { supabase } from '@/lib/supabase';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get post with basic info
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;

      // Get likes
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*');

      if (likesError) throw likesError;

      // Count likes for the post
      const likesCount = likesData?.reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get user's like status if authenticated
      let userLiked = false;
      if (user) {
        userLiked = likesData?.some(
          like => like.post_id === id && like.user_id === user.id
        ) || false;
      }

      // Combine the data
      const postWithLikes = {
        ...postData,
        likes: likesCount[postData.id] || 0,
        user_liked: userLiked,
      };

      setPost(postWithLikes);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !post) {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Thread',
        }} 
      />
      <View style={styles.container}>
        <ThreadView
          post={post}
          onClose={() => {}}
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