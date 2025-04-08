import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { CreatePost } from '@/components/community/CreatePost';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter } from 'expo-router';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, get all posts with basic info
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get all likes
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*');

      if (likesError) throw likesError;

      // Count likes for each post
      const likesCount = likesData?.reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get user's liked posts if authenticated
      let userLikedPosts: string[] = [];
      if (user) {
        userLikedPosts = likesData
          ?.filter(like => like.user_id === user.id)
          .map(like => like.post_id) || [];
      }

      // Combine the data
      const postsWithLikes = postsData.map(post => ({
        ...post,
        likes: likesCount[post.id] || 0,
        user_liked: userLikedPosts.includes(post.id),
      }));

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handlePostPress = (post: any) => {
    router.push(`/thread/${post.id}`);
  };

  const handleCreatePostPress = () => {
    if (!session) {
      setShowAuth(true);
      return;
    }
    router.push('/create-post');
  };

  const handleLike = async (post: any) => {
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

      // Refresh the posts to update likes count
      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
      alert('Failed to update like status');
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
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={handleCreatePostPress}
        >
          <Text style={styles.createPostButtonText}>Create Post</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color="#E10600" />
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.post}
              onPress={() => handlePostPress(post)}
              activeOpacity={0.7}
            >
              <View style={styles.postContent}>
                <View style={styles.postHeader}>
                  <Text style={styles.username}>{post.profiles?.username}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.content} numberOfLines={3}>
                  {post.content}
                </Text>
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
                    onPress={() => handleLike(post)}
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
                    <Text style={styles.actionText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={20} color="#666666" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {showAuth && (
        <AuthModal
          visible={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            router.push('/create-post');
          }}
        />
      )}
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
  createPostButton: {
    backgroundColor: '#E10600',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  post: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  postContent: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#999999',
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
    color: '#333333',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
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
}); 