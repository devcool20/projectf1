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
  Dimensions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Camera, Heart, MessageCircle, Share2, MoreHorizontal, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth } = Dimensions.get('window');

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
      const { data: existingLikes, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', session.user.id);

      if (checkError) throw checkError;

      if (existingLikes && existingLikes.length > 0) {
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: session.user.id,
          });

        if (insertError) throw insertError;
      }

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
      fetchComments();
    } catch (error) {
      console.error('Error unliking post:', error);
      alert('Failed to unlike post');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
      >
        {/* Original Post */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={16} color="#6366F1" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{post.profiles?.username}</Text>
                <Text style={styles.timestamp}>
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.postContent}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.content}>{post.content}</Text>
            {post.image_url && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
          
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={[styles.actionButton, post.user_liked && styles.actionButtonActive]}
              onPress={post.user_liked ? handleUnlike : handleLike}
            >
              <Heart 
                size={18} 
                color={post.user_liked ? '#EF4444' : '#64748B'} 
                fill={post.user_liked ? '#EF4444' : 'none'}
              />
              <Text style={[
                styles.actionText,
                post.user_liked && styles.actionTextActive
              ]}>
                {post.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={18} color="#64748B" />
              <Text style={styles.actionText}>{comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={18} color="#64748B" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>
              Replies ({comments.length})
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color="#E2E8F0" />
              <Text style={styles.emptyText}>No replies yet</Text>
              <Text style={styles.emptySubtext}>Be the first to reply to this thread</Text>
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {comments.map((comment, index) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <User size={14} color="#6366F1" />
                    </View>
                    <View style={styles.commentUserInfo}>
                      <Text style={styles.commentUsername}>
                        {comment.profiles?.username}
                      </Text>
                      <Text style={styles.commentTimestamp}>
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    {comment.image_url && (
                      <View style={styles.commentImageContainer}>
                        <Image
                          source={{ uri: comment.image_url }}
                          style={styles.commentImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputSection}>
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
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Camera size={20} color="#64748B" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Add a reply..."
            placeholderTextColor="#94A3B8"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!newComment.trim() && !image) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() && !image}
          >
            <Text style={[
              styles.submitButtonText,
              (!newComment.trim() && !image) && styles.submitButtonTextDisabled
            ]}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#64748B',
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  actionButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  commentsSectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#94A3B8',
    textAlign: 'center',
  },
  commentsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 1,
  },
  commentTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#64748B',
  },
  commentContent: {
    marginLeft: 42,
  },
  commentText: {
    fontSize: 15,
    fontFamily: 'Inter',
    color: '#334155',
    lineHeight: 22,
    marginBottom: 8,
  },
  commentImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  commentImage: {
    width: '100%',
    height: 140,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 120,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  imageButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
    minHeight: 44,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  submitButtonTextDisabled: {
    color: '#94A3B8',
  },
}); 