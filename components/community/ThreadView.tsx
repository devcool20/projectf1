import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Camera, Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import PostCard, { PostProps } from '../PostCard';

type ThreadViewProps = {
  post: PostProps;
  onClose: () => void;
};

export function ThreadView({ post, onClose }: ThreadViewProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = uri.split('/').pop();
      const fileExt = fileName?.split('.').pop();

      const filePath = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('comment-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comment-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmitComment = async () => {
    if (!session) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim() && !image) {
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: post.id,
          user_id: session.user.id,
          image_url: imageUrl,
        });

      if (error) throw error;

      setNewComment('');
      setImage(null);
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };

  const handleLike = async () => {
    if (!session) {
      alert('Please sign in to like posts');
      return;
    }

    try {
      // First check if the user has already liked the post
      const { data: existingLikes, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', session.user.id);

      if (checkError) throw checkError;

      if (existingLikes && existingLikes.length > 0) {
        // User has already liked the post, so unlike it
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);

        if (deleteError) throw deleteError;
      } else {
        // User hasn't liked the post, so like it
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: session.user.id,
          });

        if (insertError) throw insertError;
      }

      // Refresh the post data to update likes count
      fetchComments();
    } catch (error) {
      console.error('Error handling like:', error);
      alert('Failed to update like status');
    }
  };

  const handleUnlike = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      fetchComments(); // Refresh to update likes count
    } catch (error) {
      console.error('Error unliking post:', error);
      alert('Failed to unlike post');
    }
  };

  const handleReplyTo = (username: string) => {
    setNewComment(`@${username.toLowerCase()} `);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={28} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PostCard {...post} />
        {/* Add comments section here later */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'hsl(var(--card))',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
  },
  scrollContent: {
    padding: 16,
  },
}); 