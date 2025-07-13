import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch news from RSS feed
  const fetchNews = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

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
    try {
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
          profiles:user_id (username, avatar_url, favorite_team),
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
          likeCount: t.likes[0]?.count || 0,
          replyCount: t.replies[0]?.count || 0,
        }));
        setThreads(threadsWithStatus);
      } else {
        const threadsWithCounts = threadsData.map(t => ({
          ...t,
          likeCount: t.likes[0]?.count || 0,
          replyCount: t.replies[0]?.count || 0,
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

  const fetchSpecificThread = useCallback(async (threadId: string) => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Check if user liked this thread
      let isLiked = false;
      if (currentSession) {
        const { data: userLikeData, error: userLikeError } = await supabase
          .from('likes')
          .select('thread_id')
          .eq('thread_id', threadId)
          .eq('user_id', currentSession.user.id)
          .single();

        if (!userLikeError && userLikeData) {
          isLiked = true;
        }
      }

      const threadWithStatus = {
        ...threadData,
        isLiked,
        likeCount: threadData.likes[0]?.count || 0,
        replyCount: threadData.replies[0]?.count || 0,
      };

      setSelectedThread(threadWithStatus);
      setIsViewingThread(true);
    } catch (error) {
      console.error('Error fetching specific thread:', error);
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

    // Fetch news from RSS feed
    fetchNews();

    // Check if URL contains thread ID on page load
    const currentPath = window.location.pathname;
    const threadIdMatch = currentPath.match(/\/thread\/([^\/]+)/);
    if (threadIdMatch) {
      const threadId = threadIdMatch[1];
      // Fetch the specific thread
      fetchSpecificThread(threadId);
    }

    // Handle browser back button
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const threadIdMatch = currentPath.match(/\/thread\/([^\/]+)/);
      if (threadIdMatch) {
        const threadId = threadIdMatch[1];
        fetchSpecificThread(threadId);
      } else {
        setSelectedThread(null);
        setIsViewingThread(false);
      }
    };

        // Simple text selection prevention that doesn't interfere with inputs
    const preventTextSelection = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Always allow selection in input elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
          target.hasAttribute('contenteditable') || target.closest('input, textarea')) {
        return;
      }
      
      // Only prevent text selection, not other interactions
      if (e.type === 'selectstart') {
        e.preventDefault();
        return false;
      }
    };

    // Add minimal event listeners
    document.addEventListener('selectstart', preventTextSelection, { passive: false });

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('selectstart', preventTextSelection);
    };


  }, [fetchNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads(session);
    // Refresh news on refresh
    fetchNews();
  }, [session, fetchNews]);

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
    // Update URL with thread ID without navigating
    window.history.pushState({}, '', `/thread/${thread.id}`);
    // Scroll to top when opening thread
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setIsViewingThread(false);
    // Update URL back to community
    window.history.pushState({}, '', '/community');
  };

  const SidebarContent = () => (
    <>
        <View>
          <View className="px-3 mb-4">
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }} selectable={false}>projectF1</Text>
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
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 9999 }}
                className="space-x-4 hover:bg-muted"
              >
                <item.icon size={24} color="#8b7300" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }} selectable={false}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-1" />
        {session ? (
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8 }} className="hover:bg-muted/50">
            <View className="flex-row items-center space-x-2 flex-1">
              <Image
                source={{ uri: session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}` }}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5' }}
              />
              <View className="flex-1 min-w-0">
                <Text style={{ fontWeight: '600', color: '#000000', fontSize: 14 }} numberOfLines={1} selectable={false}>
                  {session.user.user_metadata.full_name || session.user.email}
                </Text>
                <Text style={{ color: '#505050', fontSize: 12 }} numberOfLines={1} selectable={false}>
                  @{session.user.user_metadata.username || session.user.email?.split('@')[0]}
                </Text>
              </View>
            </View>
            <MoreHorizontal size={16} color="#000000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAuth(true)}
            style={{ backgroundColor: '#dc2626', width: '100%', paddingVertical: 12, borderRadius: 9999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }} selectable={false}>Log in</Text>
          </TouchableOpacity>
        )}
    </>
  );

  return (
    <View style={{ width: '100%', height: '100vh', backgroundColor: '#ffffff' }}>
      {/* Mobile Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#ffffff' }} className="md:hidden">
        <TouchableOpacity onPress={toggleSidebar}>
          <Menu size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }} selectable={false}>Community</Text>
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
              <Pressable style={{ height: '100%', backgroundColor: '#ffffff', padding: 16 }} onPress={() => {}}>
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
        <View style={{ flex: 1, borderLeftWidth: 0, borderRightWidth: 0, borderLeftColor: '#e5e5e5', borderRightColor: '#e5e5e5' }} className="md:border-x">
          <ScrollView ref={scrollViewRef}>
            <View className="flex-col lg:flex-row justify-center p-0 md:p-4">
              <View className="w-full lg:max-w-2xl">
          {isViewingThread && selectedThread ? (
            <ThreadView thread={selectedThread} onClose={handleCloseThread} session={session} />
          ) : (
                  <>
              {/* Header for "For you" / "Following" */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#9ca3af', padding: 16, backgroundColor: '#ffffff' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} selectable={false}>For you</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#505050' }} selectable={false}>Following</Text>
              </View>

                    {/* Create a new thread */}
                    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                  <View className="flex-row space-x-4">
                    <User size={40} color="gray" />
                    <View className="flex-1">
                      <TextInput
                        placeholder="What's happening?"
                        placeholderTextColor="gray"
                        style={{
                          fontSize: 18,
                          color: '#000000',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          cursor: 'text',
                          pointerEvents: 'auto',
                          caretColor: 'auto',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                        }}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        selectable={true}
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
                          <Text style={{ fontSize: 18, color: '#dc2626', fontWeight: 'bold' }} selectable={false}>Post</Text>
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
                        <TouchableOpacity key={thread.id} onPress={() => handleThreadPress(thread)} style={{ borderBottomWidth: 1, borderBottomColor: '#9ca3af', backgroundColor: '#ffffff' }}>
                      <PostCard
                        username={thread.profiles?.username || 'Anonymous'}
                        avatarUrl={thread.profiles?.avatar_url}
                        content={thread.content}
                        imageUrl={thread.image_url}
                        timestamp={thread.created_at}
                        likes={thread.likeCount || 0}
                        comments={thread.replyCount || 0}
                        isLiked={thread.isLiked}
                        favoriteTeam={thread.profiles?.favorite_team}
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
            <Text className="text-xl font-bold text-foreground" selectable={false}>What's happening</Text>
          </View>
          {newsLoading ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator />
            </View>
          ) : (
                    <View style={{ padding: 16 }}>
              {randomizedNews.map((item, index) => (
                <TouchableOpacity
                  key={`${item.title}-${index}`}
                  className="mb-6 pb-4 border-b border-border/30"
                  onPress={() => Linking.openURL(item.link)}
                >
                  <Text className="font-bold text-foreground text-base mb-2 leading-tight" numberOfLines={2} selectable={false}>
                    {item.title}
                  </Text>
                  <Text className="text-muted-foreground text-sm leading-relaxed" numberOfLines={3} selectable={false}>
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