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
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import PostCard from '@/components/PostCard';
import { ThreadView } from '@/components/community/ThreadView';
import BookmarkCard from '@/components/community/BookmarkCard';

import { Home, Clapperboard, Trophy, User, Camera, X, ShoppingCart, Newspaper, MoreHorizontal, Menu, Bookmark } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileModal } from '@/components/ProfileModal';
import { OtherUserProfileModal } from '@/components/OtherUserProfileModal';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Pressable } from 'react-native';

// Wrapper to handle web compatibility for useColorScheme
function useColorScheme(): ColorSchemeName {
  const ancs = useNativeColorScheme();
  return ancs;
}

const NAV_ITEMS = [
  { href: '/', icon: Home, name: 'Home' },
  { href: '/screenings', icon: Clapperboard, name: 'Screenings' },
  { href: '/shop', icon: ShoppingCart, name: 'Shop' },
  { href: '/drivers', icon: Trophy, name: 'Drivers' },
  { href: '/news', icon: Newspaper, name: 'News' },
  { href: '/profile', icon: User, name: 'Profile' },
  { href: '/bookmarks', icon: Bookmark, name: 'Bookmarks' },
];

const RSS_TO_JSON_URL = 'https://feedtojson.vercel.app/https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest%2Fall.xml';
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

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
  const router = useRouter();
  const { thread: threadId } = useLocalSearchParams();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [content, setContent] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [randomizedNews, setRandomizedNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [isViewingThread, setIsViewingThread] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOtherUserProfileModal, setShowOtherUserProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [followingThreads, setFollowingThreads] = useState<any[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [adminUserId, setAdminUserId] = useState<string>('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [avatarCacheBust, setAvatarCacheBust] = useState<number>(Date.now());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const colorScheme = useColorScheme();
  const sidebarTranslateX = useSharedValue(-256);
  const scrollViewRef = useRef<ScrollView>(null);
  const pathname = usePathname();

  // Fetch current user's avatar URL
  const fetchCurrentUserAvatar = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();
      if (!error && data) {
        setCurrentAvatarUrl(data.avatar_url || null);
      } else {
        setCurrentAvatarUrl(null);
      }
    } catch (err) {
      setCurrentAvatarUrl(null);
      console.error('Error fetching avatar_url:', err);
    }
  }, [session]);

  // Always fetch avatar on mount and when session changes
  useEffect(() => {
    fetchCurrentUserAvatar();
  }, [session, fetchCurrentUserAvatar]);

  // Update avatar when changed in ProfileModal
  const handleAvatarUpdated = useCallback((url: string) => {
    setCurrentAvatarUrl(url);
    setAvatarCacheBust(Date.now());
    fetchCurrentUserAvatar(); // Refetch to ensure sync
  }, [fetchCurrentUserAvatar]);

  const fetchBookmarkedThreads = useCallback(async (userSession: any) => {
    if (!userSession) {
      setBookmarkedThreads([]);
      setBookmarksLoading(false);
      return;
    }

    setBookmarksLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          threads (
            *,
            profiles:user_id (username, avatar_url, favorite_team),
            likes:likes!thread_id(count),
            replies:replies!thread_id(count)
          )
        `)
        .eq('user_id', userSession.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get view counts for bookmarked threads
      const threadIds = data.map((bookmark: any) => bookmark.threads.id);
      const { data: viewCountsData, error: viewCountsError } = await supabase
        .from('thread_views')
        .select('thread_id')
        .in('thread_id', threadIds);

      if (viewCountsError) {
        console.error('Error fetching view counts for bookmarked threads:', viewCountsError);
      }

      // Create a map of thread_id to view count
      const viewCountMap = (viewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});

      // Process the data to match the expected format
      const processedThreads = data.map((bookmark: any) => {
        const thread = bookmark.threads;
        return {
          ...thread,
          likeCount: thread.likes[0]?.count || 0,
          replyCount: thread.replies[0]?.count || 0,
          view_count: viewCountMap[thread.id] || 0, // Use actual view count from thread_views table
          isLiked: false, // We'll check this separately if needed
          isBookmarked: true, // All threads in bookmarks are bookmarked
        };
      });

      setBookmarkedThreads(processedThreads);
    } catch (error) {
      console.error('Error fetching bookmarked threads:', error);
    } finally {
      setBookmarksLoading(false);
    }
  }, []);

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

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return currentUserEmail === ADMIN_EMAIL;
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

  const fetchThreads = useCallback(async (userSession: any) => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's likes and bookmarks if logged in
      let userLikes: any[] = [];
      let userBookmarks: any[] = [];
      
      if (userSession) {
        const [likesResponse, bookmarksResponse] = await Promise.all([
          supabase.from('likes').select('thread_id').eq('user_id', userSession.user.id),
          supabase.from('bookmarks').select('thread_id').eq('user_id', userSession.user.id)
        ]);
        
        userLikes = likesResponse.data || [];
        userBookmarks = bookmarksResponse.data || [];
      }

      // Get view counts for all threads
      const threadIds = data.map((thread: any) => thread.id);
      const { data: viewCountsData, error: viewCountsError } = await supabase
        .from('thread_views')
          .select('thread_id')
        .in('thread_id', threadIds);

      if (viewCountsError) {
        console.error('Error fetching view counts:', viewCountsError);
      }

      // Create a map of thread_id to view count
      const viewCountMap = (viewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});
        
      const processedThreads = data.map((thread: any) => ({
        ...thread,
        likeCount: thread.likes[0]?.count || 0,
        replyCount: thread.replies[0]?.count || 0,
        view_count: viewCountMap[thread.id] || 0, // Use actual view count from thread_views table
        isLiked: userLikes.some(like => like.thread_id === thread.id),
        isBookmarked: userBookmarks.some(bookmark => bookmark.thread_id === thread.id),
        }));

      setThreads(processedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  
  const handleLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    // Optimistic UI update for both threads and followingThreads
    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        const newLikeCount = isLiked ? t.likeCount - 1 : t.likeCount + 1;
        return { ...t, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return t;
    }));

    // Also update followingThreads state
    setFollowingThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        const newLikeCount = isLiked ? (t.likeCount || 0) - 1 : (t.likeCount || 0) + 1;
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
      // Revert optimistic update on error for both states
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === threadId) {
          const revertedLikeCount = isLiked ? t.likeCount + 1 : t.likeCount - 1;
          return { ...t, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return t;
      }));
      setFollowingThreads(prevThreads => prevThreads.map(t => {
        if (t.id === threadId) {
          const revertedLikeCount = isLiked ? (t.likeCount || 0) + 1 : (t.likeCount || 0) - 1;
          return { ...t, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return t;
      }));
    }
  };

  const handleBookmarkToggle = async (threadId: string, isBookmarked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isBookmarked: !isBookmarked } : t
    ));
    setFollowingThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isBookmarked: !isBookmarked } : t
    ));

    try {
      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().match({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      fetchThreads(session);
    }
  };

  const handleBookmarkToggleInBookmarks = async (threadId: string, isBookmarked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    // Optimistically remove the thread from bookmarked threads
    setBookmarkedThreads(prev => prev.filter(t => t.id !== threadId));

    try {
      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().match({ thread_id: threadId, user_id: session.user.id });
      if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert on error by refetching bookmarked threads
      fetchBookmarkedThreads(session);
    }
  };

  const handleThreadPress = async (thread: any) => {
    // Set thread for overlay and update URL directly to community with thread parameter
    setSelectedThread(thread);
    setIsViewingThread(true);
    
    // Mark this thread as not tracked for URL access (since it's clicked from community)
    setThreads(prev => prev.map(t => 
      t.id === thread.id ? { ...t, viewTracked: true } : t
    ));
    
    router.push(`/community?thread=${thread.id}`);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setIsViewingThread(false);
    router.push('/community');
    
    // Refresh threads to get updated view counts after thread is closed
    setTimeout(() => {
      fetchThreads(session);
    }, 500);
  };

  const handleProfilePress = (userId: string) => {
    console.log('Profile icon clicked for user:', userId, 'Current user:', session?.user?.id);
    if (userId !== session?.user?.id) {
      setSelectedUserId(userId);
      setShowOtherUserProfileModal(true);
      console.log('Opening OtherUserProfileModal for user:', userId);
    } else {
      console.log('Clicked on own profile, modal will not open.');
    }
  };

  const fetchFollowingThreads = useCallback(async (currentSession: any) => {
    if (!currentSession) {
      setFollowingThreads([]);
      setFollowingLoading(false);
      return;
    }

    setFollowingLoading(true);
    try {
      // First, get the list of users the current user is following
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentSession.user.id);

      if (followsError) throw followsError;

      // If no follows, return empty array
      if (!followsData || followsData.length === 0) {
        setFollowingThreads([]);
        setFollowingLoading(false);
        return;
      }

      // Extract the user IDs and filter out any null/undefined values just in case
      const followingUserIds = followsData.map(follow => follow.following_id).filter(Boolean);

      // Bail out early if there are no valid user IDs to query
      if (followingUserIds.length === 0) {
        setFollowingThreads([]);
        setFollowingLoading(false);
        return;
      }

      const { data: threadsData, error } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            favorite_team
          ),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .in('user_id', followingUserIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get view counts for these threads
      const threadIds = threadsData.map((thread: any) => thread.id);
      const { data: viewCountsData, error: viewCountsError } = await supabase
        .from('thread_views')
        .select('thread_id')
        .in('thread_id', threadIds);

      if (viewCountsError) {
        console.error('Error fetching view counts for following threads:', viewCountsError);
      }

      // Create a map of thread_id to view count
      const viewCountMap = (viewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});

      // Get user's likes for these threads
      const { data: userLikesData, error: userLikesError } = await supabase
        .from('likes')
        .select('thread_id')
        .in('thread_id', threadsData.map(t => t.id))
        .eq('user_id', currentSession.user.id);
      
      if (userLikesError) throw userLikesError;

      const likedThreadIds = new Set(userLikesData.map(l => l.thread_id));

      // Get user's bookmarks for these threads
      const { data: userBookmarksData, error: userBookmarksError } = await supabase
        .from('bookmarks')
        .select('thread_id')
        .in('thread_id', threadsData.map(t => t.id))
        .eq('user_id', currentSession.user.id);
      if (userBookmarksError) throw userBookmarksError;
      const bookmarkedThreadIds = new Set(userBookmarksData.map(b => b.thread_id));

      // Transform the data to match the expected format with correct counts
      const transformedThreads = threadsData.map((item: any) => ({
        ...item,
        isLiked: likedThreadIds.has(item.id),
        isBookmarked: bookmarkedThreadIds.has(item.id),
        likeCount: item.likes[0]?.count || 0,
        replyCount: item.replies[0]?.count || 0,
        view_count: viewCountMap[item.id] || 0, // Use actual view count from thread_views table
      }));

      setFollowingThreads(transformedThreads);
    } catch (error) {
      console.error('Error fetching following threads:', error);
      setFollowingThreads([]);
    } finally {
      setFollowingLoading(false);
    }
  }, []);

  const handleTabPress = (tab: 'foryou' | 'following') => {
    setActiveTab(tab);
    if (tab === 'following' && session) {
      fetchFollowingThreads(session);
    }
  };

  const SidebarContent = () => (
    <View style={{ flex: 1 }}>
      <View>
        <View className="px-3 mb-6">
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }} selectable={false}>projectF1</Text>
        </View>
        <View style={{ gap: 12 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === '/bookmarks' && showBookmarks);
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => {
                  if (item.href === '/bookmarks') {
                    setShowBookmarks(true);
                    setIsViewingThread(false);
                    setSelectedThread(null);
                    fetchBookmarkedThreads(session);
                  } else if (item.href === '/profile') {
                    if (session) {
                      setShowProfileModal(true);
                    } else {
                      setShowAuth(true);
                    }
                  } else {
                    router.push(item.href as any);
                  }
                  closeSidebar();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 9999,
                  backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                }}
                className="space-x-4 hover:bg-muted"
              >
                <item.icon size={20} color="#8b7300" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }} selectable={false}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
          </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#dc2626',
            borderRadius: 9999,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: 20,
            marginBottom: 0,
            shadowColor: '#dc2626',
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
          activeOpacity={0.85}
          onPress={() => setShowPostModal(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        // Set admin user ID if current user is admin
        if (session.user.email === ADMIN_EMAIL) {
          setAdminUserId(session.user.id);
        }
      }
      fetchThreads(session);
      // Load admin users from database
      loadAdminUsers();
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        // Set admin user ID if current user is admin
        if (session.user.email === ADMIN_EMAIL) {
          setAdminUserId(session.user.id);
        }
      }
      fetchThreads(session);
      // Load admin users from database
      loadAdminUsers();
    });

    // Fetch news from RSS feed
    fetchNews();



        // Simple text selection prevention that doesn't interfere with inputs
    const preventTextSelection = (e: Event) => {
      const target = e.target as Element | null;
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }
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
    
    return () => {
      document.removeEventListener('selectstart', preventTextSelection);
    };


  }, [fetchNews]);

  // Handle thread parameter from URL
  useEffect(() => {
    if (threadId && typeof threadId === 'string') {
      // Find the thread in the current threads list
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        setIsViewingThread(true);
        
        // Track view when thread is opened via URL (direct access)
        if (session && !thread.viewTracked) {
          const trackView = async () => {
            try {
              await supabase.from('thread_views').insert({
                thread_id: threadId,
                user_id: session.user.id
              });
              
              // Mark as tracked to prevent duplicate tracking
              setThreads(prev => prev.map(t => 
                t.id === threadId ? { ...t, viewTracked: true } : t
              ));
            } catch (error) {
              console.error('Error tracking view:', error);
            }
          };
          
          trackView();
        }
      }
    }
  }, [threadId, threads, session]);

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

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
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
            <ThreadView thread={selectedThread} onClose={handleCloseThread} session={session} onProfilePress={handleProfilePress} />
                ) : showBookmarks ? (
                  // Bookmarks Container
                  <View style={{ backgroundColor: '#ffffff' }}>
                    {/* Bookmarks Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: 16, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#e5e5e5',
                      backgroundColor: '#ffffff'
                    }}>
                      <TouchableOpacity onPress={() => setShowBookmarks(false)}>
                        <X size={24} color="#dc2626" />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3a3a3a' }}>Bookmarks</Text>
                      <View style={{ width: 24 }} />
                    </View>

                    {/* Bookmarks Content */}
                    {!session ? (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 200 }}>
                        <Text style={{ fontSize: 18, textAlign: 'center', color: '#666666', marginBottom: 20 }}>
                          Sign in to view your bookmarked threads
                        </Text>
                        <TouchableOpacity 
                          onPress={() => setShowAuth(true)}
                          style={{ backgroundColor: '#dc2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
                        >
                          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Sign In</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        {bookmarksLoading ? (
                          <ActivityIndicator style={{ marginTop: 32 }} />
                        ) : bookmarkedThreads.length === 0 ? (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 200 }}>
                            <Text style={{ fontSize: 18, textAlign: 'center', color: '#666666' }}>
                              No bookmarked threads yet.
                            </Text>
                            <Text style={{ fontSize: 14, textAlign: 'center', color: '#999999', marginTop: 8 }}>
                              Tap the bookmark icon on any thread to save it here.
                            </Text>
                          </View>
                        ) : (
                          bookmarkedThreads.map((thread) => (
                            <BookmarkCard
                              key={thread.id}
                              username={thread.profiles?.username || 'Anonymous'}
                              avatarUrl={thread.profiles?.avatar_url}
                              content={thread.content}
                              imageUrl={thread.image_url}
                              timestamp={thread.created_at}
                              favoriteTeam={thread.profiles?.favorite_team}
                              isAdmin={isUserAdmin(thread.user_id)}
                              onBookmarkPress={() => handleBookmarkToggleInBookmarks(thread.id, thread.isBookmarked)}
                              onThreadPress={() => handleThreadPress(thread)}
                            />
                          ))
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  // Regular Threads Container
                  <>
              {/* Header for "For you" / "Following" */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#9ca3af', padding: 16, backgroundColor: '#ffffff' }}>
                <TouchableOpacity onPress={() => handleTabPress('foryou')} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold', 
                    color: activeTab === 'foryou' ? '#000000' : '#505050' 
                  }} selectable={false}>For you</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('following')} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold', 
                    color: activeTab === 'following' ? '#000000' : '#505050' 
                  }} selectable={false}>Following</Text>
                </TouchableOpacity>
              </View>

                    {/* Create a new thread */}
                    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                  <View className="flex-row space-x-4">
                    <Image
                      source={{
                        uri:
                          currentAvatarUrl ||
                          `https://ui-avatars.com/api/?name=${session?.user?.user_metadata?.username?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}&background=f5f5f5&color=666`
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#f5f5f5',
                        borderWidth: 1,
                        borderColor: '#e5e5e5',
                      }}
                      alt="Your avatar"
                    />
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
                            backgroundColor: 'transparent',
                              borderWidth: 1,
                              borderColor: '#e5e5e5',
                              borderRadius: 8,
                              outline: 'none',
                              boxShadow: 'none',
                              minHeight: 40,
                              maxHeight: 120,
                              padding: 8,
                            } as any}
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
                                style={{ backgroundColor: 'transparent' }}
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
                {activeTab === 'foryou' ? (
                  loading ? (
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
                          views={thread.view_count || 0}
                          isLiked={thread.isLiked}
                          isBookmarked={thread.isBookmarked}
                          favoriteTeam={thread.profiles?.favorite_team}
                          userId={thread.user_id}
                          onCommentPress={() => handleThreadPress(thread)}
                          onLikePress={() => handleLikeToggle(thread.id, thread.isLiked)}
                          onBookmarkPress={() => handleBookmarkToggle(thread.id, thread.isBookmarked)}
                          onDeletePress={() => handleDeleteThread(thread.id)}
                          onProfilePress={(userId) => {
                            console.log('PostCard onProfilePress called with userId:', userId);
                            handleProfilePress(userId);
                          }}
                          canDelete={session && thread.user_id === session.user.id}
                          canAdminDelete={isCurrentUserAdmin()}
                          isAdmin={isUserAdmin(thread.user_id)}
                          showReadMore={true}
                        />
                      </TouchableOpacity>
                    ))
                  )
                ) : (
                  // Following tab
                  followingLoading ? (
                    <ActivityIndicator className="mt-8" />
                  ) : followingThreads.length > 0 ? (
                    followingThreads.map((thread) => (
                      <TouchableOpacity key={thread.id} onPress={() => handleThreadPress(thread)} style={{ borderBottomWidth: 1, borderBottomColor: '#9ca3af', backgroundColor: '#ffffff' }}>
                        <PostCard
                          username={thread.profiles?.username || 'Anonymous'}
                          avatarUrl={thread.profiles?.avatar_url}
                          content={thread.content}
                          imageUrl={thread.image_url}
                          timestamp={thread.created_at}
                          likes={thread.likeCount || 0}
                          comments={thread.replyCount || 0}
                          views={thread.view_count || 0}
                          isLiked={thread.isLiked}
                          isBookmarked={thread.isBookmarked}
                          favoriteTeam={thread.profiles?.favorite_team}
                          userId={thread.user_id}
                          onCommentPress={() => handleThreadPress(thread)}
                          onLikePress={() => handleLikeToggle(thread.id, thread.isLiked)}
                          onBookmarkPress={() => handleBookmarkToggle(thread.id, thread.isBookmarked)}
                          onDeletePress={() => handleDeleteThread(thread.id)}
                          onProfilePress={(userId) => {
                            console.log('PostCard onProfilePress called with userId (Following tab):', userId);
                            handleProfilePress(userId);
                          }}
                          canDelete={session && thread.user_id === session.user.id}
                          canAdminDelete={isCurrentUserAdmin()}
                          isAdmin={isUserAdmin(thread.user_id)}
                          showReadMore={true}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, color: '#505050', textAlign: 'center' }} selectable={false}>
                        No posts from people you follow yet.{'\n'}Follow some users to see their posts here!
                      </Text>
                    </View>
                  )
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
          onAvatarChange={handleAvatarUpdated}
        />
      )}

      {session && selectedUserId && (
        <OtherUserProfileModal
          isVisible={showOtherUserProfileModal}
          onClose={() => {
            setShowOtherUserProfileModal(false);
            setSelectedUserId('');
          }}
          userId={selectedUserId}
          currentUserId={session.user.id}
        />
      )}

      {/* Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <View style={{ width: '90%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, alignItems: 'stretch', position: 'relative' }}>
            {/* Close Button */}
            <TouchableOpacity onPress={() => setShowPostModal(false)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <X size={28} color="#dc2626" />
            </TouchableOpacity>
            {/* Post Input */}
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 16, textAlign: 'center' }}>Create Post</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              {currentAvatarUrl || session?.user?.user_metadata?.avatar_url ? (
                <Image
                  source={{
                    uri: currentAvatarUrl || session?.user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${session?.user?.user_metadata?.username?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}&background=f5f5f5&color=666`
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#f5f5f5',
                    borderWidth: 1,
                    borderColor: '#e5e5e5',
                  }}
                  alt="Your avatar"
                />
              ) : (
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${session?.user?.user_metadata?.username?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}&background=f5f5f5&color=666`
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#f5f5f5',
                    borderWidth: 1,
                    borderColor: '#e5e5e5',
                  }}
                  alt="Your avatar"
                />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
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
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    outlineStyle: 'none',
                    outlineWidth: 0,
                    outlineColor: 'transparent',
                    borderColor: 'transparent',
                    minHeight: 40,
                    maxHeight: 120,
                  } as any}
                  value={content}
                  onChangeText={setContent}
                  multiline
                />
                {image && (
                  <View style={{ position: 'relative', marginTop: 8 }}>
                    <Image
                      source={{ uri: image }}
                      style={{ width: '100%', height: 180, borderRadius: 12, backgroundColor: '#f3f4f6' }}
                      resizeMode="contain"
                    />
                    <TouchableOpacity onPress={() => setImage(null)} style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#000', opacity: 0.7, borderRadius: 16, padding: 4 }}>
                      <X size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <TouchableOpacity onPress={pickImage}>
                <Camera size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await handleCreateThread();
                  setShowPostModal(false);
                }}
                style={{ backgroundColor: '#dc2626', borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#dc2626', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
                disabled={!content.trim() && !image}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, opacity: (!content.trim() && !image) ? 0.5 : 1 }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}