import React, { useState, useEffect } from 'react';
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
import { ArrowLeft } from 'lucide-react-native';
import PostCard, { PostProps } from '../PostCard';

type ThreadViewProps = {
  post: PostProps | null;
  onClose: () => void;
};

export function ThreadView({ post, onClose }: ThreadViewProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (post) {
      fetchComments();
    }
  }, [post]);

  const fetchComments = async () => {
    if (!post) return;
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!post || !newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('comments').insert({
        content: newComment.trim(),
        post_id: post.id,
        user_id: user.id,
      });

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReplyTo = (username: string) => {
    setNewComment(`@${username} `);
  };

  if (!post) {
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
            username={post.profiles?.username || 'Anonymous'}
            content={post.content}
            timestamp={post.created_at}
            likes={post.likes || 0}
            comments={comments.length}
            isLiked={false}
          />
        </View>

        {/* Reply Box - Single Line */}
        <View style={styles.replyBox}>
          <TextInput
            style={styles.replyInput}
            placeholder="Post your reply"
            placeholderTextColor="hsl(var(--muted-foreground))"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity style={styles.replyButton} onPress={handlePostComment}>
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {loadingComments ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.commentsContainer}>
            {comments.map((comment) => (
              <TouchableOpacity key={comment.id} onPress={() => handleReplyTo(comment.profiles?.username || 'Anonymous')}>
                <View style={styles.comment}>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{comment.profiles?.username || 'Anonymous'}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
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
    marginBottom: 2,
  },
  commentText: {
    color: 'hsl(var(--foreground))',
  },
}); 