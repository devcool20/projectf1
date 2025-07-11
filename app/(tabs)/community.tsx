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
  ColorSchemeName,
  useColorScheme as useNativeColorScheme,
  Modal,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthModal, AuthModalProps } from '@/components/auth/AuthModal';
import { useRouter } from 'expo-router';
import PostCard from '@/components/PostCard';
import { ThreadView } from '@/components/community/ThreadView';
import { Home, Users, Clapperboard, ShoppingBag, Trophy, User, Camera, X, ShoppingCart, Newspaper, MoreHorizontal, Menu } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileModal } from '@/components/ProfileModal';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Pressable } from 'react-native';

// Wrapper to handle web compatibility for useColorScheme
function useColorScheme(): ColorSchemeName {
  const ancs = useNativeColorScheme();
  return ancs;
}

const NAV_ITEMS = [
  { href: '/', icon: Home, name: 'Home' },
  { href: '/community', icon: Users, name: 'Community' },
  { href: '/screenings', icon: Clapperboard, name: 'Screenings' },
  { href: '/shop', icon: ShoppingCart, name: 'Shop' },
  { href: '/drivers', icon: Trophy, name: 'Drivers' },
  { href: '#news', icon: Newspaper, name: 'News' },
  { href: '#profile', icon: User, name: 'Profile' },
];

const RSS_TO_JSON_URL = 'https://feedtojson.vercel.app/https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest%2Fall.xml';

