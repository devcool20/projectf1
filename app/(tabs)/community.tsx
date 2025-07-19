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
  Alert,
  Dimensions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { formatThreadTimestamp } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import PostCard from '@/components/PostCard';
import { ThreadView } from '@/components/community/ThreadView';
import BookmarkCard from '@/components/community/BookmarkCard';
import RepostModal from '@/components/RepostModal';


import { Home, Clapperboard, Trophy, User, Camera, X, ShoppingCart, Newspaper, MoreHorizontal, Menu, Bookmark, Heart, MessageCircle, Repeat2, BarChart3, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileModal } from '@/components/ProfileModal';
import { OtherUserProfileModal } from '@/components/OtherUserProfileModal';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import ProfileContainer from '@/components/profile/ProfileContainer';

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
  'FIA': require('@/team-logos/fia.png'), // Admin-only team
};

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

// Helper function to calculate responsive image dimensions
const getResponsiveImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // More aggressive margin for very narrow screens
    const responsiveWidth = screenWidth - 120; // 60px margin each side
    const responsiveHeight = (responsiveWidth * 200) / 280;
    return {
      width: responsiveWidth,
      height: responsiveHeight,
      borderRadius: 12,
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 280,
    height: 200,
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: '#f3f4f6'
  };
};

// Helper function to calculate compact image dimensions for preview content
const getCompactImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // More compact for preview images on narrow screens
    const compactWidth = screenWidth - 160; // 80px margin each side
    const compactHeight = (compactWidth * 150) / 200; // Shorter height ratio
    return {
      width: compactWidth,
      height: compactHeight,
      borderRadius: 8, // Smaller border radius for compact look
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 200, // Smaller default width for preview images
    height: 150, // Smaller default height for preview images
    borderRadius: 8, // Smaller border radius for compact look
    marginTop: 4,
    backgroundColor: '#f3f4f6'
  };
};

