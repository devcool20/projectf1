import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type PostProps = {
  post: Database['public']['Tables']['posts']['Row'] & {
    profiles: {
      username: string;
    };
    likes: number;
    user_liked: boolean;
  };
  onLikeChange: () => void;
};

export function Post({ post, onLikeChange }: PostProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Rendering post:', post);
  }, [post]);

  const handleLike = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (post.user_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });
      }

      onLikeChange();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!post || !post.profiles) {
    console.error('Invalid post data:', post);
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>@{post.profiles.username}</Text>
        <Text style={styles.date}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#E10600" />
          ) : (
            <>
              <Heart
                size={20}
                color={post.user_liked ? '#E10600' : '#666666'}
                fill={post.user_liked ? '#E10600' : 'none'}
              />
              <Text
                style={[
                  styles.likeCount,
                  post.user_liked && styles.likeCountActive,
                ]}
              >
                {post.likes}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#666666',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#666666',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666666',
  },
  likeCountActive: {
    color: '#E10600',
  },
});