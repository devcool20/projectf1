import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter } from 'expo-router';
import PostCard from '@/components/PostCard';
import { ThreadView } from '@/components/community/ThreadView';
import { Home, Users, Clapperboard, ShoppingBag, Trophy, User, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Community', icon: Users, path: '/community' },
  { label: 'Screenings', icon: Clapperboard, path: '/screenings' },
  { label: 'Shop', icon: ShoppingBag, path: '/shop' },
  { label: 'Drivers', icon: Trophy, path: '/drivers' },
];

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [postInput, setPostInput] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchPosts();
    fetchNews();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`*, profiles:user_id (username)`)
        .order('created_at', { ascending: false });
      if (postsError) throw postsError;
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*');
      if (likesError) throw likesError;
      const likesCount = likesData?.reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      let userLikedPosts: string[] = [];
      if (user) {
        userLikedPosts = likesData
          ?.filter(like => like.user_id === user.id)
          .map(like => like.post_id) || [];
      }
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

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(RSS_TO_JSON_URL);
      const data = await res.json();
      
      if (data.status === 'ok' && data.items) {
        const transformedNews = data.items.map((item: any) => ({
          title: item.title,
          description: item.description?.replace(/<[^>]*>/g, '').slice(0, 150) + '...' || 'No description available',
          url: item.link,
        }));
        setNews(transformedNews);
      } else {
        setNews([]);
      }
    } catch (e) {
      console.error('Error fetching news:', e);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handlePostPress = (post: any) => {
    setSelectedThread(post);
  };

  const handleLike = async (post: any) => {
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
      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
      alert('Failed to update like status');
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

  const handleCreatePost = async () => {
    if (!session) {
      setShowAuth(true);
      return;
    }
    if (!postInput.trim() && !image) return;

    try {
      let imageUrl: string | null = null;
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const fileName = image.split('/').pop();
        const fileExt = fileName?.split('.').pop();
        const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, blob, {
            contentType: blob.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('posts').insert({
        content: postInput.trim(),
        user_id: session.user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setPostInput('');
      setImage(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  return (
    <View className="flex-row w-full min-h-screen bg-background">
      {/* Left Sidebar Nav */}
      <View className="w-60 min-h-screen bg-background px-2 py-4 flex flex-col justify-between">
        {/* Top Nav Items & Post Button */}
        <View>
          <View className="mb-6 ml-3">
            <Text className="text-2xl font-bold text-f1-red">F1</Text>
          </View>
          <View className="w-full flex flex-col items-start gap-0">
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.path as any)}
                className="flex-row items-center w-full mb-1 px-3 py-2.5 rounded-full transition-colors duration-200 hover:bg-muted"
              >
                <item.icon size={24} color="hsl(var(--foreground))" strokeWidth={1.5} />
                <Text className="text-lg font-medium text-foreground ml-4">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleCreatePost}
            className="w-11/12 bg-f1-red mt-5 py-2.5 rounded-full flex items-center justify-center shadow-lg self-center"
          >
            <Text className="text-white text-md font-bold">Post</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          className="flex-row items-center w-full px-3 py-2 rounded-full hover:bg-muted"
        >
          <View className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
            <User size={20} color="hsl(var(--foreground))" />
          </View>
          <View className="ml-2 flex-1">
            <Text className="font-bold text-sm text-foreground">{session?.user?.email?.split('@')[0] || 'Guest'}</Text>
            <Text className="text-xs text-muted-foreground">@{session?.user?.email?.split('@')[0] || 'guest'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Centered Scrollable Threads Container or Thread View */}
      <View className="flex-1 flex items-center border-l border-border ml-24">
        <View className="w-full max-w-2xl min-h-screen flex flex-col items-center">
          {selectedThread ? (
            <ThreadView post={selectedThread} onClose={() => setSelectedThread(null)} />
          ) : (
            <View className="w-full bg-card rounded-2xl shadow-kodama-lg flex flex-col h-[95vh]">
              {/* Post Input (Sticky at top of container) */}
              <View className="w-full border-b border-border bg-background/80 z-10 px-4 py-3">
                <View className="flex-row items-start gap-3">
                  <View className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Text className="text-white font-semibold text-lg">{session?.user?.email?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                  <TextInput
                    className="flex-1 bg-muted/40 rounded-xl px-3 py-2 text-base font-serif text-foreground"
                    placeholder="What's happening?"
                    value={postInput}
                    onChangeText={setPostInput}
                    multiline
                    numberOfLines={2}
                    maxLength={280}
                  />
                </View>
                {image && (
                  <View className="mt-3 relative self-start">
                    <Image source={{ uri: image }} className="w-20 h-20 rounded-lg" />
                    <TouchableOpacity 
                      onPress={() => setImage(null)}
                      className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1"
                    >
                      <X size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                <View className="flex-row justify-between items-center mt-2">
                  <TouchableOpacity onPress={pickImage} className="p-2">
                    <Camera size={22} color="hsl(var(--f1-red))" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-f1-red px-5 py-2 rounded-full shadow-kodama-md"
                    onPress={handleCreatePost}
                  >
                    <Text className="text-white font-semibold text-base">Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Scrollable Threads Feed */}
              <View className="flex-1 overflow-hidden">
                {loading ? (
                  <View className="flex-1 justify-center items-center py-8">
                    <ActivityIndicator color="hsl(var(--f1-red))" />
                  </View>
                ) : (
                  <ScrollView
                    className="w-full scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent"
                    showsVerticalScrollIndicator={true}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                  >
                    <View className="px-4 py-4 space-y-4">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          username={post.profiles?.username || 'Anonymous'}
                          content={post.content}
                          timestamp={new Date(post.created_at).toLocaleDateString()}
                          likes={post.likes || 0}
                          comments={post.comments?.length || 0}
                          onThreadClick={() => handlePostPress(post)}
                          onLike={() => handleLike(post)}
                          isLiked={post.user_liked}
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Right News Card */}
      <View className="w-80 min-h-screen flex flex-col bg-background px-4 pt-6">
        <View className="w-full bg-card rounded-2xl shadow-kodama-lg p-4 flex flex-col h-[95vh]">
          <Text className="text-xl font-heading font-bold mb-4 text-f1-red">F1 News</Text>
          {newsLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator color="hsl(var(--f1-red))" />
            </View>
          ) : news.length === 0 ? (
            <Text className="text-muted-foreground">No news available.</Text>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={true} className="flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                {news.slice(0, 5).map((article, idx) => (
                  <TouchableOpacity key={idx} onPress={() => router.push('/news')}>
                    <View className="mb-4 bg-background/50 rounded-lg p-3 border border-border">
                      <Text className="font-heading font-semibold text-sm mb-1 text-foreground" numberOfLines={2}>
                        {article.title}
                      </Text>
                      <Text className="text-muted-foreground text-xs" numberOfLines={2}>
                        {article.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => router.push('/news')}
                className="mt-2 bg-f1-red/10 px-3 py-2 rounded-lg self-center"
              >
                <Text className="text-f1-red font-semibold text-sm">See all news</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {showAuth && (
        <AuthModal
          visible={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            fetchPosts();
          }}
        />
      )}
    </View>
  );
}