export default function CommunityScreen() {
  const router = useRouter();
  const { thread: threadId, profile: profileId } = useLocalSearchParams();
  const { width: screenWidth } = Dimensions.get('window');
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
  const [repostDeleteMenuVisible, setRepostDeleteMenuVisible] = useState(false);
  const [selectedRepostForDelete, setSelectedRepostForDelete] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const sidebarTranslateX = useSharedValue(-256);
  const scrollViewRef = useRef<ScrollView>(null);
  const pathname = usePathname();
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [selectedThreadForRepost, setSelectedThreadForRepost] = useState<any>(null);


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
      // Fetch bookmarked threads
      const { data: threadBookmarks, error: threadBookmarksError } = await supabase
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
        .not('thread_id', 'is', null)
        .order('created_at', { ascending: false });

      if (threadBookmarksError) throw threadBookmarksError;

      // Fetch bookmarked reposts
      const { data: repostBookmarks, error: repostBookmarksError } = await supabase
        .from('bookmarks')
        .select(`
          *,
          reposts (
            *,
            profiles:user_id (username, avatar_url, favorite_team),
            original_thread:original_thread_id (
              *,
              profiles:user_id (username, avatar_url, favorite_team)
            )
          )
        `)
        .eq('user_id', userSession.user.id)
        .not('repost_id', 'is', null)
        .order('created_at', { ascending: false });

      if (repostBookmarksError) {
        console.error('Error fetching bookmarked reposts:', repostBookmarksError);
      }

      // Get view counts for bookmarked threads
      const threadIds = (threadBookmarks || []).map((bookmark: any) => bookmark.threads.id);
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

      // Process bookmarked threads
      const processedThreads = (threadBookmarks || []).map((bookmark: any) => {
        const thread = bookmark.threads;
        return {
          ...thread,
          type: 'thread',
          likeCount: thread.likes[0]?.count || 0,
          replyCount: thread.replies[0]?.count || 0,
          view_count: viewCountMap[thread.id] || 0,
          isLiked: false,
          isBookmarked: true,
        };
      });

      // Process bookmarked reposts
      const processedReposts = (repostBookmarks || []).map((bookmark: any) => {
        const repost = bookmark.reposts;
        return {
          ...repost,
          type: 'repost',
          id: repost.id,
          content: repost.content,
          user_id: repost.user_id,
          profiles: repost.profiles,
          created_at: repost.created_at,
          likeCount: 0, // Will be fetched separately
          replyCount: 0, // Will be fetched separately
          view_count: 0, // Will be fetched separately
          repostCount: 0, // Will be fetched separately
          isLiked: false,
          isBookmarked: true,
          original_thread: repost.original_thread,
        };
      });

      // Get engagement metrics for reposts
      const repostIds = processedReposts.map(r => r.id);
      if (repostIds.length > 0) {
        const [repostLikesData, repostRepostsData, repostReplyCountsData] = await Promise.all([
          supabase.from('likes').select('repost_id, user_id').in('repost_id', repostIds),
          supabase.from('reposts').select('original_thread_id').in('original_thread_id', repostIds),
          supabase.from('repost_replies').select('repost_id').in('repost_id', repostIds)
        ]);

        const repostLikeCountMap = (repostLikesData.data || []).reduce((acc: any, like) => {
          acc[like.repost_id] = (acc[like.repost_id] || 0) + 1;
          return acc;
        }, {});

        const repostRepostCountMap = (repostRepostsData.data || []).reduce((acc: any, repost) => {
          acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
          return acc;
        }, {});

        const repostReplyCountMap = (repostReplyCountsData.data || []).reduce((acc: any, reply) => {
          acc[reply.repost_id] = (acc[reply.repost_id] || 0) + 1;
          return acc;
        }, {});

        // Update reposts with engagement metrics
        processedReposts.forEach(repost => {
          repost.likeCount = repostLikeCountMap[repost.id] || 0;
          repost.repostCount = repostRepostCountMap[repost.id] || 0;
          repost.replyCount = repostReplyCountMap[repost.id] || 0;
        });
      }

      // Combine and sort by creation date
      const combinedBookmarks = [...processedThreads, ...processedReposts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setBookmarkedThreads(combinedBookmarks);
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

  const handleDeleteThread = async (threadId: string, threadType?: string) => {
    try {
      if (threadType === 'repost') {
        const { error } = await supabase.from('reposts').delete().eq('id', threadId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('threads').delete().eq('id', threadId);
        if (error) throw error;
      }
      await fetchThreads(session);
      await fetchFollowingThreads(session);
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread');
    }
  };

  const fetchThreads = useCallback(async (userSession: any) => {
    try {
      // Fetch regular threads
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

      // Fetch reposts with separate queries to avoid foreign key issues
      const { data: repostsData, error: repostsError } = await supabase
        .from('reposts')
        .select('*')
        .order('created_at', { ascending: false });

      if (repostsError) {
        console.error('Error fetching reposts:', repostsError);
      }

      // Get user profiles for reposts
      const repostUserIds = [...new Set((repostsData || []).map(r => r.user_id))];
      const { data: repostProfilesData, error: repostProfilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, favorite_team')
        .in('id', repostUserIds);

      if (repostProfilesError) {
        console.error('Error fetching repost profiles:', repostProfilesError);
      }

      // Get original threads for reposts
      const repostThreadIds = [...new Set((repostsData || []).map(r => r.original_thread_id))];
      const { data: repostThreadsData, error: repostThreadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team)
        `)
        .in('id', repostThreadIds);

      if (repostThreadsError) {
        console.error('Error fetching repost threads:', repostThreadsError);
      }

      // Combine repost data
      const repostProfilesMap = (repostProfilesData || []).reduce((acc: any, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      const repostThreadsMap = (repostThreadsData || []).reduce((acc: any, thread) => {
        acc[thread.id] = thread;
        return acc;
      }, {});

      const combinedRepostsData = (repostsData || []).map(repost => ({
        ...repost,
        profiles: repostProfilesMap[repost.user_id],
        original_thread: repostThreadsMap[repost.original_thread_id]
      }));

      // Debug: Log repost data to see what's being fetched
      if (combinedRepostsData.length > 0) {
        const sampleRepost = combinedRepostsData[0];
        console.log('DEBUG - Repost data:', {
          id: sampleRepost.id,
          original_thread_id: sampleRepost.original_thread_id,
          original_thread_exists: !!sampleRepost.original_thread,
          original_thread_image: sampleRepost.original_thread?.image_url,
          original_thread_content: sampleRepost.original_thread?.content,
          repostThreadsMap_keys: Object.keys(repostThreadsMap),
          repostThreadsData_length: repostThreadsData?.length
        });
      }

      // Get user's likes and bookmarks if logged in
      let userLikes: any[] = [];
      let userBookmarks: any[] = [];
      
      if (userSession) {
        const [likesResponse, bookmarksResponse] = await Promise.all([
          supabase.from('likes').select('thread_id, repost_id').eq('user_id', userSession.user.id),
          supabase.from('bookmarks').select('thread_id').eq('user_id', userSession.user.id)
        ]);
        
        userLikes = likesResponse.data || [];
        userBookmarks = bookmarksResponse.data || [];
      }

      // Get view counts for all threads
      const threadIds = threadsData.map((thread: any) => thread.id);
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
        
      // Get repost counts for threads
      const { data: repostCountsData, error: repostCountsError } = await supabase
        .from('reposts')
        .select('original_thread_id')
        .in('original_thread_id', threadsData.map(t => t.id));

      if (repostCountsError) {
        console.error('Error fetching repost counts:', repostCountsError);
      }

      // Create a map of thread_id to repost count
      const repostCountMap = (repostCountsData || []).reduce((acc: any, repost: any) => {
        acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
        return acc;
      }, {});

      // Process regular threads
      const processedThreads = threadsData.map((thread: any) => ({
        ...thread,
        type: 'thread',
        likeCount: thread.likes[0]?.count || 0,
        replyCount: thread.replies[0]?.count || 0,
        repostCount: repostCountMap[thread.id] || 0,
        view_count: viewCountMap[thread.id] || 0,
        isLiked: userLikes.some(like => like.thread_id === thread.id),
        isBookmarked: userBookmarks.some(bookmark => bookmark.thread_id === thread.id),
      }));

      // Get repost engagement metrics
      const repostIds = combinedRepostsData.map(r => r.id);
      const [repostLikesData, repostRepostsData] = await Promise.all([
        supabase.from('likes').select('repost_id, user_id').in('repost_id', repostIds),
        supabase.from('reposts').select('original_thread_id').in('original_thread_id', repostIds)
      ]);

      // Create maps for repost engagement
      const repostLikeCountMap = (repostLikesData.data || []).reduce((acc: any, like) => {
        acc[like.repost_id] = (acc[like.repost_id] || 0) + 1;
        return acc;
      }, {});

      const repostRepostCountMap = (repostRepostsData.data || []).reduce((acc: any, repost) => {
        acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
        return acc;
      }, {});

      // Get view counts for reposts (using original thread view counts for now)
      const repostOriginalThreadIds = combinedRepostsData.map(r => r.original_thread_id);
      const { data: repostViewCountsData, error: repostViewCountsError } = await supabase
        .from('thread_views')
        .select('thread_id')
        .in('thread_id', repostOriginalThreadIds);

      // For now, let's give reposts a base view count to make them look more realistic
      // In a real implementation, you would create a repost_views table

      if (repostViewCountsError) {
        console.error('Error fetching repost view counts:', repostViewCountsError);
      }

      // Create a map of thread_id to view count for reposts (using original thread IDs)
      const repostViewCountMap = (repostViewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});

      // Get reply counts for reposts (reposts can have their own replies)
      const { data: repostReplyCountsData, error: repostReplyCountsError } = await supabase
        .from('repost_replies')
        .select('repost_id')
        .in('repost_id', repostIds);

      if (repostReplyCountsError) {
        console.error('Error fetching repost reply counts:', repostReplyCountsError);
      }

      // Create a map of repost_id to reply count for reposts
      const repostReplyCountMap = (repostReplyCountsData || []).reduce((acc: any, reply: any) => {
        acc[reply.repost_id] = (acc[reply.repost_id] || 0) + 1;
        return acc;
      }, {});

      // Get bookmarks for reposts
      const repostBookmarks = userBookmarks.filter(bookmark => 
        combinedRepostsData.some(repost => repost.id === bookmark.thread_id)
      );

      // Process reposts with their own engagement metrics
      const processedReposts = combinedRepostsData.map((repost: any) => ({
          ...repost,
          type: 'repost',
          id: repost.id, // Use repost ID for unique identification
          content: repost.content,
          user_id: repost.user_id,
          profiles: repost.profiles,
          created_at: repost.created_at,
          likeCount: repostLikeCountMap[repost.id] || 0, // Likes on this repost
          replyCount: repostReplyCountMap[repost.id] || 0, // Replies on this repost
          view_count: Math.max(repostViewCountMap[repost.original_thread_id] || 0, 1), // Views on original thread (minimum 1)
          repostCount: repostRepostCountMap[repost.id] || 0, // How many times this repost has been reposted
          isLiked: userLikes.some((like: any) => like.repost_id === repost.id),
          isBookmarked: userBookmarks.some(bookmark => bookmark.thread_id === repost.id),
          original_thread: repost.original_thread,
      }));

      // Combine threads and reposts, sort by creation date
      const combinedFeed = [...processedThreads, ...processedReposts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


      

      


      setThreads(combinedFeed);
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

    // Find if this is a repost or thread
    const thread = threads.find(t => t.id === threadId);
    const followingThread = followingThreads.find(t => t.id === threadId);
    const isRepost = thread?.type === 'repost' || followingThread?.type === 'repost';

    // Optimistic UI update for both threads and followingThreads
    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        const newLikeCount = isLiked ? (t.likeCount || 0) - 1 : (t.likeCount || 0) + 1;
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
        if (isRepost) {
          const { error } = await supabase.from('likes').delete().match({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
          if (error) throw error;
        }
      } else {
        if (isRepost) {
          const { error } = await supabase.from('likes').insert({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
          if (error) throw error;
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error for both states
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === threadId) {
          const revertedLikeCount = isLiked ? (t.likeCount || 0) + 1 : (t.likeCount || 0) - 1;
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

    // Find if this is a repost or thread
    const thread = threads.find(t => t.id === threadId);
    const followingThread = followingThreads.find(t => t.id === threadId);
    const isRepost = thread?.type === 'repost' || followingThread?.type === 'repost';

    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isBookmarked: !isBookmarked } : t
    ));
    setFollowingThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isBookmarked: !isBookmarked } : t
    ));

    try {
      if (isBookmarked) {
        if (isRepost) {
          const { error } = await supabase.from('bookmarks').delete().match({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
        } else {
        const { error } = await supabase.from('bookmarks').delete().match({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
        }
      } else {
        if (isRepost) {
          const { error } = await supabase.from('bookmarks').insert({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
        }
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

    // Find if this is a repost or thread
    const bookmarkedItem = bookmarkedThreads.find(t => t.id === threadId);
    const isRepost = bookmarkedItem?.type === 'repost';

    // Optimistically remove the thread from bookmarked threads
    setBookmarkedThreads(prev => prev.filter(t => t.id !== threadId));

    try {
      if (isBookmarked) {
        if (isRepost) {
          const { error } = await supabase.from('bookmarks').delete().match({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
        } else {
        const { error } = await supabase.from('bookmarks').delete().match({ thread_id: threadId, user_id: session.user.id });
      if (error) throw error;
        }
      } else {
        if (isRepost) {
          const { error } = await supabase.from('bookmarks').insert({ repost_id: threadId, user_id: session.user.id });
          if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
        }
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

  const handleThreadIdPress = async (threadId: string) => {
    // This function is used when we only have a thread ID (like from repost original thread)
    // We need to fetch the thread data first, then navigate to it
    try {
      const { data: threadData, error } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .eq('id', threadId)
        .single();

      if (error) throw error;

      // Check if user liked this thread
      let isLiked = false;
      if (session) {
        const { data: userLikeData } = await supabase
          .from('likes')
          .select('thread_id')
          .eq('thread_id', threadId)
          .eq('user_id', session.user.id)
          .single();

        isLiked = !!userLikeData;
      }

      // Check if user bookmarked this thread
      let isBookmarked = false;
      if (session) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('thread_id')
          .eq('thread_id', threadId)
          .eq('user_id', session.user.id)
          .single();

        isBookmarked = !!bookmarkData;
      }

      const threadWithStatus = {
        ...threadData,
        isLiked,
        isBookmarked,
        likeCount: threadData.likes[0]?.count || 0,
        replyCount: threadData.replies[0]?.count || 0,
        type: 'thread'
      };

      // Navigate to the thread
      setSelectedThread(threadWithStatus);
      setIsViewingThread(true);
      router.push(`/community?thread=${threadId}`);
    } catch (error) {
      console.error('Error fetching thread for navigation:', error);
      // Fallback: just navigate to the thread URL
      router.push(`/community?thread=${threadId}`);
    }
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

  const handleCloseProfile = () => {
    setIsViewingProfile(false);
    setSelectedProfile(null);
    // Update URL to remove profile parameter
    router.push('/community');
  };

  const handleProfilePress = (userId: string) => {
    console.log('Profile icon clicked for user:', userId, 'Current user:', session?.user?.id);
    // Show profile as overlay within the community layout
    setSelectedProfile({ id: userId });
    setIsViewingProfile(true);
    // Update URL to include profile parameter
    router.push(`/community?profile=${userId}`);
  };

  const handleRepostPress = (thread: any) => {
    console.log('Repost button pressed for thread:', thread.id);
    setSelectedThreadForRepost(thread);
    setShowRepostModal(true);
  };

  const handleRepostSuccess = () => {
    
    // Refresh both feeds to show new repost
    fetchThreads(session);
    fetchFollowingThreads(session);
  };

  const handleRepostLikeToggle = async (repostId: string, isLiked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    // Optimistic UI update for both threads and followingThreads
    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === repostId && t.type === 'repost') {
        const newLikeCount = isLiked ? (t.likeCount || 0) - 1 : (t.likeCount || 0) + 1;
        return { ...t, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return t;
    }));

    // Also update followingThreads state
    setFollowingThreads(prevThreads => prevThreads.map(t => {
      if (t.id === repostId && t.type === 'repost') {
        const newLikeCount = isLiked ? (t.likeCount || 0) - 1 : (t.likeCount || 0) + 1;
        return { ...t, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return t;
    }));

    try {
      if (isLiked) {
        // Remove like from repost
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ repost_id: repostId, user_id: session.user.id });
        if (error) throw error;
      } else {
        // Add like to repost
        const { error } = await supabase
          .from('likes')
          .insert({ repost_id: repostId, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling repost like:", error);
      // Revert optimistic update on error for both states
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === repostId && t.type === 'repost') {
          const revertedLikeCount = isLiked ? (t.likeCount || 0) + 1 : (t.likeCount || 0) - 1;
          return { ...t, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return t;
      }));
      setFollowingThreads(prevThreads => prevThreads.map(t => {
        if (t.id === repostId && t.type === 'repost') {
          const revertedLikeCount = isLiked ? (t.likeCount || 0) + 1 : (t.likeCount || 0) - 1;
          return { ...t, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return t;
      }));
    }
  };

  const showDeleteRepostAlert = (repostId: string) => {
    Alert.alert(
      'Delete Repost',
      'Are you sure you want to delete this repost?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handleDeleteThread(repostId, 'repost')
        }
      ]
    );
  };

  const handleRepostDeletePress = (repostId: string) => {
    setSelectedRepostForDelete(repostId);
    setRepostDeleteMenuVisible(true);
  };

  const handleRepostDeleteDirect = async (repostId: string) => {
    // Check if user has permission first
    try {
      const { data: repostData, error: fetchError } = await supabase
        .from('reposts')
        .select('*')
        .eq('id', repostId)
        .single();
      
      if (fetchError) {
        Alert.alert('Error', 'Could not find repost');
        return;
      }
      
      // Check if user has permission to delete
      if (repostData.user_id !== session?.user?.id && !isCurrentUserAdmin()) {
        Alert.alert('Error', 'You do not have permission to delete this repost');
        return;
      }
      
      // Use confirm for web platform as it's more reliable
      const confirmed = window.confirm('Are you sure you want to delete this repost?');
      if (confirmed) {
        try {
          const { error } = await supabase.from('reposts').delete().eq('id', repostId);
          if (error) {
            throw error;
          }
          
          // Refresh both feeds after deletion
          if (session) {
            fetchThreads(session);
            fetchFollowingThreads(session);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`Failed to delete repost: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Error: ${errorMessage}`);
    }
  };

  const handleRepostDeleteConfirm = () => {
    if (selectedRepostForDelete) {
      showDeleteRepostAlert(selectedRepostForDelete);
      setRepostDeleteMenuVisible(false);
      setSelectedRepostForDelete(null);
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

      // Fetch threads from followed users
      const { data: threadsData, error: threadsError } = await supabase
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

      if (threadsError) throw threadsError;

      // Fetch reposts from followed users with separate queries
      const { data: repostsData, error: repostsError } = await supabase
        .from('reposts')
        .select('*')
        .in('user_id', followingUserIds)
        .order('created_at', { ascending: false });

      if (repostsError) {
        console.error('Error fetching reposts from followed users:', repostsError);
      }

      // Get user profiles for reposts
      const repostUserIds = [...new Set((repostsData || []).map(r => r.user_id))];
      const { data: repostProfilesData, error: repostProfilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, favorite_team')
        .in('id', repostUserIds);

      if (repostProfilesError) {
        console.error('Error fetching repost profiles:', repostProfilesError);
      }

      // Get original threads for reposts
      const repostThreadIds = [...new Set((repostsData || []).map(r => r.original_thread_id))];
      const { data: repostThreadsData, error: repostThreadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team)
        `)
        .in('id', repostThreadIds);

      if (repostThreadsError) {
        console.error('Error fetching repost threads:', repostThreadsError);
      }

      // Combine repost data
      const repostProfilesMap = (repostProfilesData || []).reduce((acc: any, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      const repostThreadsMap = (repostThreadsData || []).reduce((acc: any, thread) => {
        acc[thread.id] = thread;
        return acc;
      }, {});

      const combinedRepostsData = (repostsData || []).map(repost => ({
        ...repost,
        profiles: repostProfilesMap[repost.user_id],
        original_thread: repostThreadsMap[repost.original_thread_id]
      }));

      if (repostsError) {
        console.error('Error fetching reposts from followed users:', repostsError);
      }

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

      // Get user's likes for threads and reposts
      const [userLikesData, userBookmarksData] = await Promise.all([
        supabase.from('likes').select('thread_id, repost_id').eq('user_id', currentSession.user.id),
        supabase.from('bookmarks').select('thread_id').in('thread_id', threadsData.map(t => t.id)).eq('user_id', currentSession.user.id)
      ]);

      const likedThreadIds = new Set((userLikesData.data || []).map(l => l.thread_id));
      const bookmarkedThreadIds = new Set((userBookmarksData.data || []).map(b => b.thread_id));
      const likedRepostIds = new Set((userLikesData.data || []).map(l => l.repost_id));

      // Get repost counts for threads
      const { data: repostCountsData, error: repostCountsError } = await supabase
        .from('reposts')
        .select('original_thread_id')
        .in('original_thread_id', threadsData.map(t => t.id));

      if (repostCountsError) {
        console.error('Error fetching repost counts for following threads:', repostCountsError);
      }

      // Create a map of thread_id to repost count
      const repostCountMap = (repostCountsData || []).reduce((acc: any, repost: any) => {
        acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
        return acc;
      }, {});

      // Process threads
      const processedThreads = threadsData.map((item: any) => ({
        ...item,
        type: 'thread',
        isLiked: likedThreadIds.has(item.id),
        isBookmarked: bookmarkedThreadIds.has(item.id),
        likeCount: item.likes[0]?.count || 0,
        replyCount: item.replies[0]?.count || 0,
        repostCount: repostCountMap[item.id] || 0,
        view_count: viewCountMap[item.id] || 0,
      }));

      // Get repost engagement metrics for following feed
      const followingRepostIds = combinedRepostsData.map(r => r.id);
      const followingRepostOriginalThreadIds = combinedRepostsData.map(r => r.original_thread_id);
      const [followingRepostLikesData, followingRepostRepostsData] = await Promise.all([
        supabase.from('likes').select('repost_id, user_id').in('repost_id', followingRepostIds),
        supabase.from('reposts').select('original_thread_id').in('original_thread_id', followingRepostIds)
      ]);

      // Create maps for repost engagement
      const followingRepostLikeCountMap = (followingRepostLikesData.data || []).reduce((acc: any, like) => {
        acc[like.repost_id] = (acc[like.repost_id] || 0) + 1;
        return acc;
      }, {});

      const followingRepostRepostCountMap = (followingRepostRepostsData.data || []).reduce((acc: any, repost) => {
        acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
        return acc;
      }, {});

      // Get view counts for reposts (using original thread view counts for now)
      const { data: followingRepostViewCountsData, error: followingRepostViewCountsError } = await supabase
        .from('thread_views')
        .select('thread_id')
        .in('thread_id', followingRepostOriginalThreadIds);

      if (followingRepostViewCountsError) {
        console.error('Error fetching following repost view counts:', followingRepostViewCountsError);
      }

      // Create a map of original_thread_id to view count for reposts
      const followingRepostViewCountMap = (followingRepostViewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});

      // Get reply counts for reposts (reposts can have their own replies)
      const { data: followingRepostReplyCountsData, error: followingRepostReplyCountsError } = await supabase
        .from('repost_replies')
        .select('repost_id')
        .in('repost_id', followingRepostIds);

      if (followingRepostReplyCountsError) {
        console.error('Error fetching following repost reply counts:', followingRepostReplyCountsError);
      }

      // Create a map of repost_id to reply count for reposts
      const followingRepostReplyCountMap = (followingRepostReplyCountsData || []).reduce((acc: any, reply: any) => {
        acc[reply.repost_id] = (acc[reply.repost_id] || 0) + 1;
        return acc;
      }, {});

      // Get bookmarks for reposts
      const followingRepostBookmarks = userBookmarksData.data?.filter(bookmark => 
        combinedRepostsData.some(repost => repost.id === bookmark.thread_id)
      ) || [];

      // Process reposts with their own engagement metrics
      const processedReposts = combinedRepostsData.map((repost: any) => ({
        ...repost,
        type: 'repost',
        id: repost.id,
        content: repost.content,
        user_id: repost.user_id,
        profiles: repost.profiles,
        created_at: repost.created_at,
        likeCount: followingRepostLikeCountMap[repost.id] || 0, // Likes on this repost
        replyCount: followingRepostReplyCountMap[repost.id] || 0, // Replies on this repost
        view_count: Math.max(followingRepostViewCountMap[repost.original_thread_id] || 0, 1), // Views on original thread (minimum 1)
        repostCount: followingRepostRepostCountMap[repost.id] || 0, // How many times this repost has been reposted
        isLiked: likedRepostIds.has(repost.id),
        isBookmarked: followingRepostBookmarks.some(bookmark => bookmark.thread_id === repost.id),
        original_thread: repost.original_thread,
      }));

      // Combine and sort by creation date
      const combinedFeed = [...processedThreads, ...processedReposts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFollowingThreads(combinedFeed);
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
                    setIsViewingProfile(false);
                    setSelectedProfile(null);
                    fetchBookmarkedThreads(session);
                  } else if (item.href === '/profile') {
                    if (session) {
                      setSelectedProfile({ id: session.user.id });
                      setIsViewingProfile(true);
                      setShowBookmarks(false);
                      setIsViewingThread(false);
                      setSelectedThread(null);
                      // Update URL to include profile parameter
                      router.push(`/community?profile=${session.user.id}`);
                    } else {
                      setShowAuth(true);
                    }
                  } else {
                    setShowBookmarks(false);
                    setIsViewingProfile(false);
                    setSelectedProfile(null);
                    setIsViewingThread(false);
                    setSelectedThread(null);
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
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.15)',
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
              // Check if view already exists to avoid 409 conflict
              const { data: existingView } = await supabase
                .from('thread_views')
                .select('id')
                .eq('thread_id', threadId)
                .eq('user_id', session.user.id)
                .single();

              if (!existingView) {
              await supabase.from('thread_views').insert({
                thread_id: threadId,
                user_id: session.user.id
              });
              }
              
              // Mark as tracked to prevent duplicate tracking
              setThreads(prev => prev.map(t => 
                t.id === threadId ? { ...t, viewTracked: true } : t
              ));
            } catch (error) {
              // Ignore 409 conflicts and other errors silently
              console.error('Error tracking view:', error);
            }
          };
          
          trackView();
        }
      }
    }
  }, [threadId, threads, session]);

  // Handle profile parameter from URL
  useEffect(() => {
    if (profileId && typeof profileId === 'string') {
      setSelectedProfile({ id: profileId });
      setIsViewingProfile(true);
    }
  }, [profileId]);

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

      {
        // BEGIN main community feed UI
        <View className="flex-row flex-1 overflow-hidden">
          {/* Mobile Sidebar (Animated) */}
          {isSidebarOpen && (
            <Pressable
              className="absolute inset-0 z-10 bg-black/50 md:hidden"
              onPress={closeSidebar}
            >
              <Animated.View style={{ height: '100%', backgroundColor: '#ffffff', padding: 16 }}>
                <SidebarContent />
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
                  {isViewingProfile && selectedProfile ? (
                    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                      <ProfileContainer
                        userId={selectedProfile.id}
                        onBack={handleCloseProfile}
                        session={session}
                        onLogin={() => setShowAuth(true)}
                        onProfilePress={handleProfilePress}
                      />
                    </View>
                  ) : isViewingThread && selectedThread ? (
                    <ThreadView 
                      thread={selectedThread} 
                      onClose={handleCloseThread} 
                      session={session} 
                      onProfilePress={handleProfilePress}
                      onRepostPress={handleRepostPress}
                      onThreadPress={handleThreadPress}
                      onThreadIdPress={handleThreadIdPress}
                      onDeleteRepost={handleRepostDeleteDirect}
                    />
                  ) : showBookmarks ? (
                    // Bookmarks Container
                    <View style={{ backgroundColor: '#ffffff' }}>
                      {/* Bookmarks Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: '#ffffff' }}>
                        <TouchableOpacity onPress={() => {
                          setShowBookmarks(false);
                          setIsViewingProfile(false);
                          setSelectedProfile(null);
                        }}>
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
                          <TouchableOpacity onPress={() => setShowAuth(true)} style={{ backgroundColor: '#dc2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}>
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
                            bookmarkedThreads.map((item) => (
                              item.type === 'repost' ? (
                                <TouchableOpacity key={item.id} onPress={() => handleThreadPress(item)}>
                                  <View style={{ padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
                                                                            {/* Repost content using PostCard structure */}
                                        <View style={{ flexDirection: 'row' }}>
                                          <Image
                                            source={{ 
                                              uri: item.profiles?.avatar_url || 
                                                   `https://ui-avatars.com/api/?name=${item.profiles?.username?.charAt(0)}&background=random` 
                                            }}
                                            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#f3f4f6' }}
                                          />
                                          <View style={{ flex: 1 }}>
                                            {/* Repost user info */}
                                            <View style={{ marginBottom: 4 }}>
                                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
                                                  {item.profiles?.username || 'Unknown User'}
                                                </Text>
                                                {item.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                                                  <Image 
                                                    source={require('@/assets/images/favicon.png')} 
                                                    style={{ width: 24, height: 22, marginLeft: 4 }}
                                                    resizeMode="contain"
                                                  />
                                                ) : item.profiles?.favorite_team && TEAM_LOGOS[item.profiles.favorite_team] && (
                                                  <Image 
                                                    source={TEAM_LOGOS[item.profiles.favorite_team]} 
                                                    style={{ width: 24, height: 22, marginLeft: 4 }}
                                                    resizeMode="contain"
                                                  />
                                                )}

                                          </View>
                                          <Text style={{ fontSize: 11, color: '#888' }}>
                                            {formatThreadTimestamp(item.created_at) || ''}
                                          </Text>
                                        </View>

                                        {/* Repost content */}
                                        {item.content && (
                                          <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                                            {item.content}
                                          </Text>
                                        )}

                                        {/* Repost image */}
                                        {item.image_url && (
                                          <Image
                                            source={{ uri: item.image_url }}
                                            style={getResponsiveImageStyle(screenWidth)}
                                            resizeMode="cover"
                                          />
                                        )}

                                        {/* Original thread preview - embedded like Twitter */}
                                        <TouchableOpacity 
                                          onPress={() => handleThreadPress(item.original_thread)}
                                          style={{
                                            borderWidth: 1,
                                            borderColor: '#e5e5e5',
                                            borderRadius: 12,
                                            padding: 12,
                                            backgroundColor: '#f8f9fa',
                                            marginBottom: 12
                                          }}
                                        >
                                          <View style={{ flexDirection: 'row' }}>
                                            <Image
                                              source={{ 
                                                uri: item.original_thread?.profiles?.avatar_url || 
                                                     `https://ui-avatars.com/api/?name=${item.original_thread?.profiles?.username?.charAt(0)}&background=random` 
                                              }}
                                              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                                            />
                                            <View style={{ flex: 1 }}>
                                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 13 }}>
                                                  {item.original_thread?.profiles?.username || 'Unknown User'}
                                                </Text>
                                                {item.original_thread?.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                                                  <Image 
                                                    source={require('@/assets/images/favicon.png')} 
                                                    style={{ width: 16, height: 14, marginLeft: 2 }}
                                                    resizeMode="contain"
                                                  />
                                                ) : item.original_thread?.profiles?.favorite_team && TEAM_LOGOS[item.original_thread.profiles.favorite_team] && (
                                                  <Image 
                                                    source={TEAM_LOGOS[item.original_thread.profiles.favorite_team]} 
                                                    style={{ width: 16, height: 14, marginLeft: 2 }}
                                                    resizeMode="contain"
                                                  />
                                                )}
                                              </View>
                                              <Text style={{ color: '#1a1a1a', fontSize: 12, lineHeight: 16 }}>
                                                {item.original_thread?.content || ''}
                                              </Text>
                                              {item.original_thread?.image_url && (
                                                <View style={{ alignItems: 'center', marginTop: 4 }}>
                                                  <Image
                                                    source={{ uri: item.original_thread.image_url }}
                                                    style={getCompactImageStyle(screenWidth)}
                                                    resizeMode="cover"
                                                  />
                                                </View>
                                              )}
                                              {/* Original thread views */}
                                              <Text style={{ color: '#666666', fontSize: 11, marginTop: 4 }}>
                                                {item.original_thread?.view_count || 0} views
                                              </Text>
                                            </View>
                                          </View>
                                        </TouchableOpacity>

                                        {/* Bookmark button */}
                                        <TouchableOpacity 
                                          onPress={() => handleBookmarkToggleInBookmarks(item.id, item.isBookmarked)}
                                          style={{ alignSelf: 'flex-start' }}
                                        >
                                          <Bookmark size={14} color="#dc2626" fill="#dc2626" />
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              ) : (
                              <BookmarkCard
                                  key={item.id}
                                  username={item.profiles?.username || 'Anonymous'}
                                  avatarUrl={item.profiles?.avatar_url}
                                  content={item.content}
                                  imageUrl={item.image_url}
                                  timestamp={item.created_at}
                                  favoriteTeam={item.profiles?.favorite_team}
                                  isAdmin={item.profiles?.email === 'sharmadivyanshu265@gmail.com'}
                                  onBookmarkPress={() => handleBookmarkToggleInBookmarks(item.id, item.isBookmarked)}
                                  onThreadPress={() => handleThreadPress(item)}
                                />
                              )
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
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: activeTab === 'foryou' ? '#000000' : '#505050' }} selectable={false}>For you</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleTabPress('following')} style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: activeTab === 'following' ? '#000000' : '#505050' }} selectable={false}>Following</Text>
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
                        {/* Test Button */}
                        

                        {/* Threads Feed */}
                        {activeTab === 'foryou' ? (
                          loading ? (
                            <ActivityIndicator className="mt-8" />
                          ) : (
                                                        threads.map((item) => (
                              <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: '#9ca3af', backgroundColor: '#ffffff' }}>
                                {item.type === 'repost' ? (
                                  <TouchableOpacity onPress={() => handleThreadPress(item)}>
                                    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                                      {/* Repost content using PostCard structure */}
                                      <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity 
                                          onPress={() => handleProfilePress(item.user_id)}
                                          style={{ marginRight: 12 }}
                                        >
                                          <Image
                                            source={{ 
                                              uri: item.profiles?.avatar_url || 
                                                   `https://ui-avatars.com/api/?name=${item.profiles?.username?.charAt(0)}&background=random` 
                                            }}
                                            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
                                          />
                                        </TouchableOpacity>

                                        <View style={{ flex: 1 }}>
                                          {/* Repost user info */}
                                          <View style={{ marginBottom: 4 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                              <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
                                                {item.profiles?.username || 'Unknown User'}
                                              </Text>
                                              {item.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                                                <Image 
                                                  source={require('@/assets/images/favicon.png')} 
                                                  style={{ width: 24, height: 22, marginLeft: 4 }}
                                                  resizeMode="contain"
                                                />
                                              ) : item.profiles?.favorite_team && TEAM_LOGOS[item.profiles.favorite_team] && (
                                                <Image 
                                                  source={TEAM_LOGOS[item.profiles.favorite_team]} 
                                                  style={{ width: 24, height: 22, marginLeft: 4 }}
                                                  resizeMode="contain"
                                                />
                                              )}
                                            </View>
                                            <Text style={{ fontSize: 11, color: '#888' }}>
                                              {formatThreadTimestamp(item.created_at) || ''}
                                            </Text>
                                          </View>

                                          {/* Repost content */}
                                          {item.content && (
                                            <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                                              {item.content}
                                            </Text>
                                          )}

                                          {/* Repost image */}
                                          {item.image_url && (
                                            <Image
                                              source={{ uri: item.image_url }}
                                              style={getResponsiveImageStyle(screenWidth)}
                                              resizeMode="cover"
                                            />
                                          )}

                                          {/* Original thread preview - embedded like Twitter */}
                                          <TouchableOpacity 
                                            onPress={() => handleThreadPress(item.original_thread)}
                                            style={{
                                              borderWidth: 1,
                                              borderColor: '#e5e5e5',
                                              borderRadius: 12,
                                              padding: 12,
                                              backgroundColor: '#f8f9fa',
                                              marginBottom: 12
                                            }}
                                          >
                                            <View style={{ flexDirection: 'row' }}>
                                              <Image
                                                source={{ 
                                                  uri: item.original_thread?.profiles?.avatar_url || 
                                                       `https://ui-avatars.com/api/?name=${item.original_thread?.profiles?.username?.charAt(0)}&background=random` 
                                                }}
                                                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                                              />
                                              <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                  <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 13 }}>
                                                    {item.original_thread?.profiles?.username || 'Unknown User'}
                                                  </Text>
                                                  {item.original_thread?.profiles?.favorite_team && TEAM_LOGOS[item.original_thread.profiles.favorite_team] && (
                                                    <Image 
                                                      source={TEAM_LOGOS[item.original_thread.profiles.favorite_team]} 
                                                      style={{ width: 16, height: 14, marginLeft: 2 }}
                                                      resizeMode="contain"
                                                    />
                                                  )}
                                                </View>
                                                <Text style={{ color: '#1a1a1a', fontSize: 12, lineHeight: 16 }}>
                                                  {item.original_thread?.content || ''}
                                                </Text>
                                                {item.original_thread?.image_url && (
                                                  <View style={{ alignItems: 'center', marginTop: 4 }}>
                                                    <Image
                                                      source={{ uri: item.original_thread.image_url }}
                                                      style={getCompactImageStyle(screenWidth)}
                                                      resizeMode="cover"
                                                    />
                                                  </View>
                                                )}
                                                {/* Original thread views */}
                                                <Text style={{ color: '#666666', fontSize: 11, marginTop: 4 }}>
                                                  {item.original_thread?.view_count || 0} views
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>

                                          {/* Engagement bar - removed views and bookmarks for reposts */}
                                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                            {/* Comments */}
                                            <TouchableOpacity 
                                              onPress={() => handleThreadPress(item)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <MessageCircle size={14} color="#666666" />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{item.replyCount || 0}</Text>
                                            </TouchableOpacity>

                                            {/* Reposts */}
                                            <TouchableOpacity 
                                              onPress={() => handleRepostPress(item)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <Repeat2 size={14} color="#666666" />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{item.repostCount || 0}</Text>
                                            </TouchableOpacity>

                                            {/* Likes */}
                                            <TouchableOpacity 
                                              onPress={() => handleRepostLikeToggle(item.id, item.isLiked || false)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <Heart 
                                                size={14} 
                                                color={item.isLiked ? '#dc2626' : '#666666'} 
                                                fill={item.isLiked ? '#dc2626' : 'none'} 
                                              />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                                                {item.likeCount || 0}
                                              </Text>
                                            </TouchableOpacity>

                                            {/* Delete button for reposts */}
                                            {session && (item.user_id === session.user.id || isCurrentUserAdmin()) && (
                                              <TouchableOpacity 
                                                onPress={() => {
                                                  console.log('Delete repost clicked:', item.id);
                                                  handleRepostDeleteDirect(item.id);
                                                }}
                                                style={{ 
                                                  flexDirection: 'row', 
                                                  alignItems: 'center', 
                                                  marginLeft: 'auto',
                                                  padding: 8,
                                                  backgroundColor: '#fef2f2',
                                                  borderRadius: 4
                                                }}
                                              >
                                                <Trash2 size={16} color="#dc2626" />
                                              </TouchableOpacity>
                                            )}
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity onPress={() => handleThreadPress(item)}>
                                    <PostCard
                                      username={item.profiles?.username || 'Anonymous'}
                                      avatarUrl={item.profiles?.avatar_url}
                                      content={item.content}
                                      imageUrl={item.image_url}
                                      timestamp={item.created_at}
                                      likes={item.likeCount || 0}
                                      comments={item.replyCount || 0}
                                      views={item.view_count || 0}
                                      reposts={item.repostCount || 0}
                                      isLiked={item.isLiked}
                                      isBookmarked={item.isBookmarked}
                                      favoriteTeam={item.profiles?.favorite_team}
                                      userId={item.user_id}
                                      onCommentPress={() => handleThreadPress(item)}
                                      onLikePress={() => handleLikeToggle(item.id, item.isLiked)}
                                      onBookmarkPress={() => handleBookmarkToggle(item.id, item.isBookmarked)}
                                      onRepostPress={() => handleRepostPress(item)}
                                      onDeletePress={() => handleDeleteThread(item.id)}
                                      onProfilePress={(userId) => {
                                        handleProfilePress(userId);
                                      }}
                                      canDelete={session && (item.user_id === session.user.id || isCurrentUserAdmin())}
                                      canAdminDelete={isCurrentUserAdmin()}
                                      isAdmin={isUserAdmin(item.user_id)}
                                      showReadMore={true}
                                      userEmail={item.profiles?.email}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))
                          )
                        ) : (
                          // Following tab
                          followingLoading ? (
                            <ActivityIndicator className="mt-8" />
                          ) : followingThreads.length > 0 ? (
                            followingThreads.map((item) => (
                              <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: '#9ca3af', backgroundColor: '#ffffff' }}>
                                {item.type === 'repost' ? (
                                  <TouchableOpacity onPress={() => handleThreadPress(item)}>
                                    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                                      {/* Repost content using PostCard structure */}
                                      <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity 
                                          onPress={() => handleProfilePress(item.user_id)}
                                          style={{ marginRight: 12 }}
                                        >
                                          <Image
                                            source={{ 
                                              uri: item.profiles?.avatar_url || 
                                                   `https://ui-avatars.com/api/?name=${item.profiles?.username?.charAt(0)}&background=random` 
                                            }}
                                            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
                                          />
                                        </TouchableOpacity>

                                        <View style={{ flex: 1 }}>
                                          {/* Repost user info */}
                                          <View style={{ marginBottom: 4 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                              <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
                                                {item.profiles?.username || 'Unknown User'}
                                              </Text>
                                              {item.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                                                <Image 
                                                  source={require('@/assets/images/favicon.png')} 
                                                  style={{ width: 24, height: 22, marginLeft: 4 }}
                                                  resizeMode="contain"
                                                />
                                              ) : item.profiles?.favorite_team && TEAM_LOGOS[item.profiles.favorite_team] && (
                                                <Image 
                                                  source={TEAM_LOGOS[item.profiles.favorite_team]} 
                                                  style={{ width: 24, height: 22, marginLeft: 4 }}
                                                  resizeMode="contain"
                                                />
                                              )}
                                              {session && (item.user_id === session.user.id || isCurrentUserAdmin()) && (
                                                <TouchableOpacity 
                                                  onPress={() => handleRepostDeleteDirect(item.id)}
                                                  style={{ 
                                                    marginLeft: 'auto', 
                                                    padding: 8,
                                                    backgroundColor: '#fef2f2',
                                                    borderRadius: 4
                                                  }}
                                                >
                                                  <Trash2 size={16} color="#dc2626" />
                                                </TouchableOpacity>
                                              )}
                                            </View>
                                            <Text style={{ fontSize: 11, color: '#888' }}>
                                              {formatThreadTimestamp(item.created_at) || ''}
                                            </Text>
                                          </View>

                                          {/* Repost content */}
                                          {item.content && (
                                            <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                                              {item.content}
                                            </Text>
                                          )}

                                          {/* Repost image */}
                                          {item.image_url && (
                                            <Image
                                              source={{ uri: item.image_url }}
                                              style={{ 
                                                ...getResponsiveImageStyle(screenWidth),
                                                borderRadius: 6,
                                                marginBottom: 12
                                              }}
                                              resizeMode="contain"
                                            />
                                          )}

                                          {/* Original thread preview - embedded like Twitter */}
                                          <TouchableOpacity 
                                            onPress={() => handleThreadPress(item.original_thread)}
                                            style={{
                                              borderWidth: 1,
                                              borderColor: '#e5e5e5',
                                              borderRadius: 12,
                                              padding: 12,
                                              backgroundColor: '#f8f9fa',
                                              marginBottom: 12
                                            }}
                                          >
                                            <View style={{ flexDirection: 'row' }}>
                                              <Image
                                                source={{ 
                                                  uri: item.original_thread?.profiles?.avatar_url || 
                                                       `https://ui-avatars.com/api/?name=${item.original_thread?.profiles?.username?.charAt(0)}&background=random` 
                                                }}
                                                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                                              />
                                              <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                  <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 13 }}>
                                                    {item.original_thread?.profiles?.username || 'Unknown User'}
                                                  </Text>
                                                  {item.original_thread?.profiles?.favorite_team && TEAM_LOGOS[item.original_thread.profiles.favorite_team] && (
                                                    <Image 
                                                      source={TEAM_LOGOS[item.original_thread.profiles.favorite_team]} 
                                                      style={{ width: 16, height: 14, marginLeft: 2 }}
                                                      resizeMode="contain"
                                                    />
                                                  )}
                                                </View>
                                                <Text style={{ color: '#1a1a1a', fontSize: 12, lineHeight: 16 }}>
                                                  {item.original_thread?.content || ''}
                                                </Text>
                                                {item.original_thread?.image_url && (
                                                  <View style={{ alignItems: 'center', marginTop: 4 }}>
                                                    <Image
                                                      source={{ uri: item.original_thread.image_url }}
                                                      style={getCompactImageStyle(screenWidth)}
                                                      resizeMode="cover"
                                                    />
                                                  </View>
                                                )}
                                                {/* Original thread views */}
                                                <Text style={{ color: '#666666', fontSize: 11, marginTop: 4 }}>
                                                  {item.original_thread?.view_count || 0} views
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>

                                          {/* Engagement bar - removed views and bookmarks for reposts */}
                                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                            {/* Comments */}
                                            <TouchableOpacity 
                                              onPress={() => handleThreadPress(item)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <MessageCircle size={14} color="#666666" />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{item.replyCount || 0}</Text>
                                            </TouchableOpacity>

                                            {/* Reposts */}
                                            <TouchableOpacity 
                                              onPress={() => handleRepostPress(item)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <Repeat2 size={14} color="#666666" />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{item.repostCount || 0}</Text>
                                            </TouchableOpacity>

                                            {/* Likes */}
                                            <TouchableOpacity 
                                              onPress={() => handleRepostLikeToggle(item.id, item.isLiked || false)}
                                              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                                            >
                                              <Heart 
                                                size={14} 
                                                color={item.isLiked ? '#dc2626' : '#666666'} 
                                                fill={item.isLiked ? '#dc2626' : 'none'} 
                                              />
                                              <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                                                {item.likeCount || 0}
                                              </Text>
                                            </TouchableOpacity>

                                            {/* Delete button for reposts */}
                                            {session && (item.user_id === session.user.id || isCurrentUserAdmin()) && (
                                              <TouchableOpacity 
                                                onPress={() => {
                                                  console.log('Delete repost clicked:', item.id);
                                                  handleRepostDeleteDirect(item.id);
                                                }}
                                                style={{ 
                                                  flexDirection: 'row', 
                                                  alignItems: 'center', 
                                                  marginLeft: 'auto',
                                                  padding: 8,
                                                  backgroundColor: '#fef2f2',
                                                  borderRadius: 4
                                                }}
                                              >
                                                <Trash2 size={16} color="#dc2626" />
                                              </TouchableOpacity>
                                            )}
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity onPress={() => handleThreadPress(item)}>
                                    <PostCard
                                      username={item.profiles?.username || 'Anonymous'}
                                      avatarUrl={item.profiles?.avatar_url}
                                      content={item.content}
                                      imageUrl={item.image_url}
                                      timestamp={item.created_at}
                                      likes={item.likeCount || 0}
                                      comments={item.replyCount || 0}
                                      views={item.view_count || 0}
                                      reposts={item.repostCount || 0}
                                      isLiked={item.isLiked}
                                      isBookmarked={item.isBookmarked}
                                      favoriteTeam={item.profiles?.favorite_team}
                                      userId={item.user_id}
                                      onCommentPress={() => handleThreadPress(item)}
                                      onLikePress={() => handleLikeToggle(item.id, item.isLiked)}
                                      onBookmarkPress={() => handleBookmarkToggle(item.id, item.isBookmarked)}
                                      onRepostPress={() => handleRepostPress(item)}
                                      onDeletePress={() => handleDeleteThread(item.id)}
                                      onProfilePress={(userId) => {
                                        handleProfilePress(userId);
                                      }}
                                      canDelete={session && (item.user_id === session.user.id || isCurrentUserAdmin())}
                                      canAdminDelete={isCurrentUserAdmin()}
                                      isAdmin={isUserAdmin(item.user_id)}
                                      showReadMore={true}
                                      userEmail={item.profiles?.email}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))
                          ) : (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                              <Text style={{ fontSize: 16, color: '#505050', textAlign: 'center' }} selectable={false}>
                                No posts from people you follow yet.{"\n"}Follow some users to see their posts here!
                              </Text>
                            </View>
                          )
                        )}
                      </View>
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
        // END main community feed UI
      }

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

      {/* Repost Modal */}
      <RepostModal
        visible={showRepostModal}
        onClose={() => {
          setShowRepostModal(false);
          setSelectedThreadForRepost(null);
        }}
        originalThread={selectedThreadForRepost}
        session={session}
        onRepostSuccess={handleRepostSuccess}
      />

      {/* Repost Delete Menu Modal */}
      <Modal
        visible={repostDeleteMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepostDeleteMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setRepostDeleteMenuVisible(false)}>
          <View style={{ 
            position: 'absolute', 
            top: '40%', 
            right: '20%', 
            backgroundColor: '#fff', 
            borderRadius: 8, 
            elevation: 4, 
            shadowColor: '#000', 
            shadowOpacity: 0.1, 
            shadowRadius: 8, 
            padding: 8, 
            minWidth: 120 
          }}>
            <TouchableOpacity 
              onPress={handleRepostDeleteConfirm} 
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                      <View style={{ width: '90%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', alignItems: 'stretch', position: 'relative' }}>
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
                style={{ backgroundColor: '#dc2626', borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.15)' }}
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