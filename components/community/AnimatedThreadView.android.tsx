import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
  Modal,
  StyleSheet,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, Camera, X, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth } = Dimensions.get('window');

type AnimatedThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
  onProfilePress?: (userId: string) => void;
  onRepostPress?: (thread: any) => void;
  onThreadPress?: (threadId: string) => void;
  onThreadIdPress?: (threadId: string) => void;
  onDeleteRepost?: (repostId: string) => void;
  isVisible: boolean;
};

export function AnimatedThreadView({ 
  thread, 
  onClose, 
  session, 
  onProfilePress, 
  onRepostPress, 
  onThreadPress, 
  onThreadIdPress, 
  onDeleteRepost,
  isVisible 
}: AnimatedThreadViewProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [postingReply, setPostingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);

  const fetchReplies = useCallback(async (currentThread: any) => {
    if (!currentThread) return;
    setLoadingReplies(true);
    try {
      setNetworkError(false);
      const { data: replies, error: repliesError } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team, full_name)
        `)
        .eq('thread_id', currentThread.id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      const validatedReplies = replies.map(reply => ({
        ...reply,
        profiles: reply.profiles || null
      }));

      setReplies(validatedReplies);
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      if (error.message?.includes('Network request failed')) {
        setNetworkError(true);
        setReplies([]);
      } else {
        setError('Failed to fetch replies');
      }
    } finally {
      setLoadingReplies(false);
    }
  }, []);

  const fetchThreadData = async () => {
    if (!thread) return;
    
    try {
      setNetworkError(false);
      // Fetch like status
      if (session?.user?.id) {
        const { data: likeData, error: likeError } = await supabase
          .from('likes')
          .select('*')
          .eq('thread_id', thread.id)
          .eq('user_id', session.user.id)
          .single();

        if (!likeError && likeData) {
          setIsLiked(true);
        }
      }

      // Fetch bookmark status
      if (session?.user?.id) {
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('thread_id', thread.id)
          .eq('user_id', session.user.id)
          .single();

        if (!bookmarkError && bookmarkData) {
          setIsBookmarked(true);
        }
      }

      // Fetch counts
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id);

      const { count: bookmarksCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id);

      setLikeCount(likesCount || 0);
      setBookmarkCount(bookmarksCount || 0);
    } catch (error: any) {
      console.error('Error fetching thread data:', error);
      if (error.message?.includes('Network request failed')) {
        setNetworkError(true);
      }
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session?.user?.id) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', session.user.id);

        if (error) throw error;
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            thread_id: threadId,
            user_id: session.user.id
          });

        if (error) throw error;
        setLikeCount(prev => prev + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling thread like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handlePostReply = async () => {
    if (!session?.user?.id || !thread || !replyContent.trim()) return;

    setPostingReply(true);
    try {
      let imageUrl = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }

      const { error } = await supabase
        .from('replies')
        .insert({
          thread_id: thread.id,
          user_id: session.user.id,
          content: replyContent.trim(),
          image_url: imageUrl
        });

      if (error) throw error;

      setReplyContent('');
      setReplyImage(null);
      fetchReplies(thread);
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    } finally {
      setPostingReply(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!session?.user?.id || !thread) return;

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('thread_id', thread.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
        setBookmarkCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            thread_id: thread.id,
            user_id: session.user.id
          });

        if (error) throw error;
        setBookmarkCount(prev => prev + 1);
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const pickReplyImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReplyImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadReplyImage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `reply-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const getUserDisplayName = (profile: any): string => {
    if (!profile) return 'Anonymous';
    return profile.full_name || profile.username || 'Anonymous';
  };

  useEffect(() => {
    if (thread && isVisible) {
      fetchReplies(thread);
      fetchThreadData();
    }
  }, [thread, isVisible]);

  if (!thread || !isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread</Text>
          <View style={styles.headerSpacer} />
        </View>

        {networkError && (
          <View style={styles.networkErrorBanner}>
            <Text style={styles.networkErrorText}>
              ⚠️ Network connection issues. Some features may be limited.
            </Text>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Original Thread */}
          <View style={styles.threadContainer}>
            <View style={styles.threadHeader}>
              <TouchableOpacity 
                onPress={() => onProfilePress?.(thread.user_id)}
                style={styles.avatarContainer}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {thread.profiles?.username?.charAt(0)?.toUpperCase() || 'A'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.threadInfo}>
                <Text style={styles.username}>{thread.profiles?.username || 'Anonymous'}</Text>
                <Text style={styles.timestamp}>
                  {new Date(thread.created_at).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.threadContent}>{thread.content}</Text>
            
            {thread.image_url && (
              <View style={styles.threadImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷 Image</Text>
              </View>
            )}

            <View style={styles.threadActions}>
              <TouchableOpacity 
                onPress={() => handleThreadLikeToggle(thread.id, isLiked)}
                style={styles.actionButton}
              >
                <Heart size={20} color={isLiked ? "#dc2626" : "#666666"} fill={isLiked ? "#dc2626" : "none"} />
                <Text style={[styles.actionText, isLiked && styles.likedText]}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color="#666666" />
                <Text style={styles.actionText}>{replies.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => onRepostPress?.(thread)}
                style={styles.actionButton}
              >
                <Repeat2 size={20} color="#666666" />
                <Text style={styles.actionText}>Repost</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleBookmarkToggle}
                style={styles.actionButton}
              >
                <Bookmark size={20} color={isBookmarked ? "#1DA1F2" : "#666666"} fill={isBookmarked ? "#1DA1F2" : "none"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Replies */}
          <View style={styles.repliesContainer}>
            <Text style={styles.repliesTitle}>Replies</Text>
            {loadingReplies ? (
              <ActivityIndicator style={styles.loadingIndicator} color="#dc2626" />
            ) : replies.length === 0 ? (
              <View style={styles.emptyReplies}>
                <Text style={styles.emptyRepliesText}>No replies yet</Text>
                <Text style={styles.emptyRepliesSubtext}>Be the first to reply!</Text>
              </View>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.replyContainer}>
                  <View style={styles.replyHeader}>
                    <TouchableOpacity 
                      onPress={() => onProfilePress?.(reply.user_id)}
                      style={styles.replyAvatarContainer}
                    >
                      <View style={styles.replyAvatar}>
                        <Text style={styles.replyAvatarText}>
                          {reply.profiles?.username?.charAt(0)?.toUpperCase() || 'A'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.replyInfo}>
                      <Text style={styles.replyUsername}>{reply.profiles?.username || 'Anonymous'}</Text>
                      <Text style={styles.replyTimestamp}>
                        {new Date(reply.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.replyContent}>{reply.content}</Text>
                  
                  {reply.image_url && (
                    <View style={styles.replyImagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>📷 Image</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Reply Input */}
        <View style={styles.replyInputContainer}>
          <View style={styles.replyInputRow}>
            <TextInput
              style={styles.replyInput}
              placeholder="Reply to this thread..."
              placeholderTextColor="#666666"
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
              maxLength={500}
            />
            <TouchableOpacity onPress={pickReplyImage} style={styles.cameraButton}>
              <Camera size={20} color="#1DA1F2" />
            </TouchableOpacity>
          </View>
          
          {replyImage && (
            <View style={styles.replyImagePreviewContainer}>
              <View style={styles.replyImagePreview}>
                <Text style={styles.imagePlaceholderText}>📷 Image Selected</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setReplyImage(null)}
                style={styles.removeReplyImageButton}
              >
                <X size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            onPress={handlePostReply}
            disabled={!replyContent.trim() || postingReply}
            style={[styles.postReplyButton, (!replyContent.trim() || postingReply) && styles.postReplyButtonDisabled]}
          >
            {postingReply ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.postReplyButtonText}>Reply</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  networkErrorBanner: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  networkErrorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  threadContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  threadHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  threadInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  threadContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
  },
  threadImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: '#666666',
    fontSize: 16,
  },
  threadActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666666',
  },
  likedText: {
    color: '#dc2626',
  },
  repliesContainer: {
    padding: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  emptyReplies: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyRepliesText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyRepliesSubtext: {
    color: '#666666',
    fontSize: 14,
  },
  replyContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  replyHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  replyAvatarContainer: {
    marginRight: 12,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  replyInfo: {
    flex: 1,
  },
  replyUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  replyTimestamp: {
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  replyContent: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 8,
  },
  replyImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    backgroundColor: '#000000',
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    minHeight: 44,
  },
  cameraButton: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
  },
  replyImagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  replyImagePreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeReplyImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  postReplyButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postReplyButtonDisabled: {
    backgroundColor: '#666666',
  },
  postReplyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 