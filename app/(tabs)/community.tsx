import React, { useState, useEffect, useCallback } from 'react';
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
import { Home, Users, Clapperboard, ShoppingBag, Trophy, User, Camera, X, ShoppingCart, Newspaper, MoreHorizontal } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'react-native';
import NewPostCard, { PostProps } from '../../components/PostCard';
import { ProfileModal } from '@/components/ProfileModal';

const NAV_ITEMS = [
  { href: '/', icon: Home, name: 'Home' },
  { href: '/community', icon: Users, name: 'Community' },
  { href: '/screenings', icon: Clapperboard, name: 'Screenings' },
  { href: '/shop', icon: ShoppingCart, name: 'Shop' },
  { href: '/drivers', icon: Trophy, name: 'Drivers' },
  { href: '#news', icon: Newspaper, name: 'News' },
  { href: '#profile', icon: User, name: 'Profile' },
];

const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [content, setContent] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<PostProps | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isViewingThread, setIsViewingThread] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`*, profiles:user_id (username, avatar_url)`)
        .order('created_at', { ascending: false });
      if (postsError) throw postsError;
      setPosts(postsData as any);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch(RSS_TO_JSON_URL);
        const data = await res.json();
        if (data.status === 'ok' && data.items) {
          const transformedNews = data.items.map((item: any) => ({
            ...item,
            description: item.description?.replace(/<[^>]*>/g, '') || 'No description available',
            source: { name: 'Formula 1' },
          }));
          setNews(transformedNews);
        }
      } catch (e) {
        console.error('Error fetching news:', e);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchPosts();
    fetchNews();
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!session) {
      setShowAuth(true);
      return;
    }
    if (!content.trim() && !image) return;

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
        content: content.trim(),
        user_id: session.user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setContent('');
      setImage(null);
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
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

  const handleThreadPress = (post: PostProps) => {
    setSelectedThread(post);
    setIsViewingThread(true);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setIsViewingThread(false);
  };

  return (
    <View className="flex-row w-full min-h-screen bg-card">
      {/* Left Sidebar */}
      <View className="w-64 p-4 flex flex-col">
        <View>
          <View className="px-3 mb-4">
            <Text className="text-2xl font-bold text-primary">projectF1</Text>
          </View>
          <View className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.href}
                onPress={() => {
                  if (item.href === '#news') {
                    router.push('/news');
                  } else if (item.href === '#profile') {
                    if (session) {
                      setShowProfileModal(true);
                    } else {
                      setShowAuth(true);
                    }
                  } else {
                    router.push(item.href as `http${string}` | `/${string}`);
                  }
                }}
                className="flex-row items-center space-x-4 p-3 rounded-full hover:bg-muted"
              >
                <item.icon size={24} color={colorScheme === 'dark' ? 'white' : 'black'} strokeWidth={2} />
                <Text className="text-xl font-bold text-foreground">{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-1" />

        {session ? (
          <TouchableOpacity onPress={() => setShowProfileModal(true)} className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <Image
                source={{ uri: session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}` }}
                className="w-10 h-10 rounded-full bg-muted"
              />
              <View>
                <Text className="font-bold text-foreground">{session.user.user_metadata.full_name || session.user.email}</Text>
                <Text className="text-muted-foreground text-sm">@{session.user.user_metadata.username || session.user.email?.split('@')[0]}</Text>
              </View>
            </View>
            <MoreHorizontal size={20} color="hsl(var(--foreground))" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAuth(true)}
            className="bg-primary-red w-full py-3 rounded-full flex items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">Log in</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Centered Scrollable Threads Container or Thread View */}
      <View className="flex-1 flex items-center border-x border-border">
        <View className="w-full max-w-2xl min-h-screen flex flex-col items-center">
          {isViewingThread ? (
            <ThreadView post={selectedThread} onClose={handleCloseThread} />
          ) : (
            <View className="w-full bg-card rounded-2xl shadow-kodama-lg flex flex-col h-[95vh]">
              {/* Header for "For you" / "Following" */}
              <View className="flex-row justify-around border-b border-border p-4">
                <Text className="text-lg font-bold text-foreground">For you</Text>
                <Text className="text-lg font-bold text-muted-foreground">Following</Text>
              </View>

              {/* Scrollable Feed */}
              <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                <View className="p-4 border-b border-border">
                  <View className="flex-row space-x-4">
                    <User size={40} color="gray" />
                    <View className="flex-1">
                      <TextInput
                        placeholder="What's happening?"
                        placeholderTextColor="gray"
                        className="text-lg text-foreground"
                        value={content}
                        onChangeText={setContent}
                        multiline
                      />
                      {image && (
                        <View className="relative mt-2">
                          <Image source={{ uri: image }} className="w-full h-64 rounded-xl" />
                          <TouchableOpacity onPress={() => setImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                            <X size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View className="flex-row justify-between items-center mt-4">
                        <TouchableOpacity onPress={pickImage}>
                          <Camera size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCreatePost}
                          className="bg-primary-red px-4 py-2 rounded-full"
                        >
                          <Text className="text-white font-bold">Post</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {loading ? (
                  <ActivityIndicator className="mt-8" />
                ) : (
                  posts.map((post) => (
                    <TouchableOpacity key={post.id} onPress={() => handleThreadPress(post)} className="border-b border-gray-700">
                      <NewPostCard
                        username={post.profiles?.username || 'Anonymous'}
                        content={post.content}
                        timestamp={post.created_at}
                        likes={post.likes ?? 0}
                        comments={post.comments ?? 0}
                        isLiked={post.isLiked ?? false}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
      
      {/* Right Sidebar for News */}
      <View className="w-80 p-4 space-y-4">
        <View className="bg-muted p-4 rounded-xl">
          <Text className="text-xl font-bold text-foreground mb-4">What's happening</Text>
          {newsLoading ? (
            <ActivityIndicator />
          ) : (
            <ScrollView>
              {news.slice(0, 15).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="mb-4"
                  onPress={() =>
                    router.push({
                      pathname: '/news',
                      params: {
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        enclosure: item.enclosure?.link,
                        source: item.source.name,
                      },
                    })}
                >
                  <Text className="text-muted-foreground text-sm">{item.source.name} · Trending</Text>
                  <Text className="font-bold text-foreground">{item.title}</Text>
                  <Text className="text-muted-foreground text-sm">{item.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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

      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        onLogin={() => {
          setShowProfileModal(false);
          setShowAuth(true);
        }}
      />
    </View>
  );
}