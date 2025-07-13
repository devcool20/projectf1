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
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart, Camera, X } from 'lucide-react-native';
import PostCard from '../PostCard';
import * as ImagePicker from 'expo-image-picker';

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
};

export function ThreadView({ thread, onClose, session }: ThreadViewProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [threadData, setThreadData] = useState(thread);
  const replyInputRef = useRef<TextInput>(null);

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

  useEffect(() => {
    setThreadData(thread);
  }, [thread]);

  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session) {
      // or show auth modal
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
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) {
      // or show auth modal
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl: string | null = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }

      const { error } = await supabase.from('replies').insert({
        content: newReply.trim(),
        thread_id: thread.id,
        user_id: user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setNewReply('');
      setReplyImage(null);
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
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
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={28} color="#3a3a3a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} selectable={false}>Thread</Text>
      </View>

      {/* Scrollable Content Wrapper */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
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
        >
          {/* Main Post */}
          <View style={styles.postContainer}>
             <PostCard
              username={threadData.profiles?.username || 'Anonymous'}
              avatarUrl={threadData.profiles?.avatar_url}
              content={threadData.content}
              imageUrl={threadData.image_url}
              timestamp={threadData.created_at}
              likes={threadData.likeCount || 0}
              comments={threadData.replyCount || 0}
              isLiked={threadData.isLiked}
              favoriteTeam={threadData.profiles?.favorite_team}
              onCommentPress={() => {}}
              onLikePress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked)}
                              onDeletePress={() => handleDeleteThread(threadData.id)}
              canDelete={session && threadData.user_id === session.user.id}
            />
          </View>

          {/* Reply Box - Right after the main post */}
          <View style={styles.replyBoxInline}>
            {replyImage && (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: replyImage }} 
                  style={[styles.previewImage, { backgroundColor: '#f3f4f6' }]} 
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
                selectable={true}
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

          {/* Comments Section */}
          {loadingReplies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {replies.map((reply) => (
                <TouchableOpacity key={reply.id} onLongPress={() => handleReplyTo(reply.profiles?.username || 'Anonymous')}>
                  <View style={styles.comment}>
                    <View style={styles.commentContent}>
                      <View style={styles.commentUsernameRow}>
                        <Text style={[styles.commentUsername, { fontSize: USERNAME_FONT_SIZE }]} selectable={false}>{reply.profiles?.username || 'Anonymous'}</Text>
                        {reply.profiles?.favorite_team && TEAM_LOGOS[reply.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[reply.profiles.favorite_team]} 
                            style={{ width: USERNAME_FONT_SIZE * 1.2, height: USERNAME_FONT_SIZE * 1.2, marginLeft: 6 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <Text style={styles.commentText} selectable={false}>{reply.content}</Text>
                      {reply.image_url && (
                        <Image 
                          source={{ uri: reply.image_url }} 
                          style={[styles.replyImage, { backgroundColor: '#f3f4f6' }]} 
                          resizeMode="contain"
                        />
                      )}
                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked)} style={styles.actionButton}>
                          <Heart size={16} color={reply.isLiked ? '#dc2626' : '#505050'} fill={reply.isLiked ? '#dc2626' : 'none'} />
                          {reply.likeCount > 0 && <Text style={styles.actionText} selectable={false}>{reply.likeCount}</Text>}
                        </TouchableOpacity>
                        {session && reply.user_id === session.user.id && (
                        <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={styles.actionButton}>
                          <Trash2 size={16} color="#505050" />
                        </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
    backgroundColor: 'hsl(var(--background))',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))'
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: 'hsl(var(--background))',
  },
  scrollContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
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
    color: 'hsl(var(--foreground))',
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
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
    pointerEvents: 'auto',
    caretColor: 'auto',
    outline: 'none',
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
    backgroundColor: 'hsl(var(--primary))',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  replyButtonDisabled: {
    backgroundColor: 'hsl(var(--muted))',
  },
  replyButtonText: {
    color: 'hsl(var(--primary-foreground))',
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
    color: 'hsl(var(--foreground))',
  },
  commentTeamLogo: {
    width: 12,
    height: 12,
    marginLeft: 6,
  },
  commentText: {
    color: 'hsl(var(--foreground))',
    marginBottom: 8,
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
    color: 'hsl(var(--muted-foreground))',
    fontSize: 12,
  },
}); 