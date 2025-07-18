import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart, Camera, X } from 'lucide-react-native';
import PostCard from '../PostCard';
import * as ImagePicker from 'expo-image-picker';
import { formatThreadTimestamp } from '@/lib/utils';

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

const TEAM_LOGOS: { [key: string]: any } = {
  'Red Bull Racing': require('@/team-logos/redbull.png'),
  'Scuderia Ferrari': require('@/team-logos/ferrari.png'),
  'Mercedes-AMG': require('@/team-logos/mercedes.png'),
  'McLaren': require('@/team-logos/mclaren.png'),
  'Aston Martin': require('@/team-logos/astonmartin.png'),
  'Alpine': require('@/team-logos/alpine.png'),
  'Williams': require('@/team-logos/williams.png'),
  'Haas': require('@/team-logos/haas.png'),
  'Stake F1': require('@/team-logos/stake.png'),
  'RB': require('@/team-logos/racingbulls.png'),
};

type ThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
  onProfilePress?: (userId: string) => void;
};

export function ThreadView({ thread, onClose, session, onProfilePress }: ThreadViewProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [threadData, setThreadData] = useState(thread);
  const [adminUserId, setAdminUserId] = useState<string>('');
  const replyInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { width: screenWidth } = Dimensions.get('window');
  // Helper to detect mobile web
  function isMobileWeb() {
    if (Platform.OS !== 'web') return false;
    if (typeof navigator !== 'undefined') {
      return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    }
    return false;
  }

  const isVerySmallMobileWeb = isMobileWeb() && screenWidth < 400;

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL;
  };

  // Helper function to check if a user ID is admin
  const isUserAdmin = (userId: string) => {
    return userId === adminUserId;
  };

  // Function to check and load admin users from database
  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true);
      
      if (error) {
        console.error('Error loading admin users:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Set the first admin user ID found (there should only be one)
        setAdminUserId(data[0].id);
      }
    } catch (error) {
      console.error('Error in loadAdminUsers:', error);
    }
  };

  const fetchReplies = useCallback(async () => {
    if (!thread) return;
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team)
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('reply_id')
          .in('reply_id', data.map(r => r.id));
      
      if (likesError) throw likesError;

        const likeCountMap = likesData.reduce((acc: any, like: any) => {
        acc[like.reply_id] = (acc[like.reply_id] || 0) + 1;
        return acc;
        }, {});

      if (session) {
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select('reply_id')
            .in('reply_id', data.map(r => r.id))
          .eq('user_id', session.user.id);
        
        if (userLikesError) throw userLikesError;

        const likedReplyIds = new Set(userLikesData.map(l => l.reply_id));
        
        const repliesWithStatus = data.map(r => ({
          ...r,
          isLiked: likedReplyIds.has(r.id),
          likeCount: likeCountMap[r.id] || 0,
        }));
        setReplies(repliesWithStatus);
      } else {
        const repliesWithCounts = data.map(r => ({
          ...r,
          likeCount: likeCountMap[r.id] || 0,
        }));
        setReplies(repliesWithCounts);
        }
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [thread, session]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  // Fetch current view count when component mounts
  useEffect(() => {
    const fetchViewCount = async () => {
      if (thread) {
        try {
          const { count, error } = await supabase
            .from('thread_views')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);
          
          if (!error && count !== null) {
            setThreadData(prev => prev ? { ...prev, view_count: count } : prev);
          }
        } catch (error) {
          console.error('Error fetching view count:', error);
        }
      }
    };
    
    fetchViewCount();
  }, [thread]);

  useEffect(() => {
    setThreadData(thread);
    // Scroll to top when thread changes
    if (thread && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 300);
    }
  }, [thread]);

  // Additional effect to ensure scroll to top on mount
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, []);

  // Force scroll to top when thread data is set
  useEffect(() => {
    if (threadData && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 200);
    }
  }, [threadData]);

  useEffect(() => {
    // Load admin users from database
    loadAdminUsers();
  }, []);



  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session?.user) {
      console.log('No session, cannot like reply');
      return;
    }

    // Optimistic update
    setReplies(prevReplies => prevReplies.map(r => {
      if (r.id === replyId) {
        const newLikeCount = isLiked ? r.likeCount - 1 : r.likeCount + 1;
        return { ...r, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return r;
    }));

    try {
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().match({ reply_id: replyId, user_id: session.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ reply_id: replyId, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setReplies(prevReplies => prevReplies.map(r => {
        if (r.id === replyId) {
          const revertedLikeCount = isLiked ? r.likeCount + 1 : r.likeCount - 1;
          return { ...r, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return r;
      }));
      Alert.alert('Failed to update like');
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session?.user) {
      console.log('No session, cannot like thread');
      return;
    }

    // Optimistic update
    setThreadData(prevThread => ({
      ...prevThread,
      isLiked: !isLiked,
      likeCount: isLiked ? prevThread.likeCount - 1 : prevThread.likeCount + 1
    }));

    try {
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling thread like:', error);
      // Revert optimistic update on error
      setThreadData(prevThread => ({
        ...prevThread,
        isLiked: isLiked,
        likeCount: isLiked ? prevThread.likeCount + 1 : prevThread.likeCount - 1
      }));
      Alert.alert('Failed to update like');
    }
  };

  // Bookmark toggle logic
  const handleBookmarkToggle = async () => {
    if (!session?.user) {
      Alert.alert('Please log in to bookmark threads.');
      return;
    }
    try {
      if (threadData.isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('thread_id', threadData.id)
          .eq('user_id', session.user.id);
        if (error) throw error;
        setThreadData((prev) => ({ ...prev, isBookmarked: false }));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ thread_id: threadData.id, user_id: session.user.id });
        if (error) throw error;
        setThreadData((prev) => ({ ...prev, isBookmarked: true }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Failed to update bookmark');
    }
  };

  const pickReplyImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReplyImage(result.assets[0].uri);
    }
  };

  const uploadReplyImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = uri.split('/').pop();
      const fileExt = fileName?.split('.').pop();

      const filePath = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('reply-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reply-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading reply image:', error);
      throw error;
    }
  };

  const handlePostReply = async () => {
    if (!thread || (!newReply.trim() && !replyImage)) return;
    if (!session?.user) {
      console.log('No session, cannot post reply');
      return;
    }

    try {
      let imageUrl: string | null = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }

      const { error } = await supabase.from('replies').insert({
        content: newReply.trim(),
        thread_id: thread.id,
        user_id: session.user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setNewReply('');
      setReplyImage(null);
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Failed to post reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase.from('replies').delete().eq('id', replyId);
      if (error) throw error;
      await fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      Alert.alert('Failed to delete reply');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      const { error } = await supabase.from('threads').delete().eq('id', threadId);
      if (error) throw error;
      // Navigate back to community after deleting thread
      onClose();
    } catch (error) {
      console.error('Error deleting thread:', error);
      Alert.alert('Failed to delete thread');
    }
  };

  const handleReplyTo = (username: string) => {
    setNewReply(`@${username} `);
    // Focus the input after a small delay to ensure the text is set
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    onClose();
  };

  if (!thread) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </View>
    );
  }

  const USERNAME_FONT_SIZE = 18;

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <ArrowLeft size={28} color="#3a3a3a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} selectable={false}>Thread</Text>
      </View>

      {/* Scrollable Content Wrapper */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          indicatorStyle="default"
          scrollIndicatorInsets={{ right: 1 }}
          nestedScrollEnabled={true}
          alwaysBounceVertical={true}
          automaticallyAdjustContentInsets={false}
          contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        >
          {/* Main Post */}
          <View style={[styles.postContainer, isVerySmallMobileWeb && { alignItems: 'flex-start', paddingLeft: 0, paddingRight: 0, marginLeft: -8 }]}> {/* <-- left shift only for mobile web */}
             <PostCard
              username={threadData.profiles?.username || 'Anonymous'}
              avatarUrl={threadData.profiles?.avatar_url}
              content={threadData.content}
              imageUrl={threadData.image_url}
              timestamp={threadData.created_at}
              likes={threadData.likeCount || 0}
              comments={threadData.replyCount || 0}
              views={threadData.view_count || 0}
              isLiked={threadData.isLiked}
              isBookmarked={threadData.isBookmarked || false}
              favoriteTeam={threadData.profiles?.favorite_team}
              userId={threadData.user_id}
              onCommentPress={() => {}} // No action needed in thread view
              onLikePress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked)}
              onBookmarkPress={handleBookmarkToggle}
              onDeletePress={() => handleDeleteThread(threadData.id)}
              onProfilePress={onProfilePress}
              canDelete={session && (threadData.user_id === session.user.id || isCurrentUserAdmin())}
              canAdminDelete={isCurrentUserAdmin()}
              isAdmin={isUserAdmin(threadData.user_id)}
            />
          </View>

          {/* Reply Box - Right after the main post */}
          <View style={styles.replyBoxInline}>
            {replyImage && (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: replyImage }} 
                  style={[styles.previewImage, { backgroundColor: 'transparent' }]} 
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => setReplyImage(null)}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.replyInputContainer}>
              <TextInput
                ref={replyInputRef}
                style={styles.replyInput}
                placeholder="Post your reply"
                placeholderTextColor="#505050"
                value={newReply}
                onChangeText={setNewReply}
                multiline={false}
                numberOfLines={1}
              />
              <TouchableOpacity onPress={pickReplyImage} style={styles.imagePickerButton}>
                <Camera size={20} color="#505050" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.replyButton, (!newReply.trim() && !replyImage) && styles.replyButtonDisabled]} 
                onPress={handlePostReply}
                disabled={!newReply.trim() && !replyImage}
              >
                <Text style={styles.replyButtonText} selectable={false}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e5e5', marginBottom: 8 }} />

          {/* Comments Section */}
          {loadingReplies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {replies.map((reply) => (
                <TouchableOpacity key={reply.id} onLongPress={() => handleReplyTo(reply.profiles?.username || 'Anonymous')}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                    {/* Avatar Column */}
                    <TouchableOpacity 
                      onPress={() => reply.user_id && onProfilePress && onProfilePress(reply.user_id)}
                      disabled={!reply.user_id || !onProfilePress}
                      style={{ marginRight: 12, marginTop: 2 }}
                    >
                      {reply.profiles?.avatar_url ? (
                        <Image 
                          source={{ uri: reply.profiles.avatar_url }} 
                          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            {(reply.profiles?.username || 'A').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    {/* Content Column */}
                    <View style={{ flex: 1, paddingLeft: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <TouchableOpacity 
                          onPress={() => reply.user_id && onProfilePress && onProfilePress(reply.user_id)}
                          disabled={!reply.user_id || !onProfilePress}
                        >
                          <Text style={{ fontWeight: 'bold', color: '#000', fontSize: USERNAME_FONT_SIZE }} selectable={false}>{reply.profiles?.username || 'Anonymous'}</Text>
                        </TouchableOpacity>
                        {isUserAdmin(reply.user_id) ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: USERNAME_FONT_SIZE * 1.2, height: USERNAME_FONT_SIZE * 1.2, marginLeft: 6 }}
                            resizeMode="contain"
                          />
                        ) : reply.profiles?.favorite_team && TEAM_LOGOS[reply.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[reply.profiles.favorite_team]} 
                            style={{ width: USERNAME_FONT_SIZE * 1.2, height: USERNAME_FONT_SIZE * 1.2, marginLeft: 6 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{formatThreadTimestamp(reply.created_at)}</Text>
                      <Text style={{ color: '#000', marginBottom: 8 }} selectable={false}>{reply.content}</Text>
                      {reply.image_url && (
                        <Image 
                          source={{ uri: reply.image_url }} 
                          style={{ alignSelf: 'flex-start', width: 220, height: 180, maxWidth: 220, borderRadius: 12, marginLeft: 0, marginRight: 0, objectFit: 'cover' }}
                          resizeMode="cover"
                        />
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                          <Heart size={14} color={reply.isLiked ? '#dc2626' : '#505050'} fill={reply.isLiked ? '#dc2626' : 'none'} />
                          {reply.likeCount > 0 && <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 12 }}>{reply.likeCount}</Text>}
                        </TouchableOpacity>
                        {session && (reply.user_id === session.user.id || isCurrentUserAdmin()) && (
                          <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                            <Trash2 size={14} color="#505050" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff'
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a3a3a',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  replyBoxInline: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    fontSize: 14,
    minHeight: 36,
    maxHeight: 36,
    pointerEvents: 'auto',
    caretColor: 'auto',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderColor: 'transparent',
  },
  imagePickerButton: {
    padding: 6,
    marginRight: 8,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 4,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  replyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  replyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  replyImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  commentsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: 400,
    flex: 1,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentUsernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#000000',
  },
  commentTeamLogo: {
    width: 12,
    height: 12,
    marginLeft: 6,
  },
  commentText: {
    color: '#000000',
    marginBottom: 8,
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 12,
  },
}); 