// Function to shuffle array and get random items
const getRandomNews = (newsArray: any[], count: number = 5) => {
  const shuffled = [...newsArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to truncate text to specified number of lines
const truncateToLines = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function CommunityScreen() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [content, setContent] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [randomizedNews, setRandomizedNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isViewingThread, setIsViewingThread] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const sidebarTranslateX = useSharedValue(-256);

  const animatedSidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarTranslateX.value }],
    };
  });

  const openSidebar = () => {
    sidebarTranslateX.value = withTiming(0);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    sidebarTranslateX.value = withTiming(-256);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!session) {
      alert('You must be logged in to delete threads');
      return;
    }

    try {
      // First check if the user owns this thread
      const { data: threadData, error: fetchError } = await supabase
        .from('threads')
        .select('user_id')
        .eq('id', threadId)
        .single();

      if (fetchError) throw fetchError;

      if (threadData.user_id !== session.user.id) {
        alert('You can only delete your own threads');
        return;
      }

      const { error } = await supabase.from('threads').delete().eq('id', threadId);
      if (error) throw error;
      await fetchThreads(session);
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread');
    }
  };

  const fetchThreads = useCallback(async (currentSession: any) => {
    try {
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .order('created_at', { ascending: false });

      if (threadsError) throw threadsError;

      if (currentSession) {
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select('thread_id')
          .in('thread_id', threadsData.map(t => t.id))
          .eq('user_id', currentSession.user.id);
        
        if (userLikesError) throw userLikesError;

        const likedThreadIds = new Set(userLikesData.map(l => l.thread_id));
        
        const threadsWithStatus = threadsData.map(t => ({
          ...t,
          isLiked: likedThreadIds.has(t.id),
          likeCount: t.likes?.length || 0,
          replyCount: t.replies?.length || 0,
        }));
        setThreads(threadsWithStatus);
      } else {
        const threadsWithCounts = threadsData.map(t => ({
          ...t,
          likeCount: t.likes?.length || 0,
          replyCount: t.replies?.length || 0,
        }));
        setThreads(threadsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  const handleLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    // Optimistic UI update
    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        const newLikeCount = isLiked ? t.likeCount - 1 : t.likeCount + 1;
        return { ...t, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return t;
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
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === threadId) {
          const revertedLikeCount = isLiked ? t.likeCount + 1 : t.likeCount - 1;
          return { ...t, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return t;
      }));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchThreads(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchThreads(session);
    });

    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch(RSS_TO_JSON_URL);
        const data = await res.json();
        if (data && data.items) {
          const transformedNews = data.items.map((item: any) => ({
            ...item,
            title: item.title || 'No title',
            description: item.description?.replace(/<[^>]*>/g, '')?.trim() || 'No description available',
            link: item.link || '#',
            pubDate: item.published || item.publishedParsed || new Date().toISOString(),
            source: { name: 'Formula 1' },
          }));
          setNews(transformedNews);
          setRandomizedNews(getRandomNews(transformedNews, 5));
        }
      } catch (e) {
        console.error('Error fetching news:', e);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads(session);
    // Randomize news on refresh
    if (news.length > 0) {
      setRandomizedNews(getRandomNews(news, 5));
    }
  }, [session, news]);

  const handleCreateThread = async () => {
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
          .from('thread-images')
          .upload(filePath, blob, {
            contentType: blob.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('thread-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('threads').insert({
        content: content.trim(),
        user_id: session.user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setContent('');
      setImage(null);
      await fetchThreads(session);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleThreadPress = (thread: any) => {
    setSelectedThread(thread);
    setIsViewingThread(true);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setIsViewingThread(false);
  };

  const SidebarContent = () => (
    <>
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
                    router.push(item.href as any);
                  }
                closeSidebar(); // Close sidebar on navigation
                }}
                className="flex-row items-center space-x-4 p-3 rounded-full hover:bg-muted"
              >
                <item.icon size={24} color="hsl(71, 35%, 45%)" />
                <Text className="text-xl font-bold text-foreground">{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-1" />
        {session ? (
          <TouchableOpacity onPress={() => setShowProfileModal(true)} className="flex-row items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <View className="flex-row items-center space-x-2 flex-1">
              <Image
                source={{ uri: session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}` }}
                className="w-8 h-8 rounded-full bg-muted"
              />
              <View className="flex-1 min-w-0">
                <Text className="font-semibold text-foreground text-sm truncate" numberOfLines={1}>
                  {session.user.user_metadata.full_name || session.user.email}
                </Text>
                <Text className="text-muted-foreground text-xs truncate" numberOfLines={1}>
                  @{session.user.user_metadata.username || session.user.email?.split('@')[0]}
                </Text>
              </View>
            </View>
            <MoreHorizontal size={16} color="hsl(var(--foreground))" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAuth(true)}
            className="bg-primary-red w-full py-3 rounded-full flex items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">Log in</Text>
          </TouchableOpacity>
        )}
    </>
  );

  return (
    <View className="w-full h-screen bg-card">
      {/* Mobile Header */}
      <View className="md:hidden flex-row items-center justify-between p-4 border-b border-border bg-card">
        <TouchableOpacity onPress={toggleSidebar}>
          <Menu size={24} color="hsl(var(--foreground))" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Community</Text>
        <View className="w-6" />{/* Spacer */}
      </View>

      <View className="flex-row flex-1 overflow-hidden">
        {/* Mobile Sidebar (Animated) */}
        {isSidebarOpen && (
          <Pressable
            className="absolute inset-0 z-10 bg-black/50 md:hidden"
            onPress={closeSidebar}
          >
            <Animated.View style={[animatedSidebarStyle, { width: 256, height: '100%' }]}>
              <Pressable className="h-full bg-card p-4" onPress={() => {}}>
                <SidebarContent />
              </Pressable>
            </Animated.View>
          </Pressable>
        )}

        {/* Desktop Sidebar */}
        <View className="hidden md:flex w-64 p-4 flex-col shrink-0">
          <SidebarContent />
        </View>

        {/* Main Content */}
        <View className="flex-1 border-x-0 md:border-x border-border">
          <ScrollView>
            <View className="flex-col lg:flex-row justify-center p-0 md:p-4">
              <View className="w-full lg:max-w-2xl">
          {isViewingThread && selectedThread ? (
            <ThreadView thread={selectedThread} onClose={handleCloseThread} session={session} />
          ) : (
                  <>
              {/* Header for "For you" / "Following" */}
                    <View className="flex-row justify-around border-b border-border p-4 bg-card">
                <Text className="text-lg font-bold text-foreground">For you</Text>
                <Text className="text-lg font-bold text-muted-foreground">Following</Text>
              </View>

                    {/* Create a new thread */}
                    <View className="p-4 border-b border-border bg-card">
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
                          <Image 
                            source={{ uri: image }} 
                            className="w-full h-48 rounded-xl" 
                            resizeMode="contain"
                            style={{ backgroundColor: '#f3f4f6' }}
                          />
                          <TouchableOpacity onPress={() => setImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                            <X size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View className="flex-row justify-between items-center mt-4">
                        <TouchableOpacity onPress={pickImage}>
                          <Camera size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCreateThread}>
                          <Text className="text-lg text-muted-foreground font-bold">Post</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                
                    {/* Threads Feed */}
                {loading ? (
                  <ActivityIndicator className="mt-8" />
                ) : (
                  threads.map((thread) => (
                        <TouchableOpacity key={thread.id} onPress={() => handleThreadPress(thread)} className="border-b border-border bg-card">
                      <PostCard
                        username={thread.profiles?.username || 'Anonymous'}
                        avatarUrl={thread.profiles?.avatar_url}
                        content={thread.content}
                        imageUrl={thread.image_url}
                        timestamp={thread.created_at}
                        likes={thread.likeCount || 0}
                        comments={thread.replyCount || 0}
                        isLiked={thread.isLiked}
                        onCommentPress={() => handleThreadPress(thread)}
                        onLikePress={() => handleLikeToggle(thread.id, thread.isLiked)}
                        onDeletePress={() => handleDeleteThread(thread.id)}
                            canDelete={session && thread.user_id === session.user.id}
                      />
                    </TouchableOpacity>
                  ))
                )}
                  </>
          )}
      </View>

              {/* Right Sidebar for News (now inside the main scroll) */}
              <View className="hidden lg:block w-80 ml-12 space-y-4 shrink-0">
                <View className="bg-muted rounded-xl">
          <View className="p-4 border-b border-border">
            <Text className="text-xl font-bold text-foreground">What's happening</Text>
          </View>
          {newsLoading ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator />
            </View>
          ) : (
                    <View style={{ padding: 16 }}>
              {randomizedNews.map((item, index) => (
                <TouchableOpacity
                  key={`${item.link}-${index}`}
                  className="mb-6 pb-4 border-b border-border/30"
                  onPress={() => {
                    if (item.link) {
                      Linking.openURL(item.link).catch(err => {
                        console.error('Failed to open link:', err);
                      });
                    }
                  }}
                >
                  <Text className="font-bold text-foreground text-base mb-2 leading-tight" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-muted-foreground text-sm leading-relaxed" numberOfLines={3}>
                    {truncateToLines(item.description, 120)}
                  </Text>
                </TouchableOpacity>
              ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
            </ScrollView>
        </View>
      </View>

      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          fetchThreads(session);
        }}
      />
      
      {session && (
        <ProfileModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          session={session}
          onLogin={() => {
            setShowProfileModal(false);
            setShowAuth(true);
          }}
        />
      )}
    </View>
  );
}