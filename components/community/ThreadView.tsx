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

  const handleReplyTo = (username: string) => {
    setNewComment(`@${username.toLowerCase()} `);
  };

  return (
    <View style={twStyles.outerContainer}>
      {/* Header with yellowish background */}
      <View style={twStyles.headerYellow}>
        <TouchableOpacity onPress={onClose} style={twStyles.headerBack}>
          <ArrowLeft size={28} color="#7c6a4d" />
        </TouchableOpacity>
        <Text style={twStyles.headerTitleYellow}>Post</Text>
      </View>
      <ScrollView
        style={twStyles.scrollView}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Main Post */}
        <View style={twStyles.postContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={twStyles.avatar}>
              <Text style={twStyles.avatarText}>{post.profiles?.username?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={twStyles.username}>{post.profiles?.username || 'User'}</Text>
              <Text style={twStyles.handleSmall}>@{post.profiles?.username?.toLowerCase() || 'user'} · <Text style={twStyles.dateSmall}>{new Date(post.created_at).toLocaleDateString()}</Text></Text>
              <Text style={twStyles.content}>{post.content}</Text>
              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={twStyles.postImage}
                  resizeMode="cover"
                />
              )}
              <View style={twStyles.postActions}>
                <TouchableOpacity 
                  style={twStyles.actionButton}
                  onPress={post.user_liked ? handleUnlike : handleLike}
                >
                  <Heart 
                    size={20} 
                    color={post.user_liked ? '#E10600' : '#a08c6b'} 
                    fill={post.user_liked ? '#E10600' : 'none'}
                  />
                  <Text style={[twStyles.actionTextSmall, post.user_liked && twStyles.actionTextActive]}>
                    {post.likes || 0}
                  </Text>
                </TouchableOpacity>
                <View style={twStyles.actionButton}>
                  <MessageCircle size={20} color="#a08c6b" />
                  <Text style={twStyles.actionTextSmall}>{comments.length}</Text>
                </View>
                <View style={twStyles.actionButton}>
                  <Share2 size={20} color="#a08c6b" />
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* Reply Box */}
        <View style={twStyles.replyBoxInline}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding:10 }}>
            <View style={twStyles.avatarSmall}>
              <Text style={twStyles.avatarTextSmall}>{session?.user?.email?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={twStyles.replyInput}
                placeholder="Post your reply"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                placeholderTextColor="#a08c6b"
              />
              {image && (
                <View style={twStyles.imagePreview}>
                  <Image
                    source={{ uri: image }}
                    style={twStyles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={twStyles.removeImage}
                    onPress={() => setImage(null)}
                  >
                    <Text style={twStyles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
               <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10}}>
                <TouchableOpacity style={twStyles.imageButton} onPress={pickImage}>
                  <Camera size={22} color="#a08c6b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={twStyles.replyButton}
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() && !image}
                >
                  <Text style={twStyles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* Replies */}
        <View style={twStyles.repliesContainer}>
          {loading ? (
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <ActivityIndicator color="#E10600" />
            </View>
          ) : comments.length === 0 ? (
            <Text style={twStyles.noReplies}>No replies yet.</Text>
          ) : (
            comments.map((comment) => (
              <TouchableOpacity key={comment.id} onPress={() => handleReplyTo(comment.profiles?.username)}>
                <View style={twStyles.reply}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={twStyles.avatarSmall}>
                      <Text style={twStyles.avatarTextSmall}>{comment.profiles?.username?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={twStyles.replyUsername}>{comment.profiles?.username || 'User'}</Text>
                      <Text style={twStyles.replyHandleSmall}>@{comment.profiles?.username?.toLowerCase() || 'user'} · <Text style={twStyles.dateSmall}>{new Date(comment.created_at).toLocaleDateString()}</Text></Text>
                      <Text style={twStyles.replyContent}>{comment.content}</Text>
                      {comment.image_url && (
                        <Image
                          source={{ uri: comment.image_url }}
                          style={twStyles.replyImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const twStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 600,
    maxHeight: '95vh',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'hsl(var(--card))',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
    zIndex: 10,
  },
  headerBack: {
    marginRight: 12,
    padding: 2,
  },
  headerTitleYellow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'hsl(var(--card))',
  },
  postContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'hsl(var(--primary))',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  handleSmall: {
    fontSize: 13,
    color: '#a08c6b',
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  dateSmall: {
    fontSize: 12,
    color: '#a08c6b',
    fontFamily: 'Inter',
  },
  content: {
    fontSize: 17,
    color: 'hsl(var(--foreground))',
    marginBottom: 10,
    fontFamily: 'Inter',
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'hsl(var(--muted))',
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionTextSmall: {
    fontSize: 13,
    color: '#a08c6b',
    fontFamily: 'Inter',
  },
  actionTextActive: {
    color: '#E10600',
    fontWeight: 'bold',
  },
  repliesContainer: {
    padding: 10,
    backgroundColor: 'hsl(var(--card))',
  },
  noReplies: {
    color: '#a08c6b',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'Inter',
  },
  reply: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'hsl(var(--primary))',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarTextSmall: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  replyUsername: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 1,
  },
  replyHandleSmall: {
    fontSize: 11,
    color: '#a08c6b',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  replyContent: {
    fontSize: 15,
    color: 'hsl(var(--foreground))',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  replyImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: 'hsl(var(--muted))',
  },
  replyBoxInline: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
  },
  replyInput: {
    backgroundColor: 'hsl(var(--background))',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: 'hsl(var(--foreground))',
    fontFamily: 'Inter',
    minHeight: 40,
    maxHeight: 100,
  },
  imageButton: {
    padding: 6,
  },
  replyButton: {
    backgroundColor: '#E10600',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  imagePreview: {
    position: 'relative',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
}); 