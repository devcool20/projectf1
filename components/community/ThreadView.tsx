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
import { Camera, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

type ThreadViewProps = {
  post: any;
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Original Post */}
        <View style={styles.postContainer}>
          <Text style={styles.username}>{post.profiles?.username}</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.content}>{post.content}</Text>
          {post.image_url && (
            <Image
              source={{ uri: post.image_url }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={post.user_liked ? handleUnlike : handleLike}
            >
              <Heart 
                size={20} 
                color={post.user_liked ? '#E10600' : '#666666'} 
                fill={post.user_liked ? '#E10600' : 'none'}
              />
              <Text style={[
                styles.actionText,
                post.user_liked && styles.actionTextActive
              ]}>
                {post.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color="#666666" />
              <Text style={styles.actionText}>{comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>
          {loading ? (
            <ActivityIndicator color="#E10600" />
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Text style={styles.commentUsername}>
                  {comment.profiles?.username}
                </Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                {comment.image_url && (
                  <Image
                    source={{ uri: comment.image_url }}
                    style={styles.commentImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.commentTime}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImage}
        >
          <Camera size={24} color="#666666" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        {image && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setImage(null)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitComment}
        >
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  username: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333333',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666666',
  },
  actionTextActive: {
    color: '#E10600',
  },
  commentsContainer: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  comment: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333333',
    marginBottom: 8,
  },
  commentImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#999999',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontFamily: 'Inter',
  },
  imageButton: {
    padding: 8,
  },
  imagePreview: {
    position: 'relative',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
  },
  submitButton: {
    backgroundColor: '#E10600',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 