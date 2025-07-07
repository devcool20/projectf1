import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart } from 'lucide-react-native';
import PostCard from '../PostCard';

type ThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
};

export function ThreadView({ thread, onClose, session }: ThreadViewProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);

  const fetchReplies = useCallback(async () => {
    if (!thread) return;
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:user_id(username, avatar_url),
          likes:likes!reply_id(count)
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });
      if (error) throw error;

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
          likeCount: r.likes?.length || 0,
        }));
        setReplies(repliesWithStatus);
      } else {
        const repliesWithCounts = data.map(r => ({
          ...r,
          likeCount: r.likes?.length || 0,
        }));
        setReplies(repliesWithCounts);
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

  const handlePostReply = async () => {
    if (!thread || !newReply.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('replies').insert({
        content: newReply.trim(),
        thread_id: thread.id,
        user_id: user.id,
      });

      if (error) throw error;

      setNewReply('');
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
      alert('Failed to delete reply');
    }
  };

  const handleReplyTo = (username: string) => {
    setNewReply(`@${username} `);
  };

  if (!thread) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={28} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Main Post - No Card */}
        <View style={styles.postContainer}>
           <PostCard
            username={thread.profiles?.username || 'Anonymous'}
            avatarUrl={thread.profiles?.avatar_url}
            content={thread.content}
            imageUrl={thread.image_url}
            timestamp={thread.created_at}
            likes={thread.likes[0]?.count || 0}
            comments={thread.replies[0]?.count || 0}
            isLiked={thread.isLiked}
            onCommentPress={() => {}}
            onLikePress={() => {}}
            onDeletePress={() => {}}
          />
        </View>

        {/* Reply Box - Single Line */}
        <View style={styles.replyBox}>
          <TextInput
            style={styles.replyInput}
            placeholder="Post your reply"
            placeholderTextColor="hsl(var(--muted-foreground))"
            value={newReply}
            onChangeText={setNewReply}
          />
          <TouchableOpacity style={styles.replyButton} onPress={handlePostReply}>
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {loadingReplies ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.commentsContainer}>
            {replies.map((reply) => (
              <TouchableOpacity key={reply.id} onLongPress={() => handleReplyTo(reply.profiles?.username || 'Anonymous')}>
                <View style={styles.comment}>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{reply.profiles?.username || 'Anonymous'}</Text>
                    <Text style={styles.commentText}>{reply.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked)} style={styles.actionButton}>
                        <Heart size={16} color={reply.isLiked ? 'red' : 'hsl(var(--muted-foreground))'} />
                        <Text style={styles.actionText}>{reply.likeCount || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={styles.actionButton}>
                        <Trash2 size={16} color="hsl(var(--muted-foreground))" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'hsl(var(--background))',
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
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  replyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'hsl(var(--border))',
  },
  replyInput: {
    flex: 1,
    color: 'hsl(var(--foreground))',
    paddingVertical: 8,
  },
  replyButton: {
    backgroundColor: 'hsl(var(--primary))',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  replyButtonText: {
    color: 'hsl(var(--primary-foreground))',
    fontWeight: 'bold',
  },
  commentsContainer: {
    padding: 16,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    marginBottom: 4,
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