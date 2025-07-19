import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { Pencil, ArrowLeft, AlertCircle, Heart, MessageCircle, Repeat2, Trash2, LogOut, LogIn, UserPlus, UserMinus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { EditProfileModal } from './EditProfileModal';
import PostCard from '../PostCard';  // Import PostCard
import ReplyCard from '../community/ReplyCard';  // Import ReplyCard
import TwitterStyleReplyCard from '../community/TwitterStyleReplyCard';  // Import TwitterStyleReplyCard
import { ThreadView } from '../community/ThreadView';  // Import ThreadView

// Team logos and admin constants
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

const ADMIN_LOGO = require('@/assets/images/favicon.png');
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

// Placeholder for favorite team/admin icon
const AdminOrTeamIcon = ({ isAdmin, team }: { isAdmin: boolean; team?: string }) => (
  <View style={{ marginLeft: 8 }}>
    {isAdmin ? (
      <Image source={ADMIN_LOGO} style={{ width: 40, height: 36 }} resizeMode="contain" />
    ) : team ? (
      <Image source={TEAM_LOGOS[team]} style={{ width: 40, height: 36 }} resizeMode="contain" />
    ) : null}
  </View>
);

export default function ProfileContainer({
  userId,
  onBack,
  session,
  onLogin,
}: {
  userId: string;
  onBack: () => void;
  session: any;
  onLogin?: () => void;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  const [editModal, setEditModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [isViewingThread, setIsViewingThread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // New state for followers/following modals
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); // New state for follow/unfollow loading

  // Helper function to check if user is admin
  const isUserAdmin = (userProfile: any, userSession: any) => {
    return userProfile?.is_admin || userSession?.user?.email === ADMIN_EMAIL;
  };

  useEffect(() => {
    fetchAllData();
  }, [userId, session]);

  const fetchAllData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

      // Don't fetch if session is not available yet
      if (!session) {
        console.log('Session not available yet, skipping fetch');
        setIsLoading(false);
        return;
      }

      // Fetch profile info with enhanced data including all required fields
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, favorite_team, created_at, is_admin')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Profile not found');
      }

      setProfile(profileData);

      // Fetch threads (posts) with like/bookmark/view counts
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles!threads_user_id_fkey(*),
          replies:replies!thread_id(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (threadsError) {
        console.error('Error fetching threads:', threadsError);
        // Don't throw here as this is not critical for profile display
      }
      
      // Get view counts for these threads
      const threadIds = (threadsData || []).map((thread: any) => thread.id);
      let viewCountsData: any[] = [];
      let bookmarkCountsData: any[] = [];
      let likeCountsData: any[] = [];
      
      if (threadIds.length > 0) {
        const [viewResponse, bookmarkResponse, likeResponse] = await Promise.all([
          supabase.from('thread_views').select('thread_id').in('thread_id', threadIds),
          supabase.from('bookmarks').select('thread_id').in('thread_id', threadIds),
          supabase.from('likes').select('thread_id').in('thread_id', threadIds)
        ]);
        
        if (viewResponse.error) {
          console.error('Error fetching view counts:', viewResponse.error);
        } else {
          viewCountsData = viewResponse.data || [];
        }
        
        if (bookmarkResponse.error) {
          console.error('Error fetching bookmark counts:', bookmarkResponse.error);
        } else {
          bookmarkCountsData = bookmarkResponse.data || [];
        }
        
        if (likeResponse.error) {
          console.error('Error fetching like counts:', likeResponse.error);
        } else {
          likeCountsData = likeResponse.data || [];
        }
      }
      
      // Create maps for counts
      const viewCountMap = (viewCountsData || []).reduce((acc: any, view: any) => {
        acc[view.thread_id] = (acc[view.thread_id] || 0) + 1;
        return acc;
      }, {});
      
      const bookmarkCountMap = (bookmarkCountsData || []).reduce((acc: any, bookmark: any) => {
        acc[bookmark.thread_id] = (acc[bookmark.thread_id] || 0) + 1;
        return acc;
      }, {});
      
      const likeCountMap = (likeCountsData || []).reduce((acc: any, like: any) => {
        acc[like.thread_id] = (acc[like.thread_id] || 0) + 1;
        return acc;
      }, {});
      
      // Get user's likes and bookmarks if session exists
      let userLikes: any[] = [];
      let userBookmarks: any[] = [];
      
      if (session && threadIds.length > 0) {
        try {
          const [likesResponse, bookmarksResponse] = await Promise.all([
            supabase.from('likes').select('thread_id').eq('user_id', session.user.id).in('thread_id', threadIds),
            supabase.from('bookmarks').select('thread_id').eq('user_id', session.user.id).in('thread_id', threadIds)
          ]);
          
          userLikes = likesResponse.data || [];
          userBookmarks = bookmarksResponse.data || [];
        } catch (userDataError) {
          console.error('Error fetching user likes/bookmarks:', userDataError);
        }
      }
      
      // Process threads with all counts
      const processedThreads = (threadsData || []).map((thread: any) => ({
        ...thread,
        likeCount: likeCountMap[thread.id] || 0,
        replyCount: thread.replies[0]?.count || 0,
        view_count: viewCountMap[thread.id] || 0,
        bookmarkCount: bookmarkCountMap[thread.id] || 0,
        isLiked: userLikes.some(like => like.thread_id === thread.id),
        isBookmarked: userBookmarks.some(bookmark => bookmark.thread_id === thread.id),
      }));
      
      setThreads(processedThreads);

      // Fetch reposts for this user
      const { data: repostsData, error: repostsError } = await supabase
        .from('reposts')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (repostsError) {
        console.error('Error fetching reposts:', repostsError);
      }

      // Fetch original threads for reposts separately to avoid relationship conflicts
      let originalThreadsData: any[] = [];
      if (repostsData && repostsData.length > 0) {
        const originalThreadIds = repostsData.map(r => r.original_thread_id);
        const { data: threadsData, error: threadsError } = await supabase
          .from('threads')
          .select(`
            *,
            profiles:user_id (username, avatar_url, favorite_team)
          `)
          .in('id', originalThreadIds);
        
        if (threadsError) {
          console.error('Error fetching original threads for reposts:', threadsError);
        } else {
          originalThreadsData = threadsData || [];
        }
      }

      // Create a map of original threads
      const originalThreadsMap = originalThreadsData.reduce((acc: any, thread) => {
        acc[thread.id] = thread;
        return acc;
      }, {});

      if (repostsError) {
        console.error('Error fetching reposts:', repostsError);
      }

      // Get engagement metrics for reposts
      const repostIds = (repostsData || []).map(r => r.id);
      let repostLikesData: any[] = [];
      let repostRepostsData: any[] = [];
      
      if (repostIds.length > 0) {
        const [likesResponse, repostsResponse] = await Promise.all([
          supabase.from('likes').select('repost_id, user_id').in('repost_id', repostIds),
          supabase.from('reposts').select('original_thread_id').in('original_thread_id', repostIds)
        ]);
        
        repostLikesData = likesResponse.data || [];
        repostRepostsData = repostsResponse.data || [];
      }

      // Create maps for repost engagement
      const repostLikeCountMap = repostLikesData.reduce((acc: any, like) => {
        acc[like.repost_id] = (acc[like.repost_id] || 0) + 1;
        return acc;
      }, {});

      const repostRepostCountMap = repostRepostsData.reduce((acc: any, repost) => {
        acc[repost.original_thread_id] = (acc[repost.original_thread_id] || 0) + 1;
        return acc;
      }, {});

      // Process reposts
      const processedReposts = (repostsData || []).map((repost: any) => {
        const isLiked = repostLikesData.some(like => like.repost_id === repost.id && like.user_id === session?.user?.id);
        
        return {
          ...repost,
          type: 'repost',
          original_thread: originalThreadsMap[repost.original_thread_id],
          likeCount: repostLikeCountMap[repost.id] || 0,
          replyCount: 0, // Will be fetched from original thread
          view_count: Math.max(1, Math.floor(Math.random() * 50)), // Temporary view count
          repostCount: repostRepostCountMap[repost.id] || 0,
          isLiked: isLiked,
          isBookmarked: false, // Will be fetched separately if needed
        };
      });

      // Combine threads and reposts
      const combinedContent = [...processedThreads, ...processedReposts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setThreads(combinedContent);

      // Fetch replies with proper joins including thread profile data
      const { data: repliesData, error: repliesError } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          threads(
            *,
            profiles:user_id (username, avatar_url, favorite_team)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      // Filter out self-replies (user replying to their own threads)
      const filteredReplies = (repliesData || []).filter((reply: any) => {
        return reply.threads?.user_id !== userId;
      });
      
      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        setReplies([]);
      } else {
        setReplies(filteredReplies);
      }

      // Fetch followers/following counts
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
      
      console.log('Followers count query:', { followersData, followersError, userId });
      
      if (followersError) {
        console.error('Error fetching followers:', followersError);
        setFollowersCount(0);
      } else {
        setFollowersCount(followersData?.length || 0);
      }
      
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      console.log('Following count query:', { followingData, followingError, userId });
      
      if (followingError) {
        console.error('Error fetching following:', followingError);
        setFollowingCount(0);
      } else {
        setFollowingCount(followingData?.length || 0);
      }

      // Check if current user is following this profile user
      if (session && session.user.id !== userId) {
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('id')
          .match({ 
            follower_id: session.user.id, 
            following_id: userId 
          })
          .single();
        
        if (followError && followError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking follow status:', followError);
        } else {
          setIsFollowing(!!followData);
        }
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData(false);
  };

  const handleRetry = () => {
    fetchAllData();
  };

  const handleThreadClick = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setSelectedThread(thread);
      setIsViewingThread(true);
    }
  };

  const handleReplyThreadClick = (threadId: string) => {
    // For replies, we need to find the thread from the replies data
    const reply = replies.find(r => r.threads?.id === threadId);
    if (reply?.threads) {
      // Ensure the thread has the necessary data structure for ThreadView
      const threadWithCounts = {
        ...reply.threads,
        likeCount: 0, // This would need to be fetched or calculated
        replyCount: 0, // This would need to be fetched or calculated
        view_count: 0, // This would need to be fetched or calculated
        isLiked: false,
        isBookmarked: false,
        profiles: reply.threads.profiles
      };
      setSelectedThread(threadWithCounts);
      setIsViewingThread(true);
    }
  };

  const handleCloseThread = () => {
    setIsViewingThread(false);
    setSelectedThread(null);
  };

  const handleProfilePress = (userId: string) => {
    // This could be used to navigate to another user's profile
    // For now, we'll just log it
    console.log('Navigate to profile:', userId);
  };

  const handleRepostDeletePress = (repostId: string) => {
    if (!session) {
      Alert.alert('Error', 'You must be logged in to delete reposts');
      return;
    }
    
    Alert.alert(
      'Delete Repost',
      'Are you sure you want to delete this repost?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { data, error } = await supabase.from('reposts').delete().eq('id', repostId).select();
              
              if (error) {
                console.error('Delete error details:', error);
                throw error;
              }
              
              await fetchAllData();
            } catch (error) {
              console.error('Error deleting repost:', error);
              Alert.alert('Error', `Failed to delete repost: ${error.message || 'Unknown error'}`);
            }
          }
        }
      ]
    );
  };

  const handleLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) return;

    console.log('Like toggle called:', { threadId, isLiked, userId: session.user.id });

    // Optimistic UI update
    setThreads(prevThreads => prevThreads.map(thread => {
      if (thread.id === threadId) {
        const newLikeCount = isLiked ? (thread.likeCount || 0) - 1 : (thread.likeCount || 0) + 1;
        return { ...thread, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return thread;
    }));

    try {
      if (isLiked) {
        console.log('Deleting like for thread:', threadId);
        const { error } = await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
        if (error) {
          console.error('Delete like error:', error);
          throw error;
        }
        console.log('Like deleted successfully');
      } else {
        console.log('Inserting like for thread:', threadId);
        const { error } = await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) {
          console.error('Insert like error:', error);
          // If it's a duplicate key error, the like already exists, so we should update the UI to show it as liked
          if (error.code === '23505') {
            console.log('Like already exists, updating UI to show as liked');
            setThreads(prevThreads => prevThreads.map(thread => {
              if (thread.id === threadId) {
                return { ...thread, isLiked: true, likeCount: (thread.likeCount || 0) + 1 };
              }
              return thread;
            }));
            return; // Don't throw error, just return
          }
          throw error;
        }
        console.log('Like inserted successfully');
      }
      
      // Don't refresh data immediately - let the optimistic update stay
      // The data will be refreshed when the user navigates away and comes back
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id === threadId) {
          const revertedLikeCount = isLiked ? (thread.likeCount || 0) + 1 : (thread.likeCount || 0) - 1;
          return { ...thread, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return thread;
      }));
    }
  };

  const handleBookmarkToggle = async (threadId: string, isBookmarked: boolean) => {
    if (!session) return;

    // Optimistic UI update
    setThreads(prevThreads => prevThreads.map(thread => {
      if (thread.id === threadId) {
        return { ...thread, isBookmarked: !isBookmarked };
      }
      return thread;
    }));

    try {
      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().match({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
      }
      
      // Don't refresh data immediately - let the optimistic update stay
      // The data will be refreshed when the user navigates away and comes back
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert optimistic update on error
      setThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id === threadId) {
          return { ...thread, isBookmarked: isBookmarked };
        }
        return thread;
      }));
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    Alert.alert(
      'Delete Thread',
      'Are you sure you want to delete this thread?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('threads').delete().eq('id', threadId);
              if (error) throw error;
              await fetchAllData();
            } catch (error) {
              console.error('Error deleting thread:', error);
              Alert.alert('Error', 'Failed to delete thread');
            }
          }
        }
      ]
    );
  };

  const handleFollowToggle = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to follow users');
      return;
    }

    if (session.user.id === userId) {
      Alert.alert('Error', 'You cannot follow yourself');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);

        if (error) {
          console.error('Unfollow error:', error);
          Alert.alert('Error', 'Failed to unfollow. Please try again.');
          return;
        }
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: userId,
          });

        if (error) {
          console.error('Follow error:', error);
          Alert.alert('Error', 'Failed to follow. Please try again.');
          return;
        }
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Fetch followers list
  const fetchFollowers = async () => {
    if (!userId) return;
    
    setFollowersLoading(true);
    try {
      console.log('Fetching followers for userId:', userId);
      
      // First get the basic followers data
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      console.log('Followers query result:', { followersData, followersError });

      if (followersError) {
        console.error('Error fetching followers:', followersError);
        return;
      }

      if (!followersData || followersData.length === 0) {
        console.log('No followers data found');
        setFollowers([]);
        return;
      }

      // Get the user IDs
      const followerUserIds = followersData.map(f => f.follower_id);
      console.log('Follower user IDs:', followerUserIds);

      // Fetch profiles for these users
      let profilesData: any[] = [];
      for (const userId of followerUserIds) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, favorite_team, email, is_admin')
          .eq('id', userId)
          .single();
        
        if (!profileError && profileData) {
          profilesData.push(profileData);
        }
      }

      console.log('Profiles query result:', { profilesData });

      // Create a map of profiles
      const profilesMap = (profilesData || []).reduce((acc: any, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Check if current user follows each follower
      const followersWithFollowStatus = await Promise.all(
        followersData.map(async (follow) => {
          if (!session?.user) return { 
            ...follow, 
            profiles: profilesMap[follow.follower_id],
            isFollowedByCurrentUser: false 
          };
          
          const { data: followCheck } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', session.user.id)
            .eq('following_id', follow.follower_id)
            .single();

          return {
            ...follow,
            profiles: profilesMap[follow.follower_id],
            isFollowedByCurrentUser: !!followCheck
          };
        })
      );

      console.log('Followers with follow status:', followersWithFollowStatus);
      setFollowers(followersWithFollowStatus);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  // Fetch following list
  const fetchFollowing = async () => {
    if (!userId) return;
    
    setFollowingLoading(true);
    try {
      console.log('Fetching following for userId:', userId);
      
      // First get the basic following data
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      console.log('Following query result:', { followingData, followingError });

      if (followingError) {
        console.error('Error fetching following:', error);
        return;
      }

      if (!followingData || followingData.length === 0) {
        console.log('No following data found');
        setFollowing([]);
        return;
      }

      // Get the user IDs
      const followingUserIds = followingData.map(f => f.following_id);
      console.log('Following user IDs:', followingUserIds);

      // Fetch profiles for these users
      let profilesData: any[] = [];
      for (const userId of followingUserIds) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, favorite_team, email, is_admin')
          .eq('id', userId)
          .single();
        
        if (!profileError && profileData) {
          profilesData.push(profileData);
        }
      }

      console.log('Profiles query result:', { profilesData });

      // Create a map of profiles
      const profilesMap = (profilesData || []).reduce((acc: any, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Check if current user follows each following user
      const followingWithFollowStatus = await Promise.all(
        followingData.map(async (follow) => {
          if (!session?.user) return { 
            ...follow, 
            profiles: profilesMap[follow.following_id],
            isFollowedByCurrentUser: false 
          };
          
          const { data: followCheck } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', session.user.id)
            .eq('following_id', follow.following_id)
            .single();

          return {
            ...follow,
            profiles: profilesMap[follow.following_id],
            isFollowedByCurrentUser: !!followCheck
          };
        })
      );

      console.log('Following with follow status:', followingWithFollowStatus);
      setFollowing(followingWithFollowStatus);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  // Check if current user is viewing their own profile
  const isOwnProfile = session?.user?.id === userId;

  // Handle follow/unfollow for individual users in lists
  const handleUserFollowToggle = async (targetUserId: string, isCurrentlyFollowed: boolean) => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to follow users');
      return;
    }

    if (session.user.id === targetUserId) {
      Alert.alert('Error', 'You cannot follow yourself');
      return;
    }

    try {
      if (isCurrentlyFollowed) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', targetUserId);

        if (error) {
          console.error('Unfollow error:', error);
          Alert.alert('Error', 'Failed to unfollow. Please try again.');
          return;
        }
        
        // Update the lists
        setFollowers(prev => prev.map(f => 
          f.follower_id === targetUserId 
            ? { ...f, isFollowedByCurrentUser: false }
            : f
        ));
        setFollowing(prev => prev.map(f => 
          f.following_id === targetUserId 
            ? { ...f, isFollowedByCurrentUser: false }
            : f
        ));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: targetUserId,
          });

        if (error) {
          console.error('Follow error:', error);
          Alert.alert('Error', 'Failed to follow. Please try again.');
          return;
        }
        
        // Update the lists
        setFollowers(prev => prev.map(f => 
          f.follower_id === targetUserId 
            ? { ...f, isFollowedByCurrentUser: true }
            : f
        ));
        setFollowing(prev => prev.map(f => 
          f.following_id === targetUserId 
            ? { ...f, isFollowedByCurrentUser: true }
            : f
        ));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleRepostLikeToggle = async (repostId: string, isLiked: boolean) => {
    if (!session) return;

    // Optimistic UI update
    setThreads(prevThreads => prevThreads.map(thread => {
      if (thread.id === repostId) {
        const newLikeCount = isLiked ? (thread.likeCount || 0) - 1 : (thread.likeCount || 0) + 1;
        return { ...thread, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return thread;
    }));

    try {
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().match({ repost_id: repostId, user_id: session.user.id });
        if (error) {
          console.error('Delete like error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase.from('likes').insert({ repost_id: repostId, user_id: session.user.id });
        if (error) {
          console.error('Insert like error:', error);
          // If it's a duplicate key error, the like already exists
          if (error.code === '23505') {
            setThreads(prevThreads => prevThreads.map(thread => {
              if (thread.id === repostId) {
                return { ...thread, isLiked: true, likeCount: (thread.likeCount || 0) + 1 };
              }
              return thread;
            }));
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error toggling repost like:", error);
      // Revert optimistic update on error
      setThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id === repostId) {
          const revertedLikeCount = isLiked ? (thread.likeCount || 0) + 1 : (thread.likeCount || 0) - 1;
          return { ...thread, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return thread;
      }));
    }
  };

  const handleRepostRepost = (repost: any) => {
    // This would open the repost modal
    console.log('Repost repost clicked:', repost.id);
    // You can implement repost functionality here
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // The session will be updated automatically through the auth state change listener
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#657786' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <AlertCircle size={48} color="#dc2626" />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#dc2626', textAlign: 'center' }}>
          Error Loading Profile
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            marginTop: 20,
            backgroundColor: '#1DA1F2',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          style={{
            marginTop: 12,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#666', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>
          Profile Not Found
        </Text>
        <TouchableOpacity
          onPress={onBack}
          style={{
            marginTop: 20,
            backgroundColor: '#1DA1F2',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show login button when user is not authenticated
  if (!session) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' }}>
            Sign in to view profiles
          </Text>
          <Text style={{ fontSize: 16, color: '#657786', textAlign: 'center', marginBottom: 32 }}>
            Join the F1 community to explore profiles and connect with other fans
          </Text>
          <TouchableOpacity
            onPress={onLogin}
            style={{
              backgroundColor: '#dc2626',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <LogIn size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Sign In Now</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onBack}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#657786', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header with Back Button, Username, and Post Count */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e5e5',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
      }}>
        <TouchableOpacity 
          onPress={onBack} 
          style={{ 
            marginRight: 16, 
            padding: 8, 
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#1a1a1a' }}>{profile.username}</Text>
            {(isUserAdmin(profile, session) || profile.favorite_team) && (
              <View style={{ marginLeft: 8 }}>
                {isUserAdmin(profile, session) ? (
                  <Image source={ADMIN_LOGO} style={{ width: 28, height: 24 }} resizeMode="contain" />
                ) : profile.favorite_team ? (
                  <Image source={TEAM_LOGOS[profile.favorite_team]} style={{ width: 28, height: 24 }} resizeMode="contain" />
                ) : null}
              </View>
            )}
          </View>
          <Text style={{ color: '#657786', fontSize: 14, marginTop: 2 }}>{threads.length} posts • {replies.length} replies</Text>
        </View>
        {session?.user?.id === userId ? (
          <TouchableOpacity 
            onPress={() => setEditModal(true)} 
            style={{ 
              paddingHorizontal: 16, 
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#e5e5e5',
              backgroundColor: '#ffffff'
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontWeight: '600', color: '#1a1a1a', fontSize: 14 }}>Edit Profile</Text>
          </TouchableOpacity>
        ) : session && (
          <TouchableOpacity 
            onPress={handleFollowToggle} 
            style={{ 
              paddingHorizontal: 16, 
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isFollowing ? '#e5e5e5' : '#dc2626',
              backgroundColor: isFollowing ? '#ffffff' : '#dc2626'
            }}
            activeOpacity={0.8}
          >
            <Text style={{ 
              fontWeight: '600', 
              color: isFollowing ? '#1a1a1a' : '#ffffff', 
              fontSize: 14 
            }}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Profile Header with Avatar and Edit Icon */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        padding: 20, 
        backgroundColor: '#ffffff'
      }}>
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username?.charAt(0) || 'U'}&background=f5f5f5&color=666` }} 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: '#f5f5f5',
              borderWidth: 4,
              borderColor: '#ffffff'
            }} 
          />
          {session?.user?.id === userId && (
            <TouchableOpacity 
              onPress={() => setEditModal(true)} 
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                backgroundColor: '#ffffff', 
                borderRadius: 12, 
                padding: 4, 
                borderWidth: 1, 
                borderColor: '#e5e5e5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
              activeOpacity={0.8}
            >
              <Pencil size={14} color="#1a1a1a" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#1a1a1a', marginBottom: 2 }}>{profile.full_name || profile.username}</Text>
          <Text style={{ color: '#657786', fontSize: 14, marginBottom: 8 }}>@{profile.username}</Text>
          {profile.bio && (
            <Text style={{ color: '#1a1a1a', fontSize: 15, lineHeight: 20, marginBottom: 12 }}>{profile.bio}</Text>
          )}
        </View>
        <AdminOrTeamIcon isAdmin={isUserAdmin(profile, session)} team={profile.favorite_team} />
      </View>
      {/* Followers/Following Counts with Logout Button */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: '#ffffff'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => {
              setShowFollowersModal(true);
              fetchFollowers();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1a1a1a' }}>{followersCount}</Text>
            <Text style={{ color: '#657786', fontSize: 14, marginLeft: 4 }}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setShowFollowingModal(true);
              fetchFollowing();
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1a1a1a' }}>{followingCount}</Text>
            <Text style={{ color: '#657786', fontSize: 14, marginLeft: 4 }}>Following</Text>
          </TouchableOpacity>
        </View>
        
        {/* Logout Button - only show for current user's profile */}
        {session?.user?.id === userId && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#e5e5e5',
            }}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#dc2626" style={{ marginRight: 4 }} />
            <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Tabs for Posts and Replies */}
      <View style={{ 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e5e5',
        backgroundColor: '#ffffff'
      }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('posts')} 
          style={{ 
            flex: 1, 
            alignItems: 'center', 
            paddingVertical: 16, 
            borderBottomWidth: activeTab === 'posts' ? 2 : 0, 
            borderBottomColor: activeTab === 'posts' ? '#dc2626' : 'transparent'
          }}
          activeOpacity={0.7}
        >
          <Text style={{ 
            fontWeight: activeTab === 'posts' ? 'bold' : '600', 
            color: activeTab === 'posts' ? '#dc2626' : '#657786',
            fontSize: 15
          }}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('replies')} 
          style={{ 
            flex: 1, 
            alignItems: 'center', 
            paddingVertical: 16, 
            borderBottomWidth: activeTab === 'replies' ? 2 : 0, 
            borderBottomColor: activeTab === 'replies' ? '#dc2626' : 'transparent'
          }}
          activeOpacity={0.7}
        >
          <Text style={{ 
            fontWeight: activeTab === 'replies' ? 'bold' : '600', 
            color: activeTab === 'replies' ? '#dc2626' : '#657786',
            fontSize: 15
          }}>Replies</Text>
        </TouchableOpacity>
      </View>
      {/* Posts/Replies List */}
      {isViewingThread && selectedThread ? (
        <ThreadView 
          thread={selectedThread} 
          onClose={handleCloseThread} 
          session={session} 
          onProfilePress={handleProfilePress}
          onThreadPress={handleThreadClick}
          onThreadIdPress={handleThreadClick}
          onDeleteRepost={handleRepostDeletePress}
        />
      ) : (
        <ScrollView 
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#1DA1F2']}
              tintColor={'#1DA1F2'}
            />
          }
        >
          {activeTab === 'posts' ? (
            threads.length > 0 ? (
              threads.map((item, index) => (
                <View key={item.id}>
                  {item.type === 'repost' ? (
                    <TouchableOpacity onPress={() => handleThreadClick(item.id)}>
                      <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                        {/* Repost content using PostCard structure */}
                        <View style={{ flexDirection: 'row' }}>
                          <Image
                            source={{ 
                              uri: item.profiles?.avatar_url || 
                                   `https://ui-avatars.com/api/?name=${item.profiles?.username?.charAt(0)}&background=random` 
                            }}
                            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
                          />
                          <View style={{ flex: 1, marginLeft: 12 }}>
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
                                {new Date(item.created_at).toLocaleDateString()}
                              </Text>
                            </View>

                            {/* Repost content */}
                            {item.content && (
                              <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                                {item.content}
                              </Text>
                            )}

                            {/* Original thread preview - embedded like Twitter */}
                            <TouchableOpacity 
                              onPress={() => handleThreadClick(item.original_thread?.id)}
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
                                    <View style={{
                                      width: '100%',
                                      aspectRatio: 16/9,
                                      borderRadius: 6,
                                      marginTop: 4,
                                      backgroundColor: '#f3f4f6',
                                      overflow: 'hidden'
                                    }}>
                                      <Image
                                        source={{ uri: item.original_thread.image_url }}
                                        style={{ 
                                          width: '100%', 
                                          height: '100%'
                                        }}
                                        resizeMode="cover"
                                      />
                                    </View>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>

                            {/* Engagement bar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                              {/* Comments */}
                              <TouchableOpacity 
                                onPress={() => handleThreadClick(item.id)}
                                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                              >
                                <MessageCircle size={14} color="#666666" />
                                <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{item.replyCount || 0}</Text>
                              </TouchableOpacity>

                              {/* Reposts */}
                              <TouchableOpacity 
                                onPress={() => handleRepostRepost(item)}
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


                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleThreadClick(item.id)}>
                      <PostCard
                        username={item.profiles?.username || profile.username}
                        avatarUrl={item.profiles?.avatar_url || profile.avatar_url}
                        content={item.content}
                        imageUrl={item.image_url}
                        timestamp={item.created_at}
                        likes={item.likeCount || 0}
                        comments={item.replyCount || 0}
                        views={item.view_count || 0}
                        isLiked={item.isLiked || false}
                        isBookmarked={item.isBookmarked || false}
                        favoriteTeam={item.profiles?.favorite_team || profile.favorite_team}
                        userId={item.user_id}
                        userEmail={item.profiles?.email || ''}
                        onCommentPress={() => handleThreadClick(item.id)}
                        onLikePress={() => handleLikeToggle(item.id, item.isLiked || false)}
                        onBookmarkPress={() => handleBookmarkToggle(item.id, item.isBookmarked || false)}
                        onDeletePress={() => handleDeleteThread(item.id)}
                        onProfilePress={() => {}} // Already in profile view
                        canDelete={session?.user?.id === item.user_id}
                        isAdmin={item.profiles?.email === 'sharmadivyanshu265@gmail.com'}
                        canAdminDelete={session?.user?.email === 'sharmadivyanshu265@gmail.com'}
                      />
                    </TouchableOpacity>
                  )}
                  {/* Separator line between items */}
                  {index < threads.length - 1 && (
                    <View style={{
                      height: 1,
                      backgroundColor: '#e5e5e5',
                      marginHorizontal: 16,
                      marginVertical: 0
                    }} />
                  )}
                </View>
              ))
            ) : (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 16 }}>No posts available.</Text>
              </View>
            )
          ) : (
                      replies.length > 0 ? (
            replies.map((reply, index) => (
              <View key={reply.id}>
                <TwitterStyleReplyCard
                  reply={reply}
                  onProfilePress={handleProfilePress}
                  onThreadPress={handleReplyThreadClick}
                  session={session}
                />
                {/* Separator line between replies */}
                {index < replies.length - 1 && (
                  <View style={{
                    height: 1,
                    backgroundColor: '#e5e5e5',
                    marginHorizontal: 16,
                    marginVertical: 0
                  }} />
                )}
              </View>
            ))
            ) : (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 16 }}>No replies yet.</Text>
              </View>
            )
          )}
        </ScrollView>
      )}
      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModal}
        onClose={() => setEditModal(false)}
        session={session}
        onProfileUpdate={fetchAllData}
      />

      {/* Followers Modal */}
      <Modal
        visible={showFollowersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFollowersModal(false)}
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <View style={{
            width: '95%',
            maxWidth: 400,
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
            marginVertical: 24,
            maxHeight: '80%'
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
                {isOwnProfile ? 'Your Followers' : `${profile?.username || 'User'}'s Followers`}
              </Text>
              <TouchableOpacity onPress={() => setShowFollowersModal(false)} style={{ padding: 8 }}>
                <ArrowLeft size={24} color="#3a3a3a" />
              </TouchableOpacity>
            </View>

            {/* Followers List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {followersLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#dc2626" />
                </View>
              ) : followers.length > 0 ? (
                followers.map((follower, index) => (
                  <View key={follower.follower_id} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 16,
                    borderBottomWidth: index < followers.length - 1 ? 1 : 0,
                    borderBottomColor: '#e5e5e5'
                  }}>
                    {/* Avatar */}
                    <Image
                      source={{ 
                        uri: follower.profiles?.avatar_url || 
                             `https://ui-avatars.com/api/?name=${follower.profiles?.username?.charAt(0)}&background=random` 
                      }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                    />
                    
                    {/* User Info */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 16 }}>
                          {follower.profiles?.username || 'Unknown User'}
                        </Text>
                        {follower.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: 20, height: 18, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        ) : follower.profiles?.favorite_team && TEAM_LOGOS[follower.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[follower.profiles.favorite_team]} 
                            style={{ width: 20, height: 18, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </View>

                    {/* Follow/Unfollow Button */}
                    {session?.user && session.user.id !== follower.follower_id && (
                      <TouchableOpacity
                        onPress={() => handleUserFollowToggle(follower.follower_id, follower.isFollowedByCurrentUser)}
                        style={{
                          backgroundColor: follower.isFollowedByCurrentUser ? '#e5e5e5' : '#dc2626',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        {follower.isFollowedByCurrentUser ? (
                          <UserMinus size={16} color="#666" />
                        ) : (
                          <UserPlus size={16} color="#fff" />
                        )}
                        <Text style={{
                          color: follower.isFollowedByCurrentUser ? '#666' : '#fff',
                          fontWeight: 'bold',
                          fontSize: 14,
                          marginLeft: 4
                        }}>
                          {follower.isFollowedByCurrentUser ? 'Remove' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#888', fontSize: 16 }}>
                    {isOwnProfile ? 'No followers yet.' : `${profile?.username || 'User'} has no followers yet.`}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Following Modal */}
      <Modal
        visible={showFollowingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFollowingModal(false)}
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <View style={{
            width: '95%',
            maxWidth: 400,
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
            marginVertical: 24,
            maxHeight: '80%'
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
                {isOwnProfile ? 'Your Following' : `${profile?.username || 'User'}'s Following`}
              </Text>
              <TouchableOpacity onPress={() => setShowFollowingModal(false)} style={{ padding: 8 }}>
                <ArrowLeft size={24} color="#3a3a3a" />
              </TouchableOpacity>
            </View>

            {/* Following List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {followingLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#dc2626" />
                </View>
              ) : following.length > 0 ? (
                following.map((followingUser, index) => (
                  <View key={followingUser.following_id} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 16,
                    borderBottomWidth: index < following.length - 1 ? 1 : 0,
                    borderBottomColor: '#e5e5e5'
                  }}>
                    {/* Avatar */}
                    <Image
                      source={{ 
                        uri: followingUser.profiles?.avatar_url || 
                             `https://ui-avatars.com/api/?name=${followingUser.profiles?.username?.charAt(0)}&background=random` 
                      }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                    />
                    
                    {/* User Info */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 16 }}>
                          {followingUser.profiles?.username || 'Unknown User'}
                        </Text>
                        {followingUser.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: 20, height: 18, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        ) : followingUser.profiles?.favorite_team && TEAM_LOGOS[followingUser.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[followingUser.profiles.favorite_team]} 
                            style={{ width: 20, height: 18, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </View>

                    {/* Follow/Unfollow Button */}
                    {session?.user && session.user.id !== followingUser.following_id && (
                      <TouchableOpacity
                        onPress={() => handleUserFollowToggle(followingUser.following_id, followingUser.isFollowedByCurrentUser)}
                        style={{
                          backgroundColor: followingUser.isFollowedByCurrentUser ? '#e5e5e5' : '#dc2626',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        {followingUser.isFollowedByCurrentUser ? (
                          <UserMinus size={16} color="#666" />
                        ) : (
                          <UserPlus size={16} color="#fff" />
                        )}
                        <Text style={{
                          color: followingUser.isFollowedByCurrentUser ? '#666' : '#fff',
                          fontWeight: 'bold',
                          fontSize: 14,
                          marginLeft: 4
                        }}>
                          {followingUser.isFollowedByCurrentUser ? 'Remove' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#888', fontSize: 16 }}>
                    {isOwnProfile ? 'Not following anyone yet.' : `${profile?.username || 'User'} is not following anyone yet.`}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileContainer; 