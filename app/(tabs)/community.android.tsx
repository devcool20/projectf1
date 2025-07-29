import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal.android';
import PostCard from '@/components/post-card/index.android';
import ThreadView from '@/components/community/ThreadView.android';
import { AnimatedThreadView } from '@/components/community/AnimatedThreadView.android';
import { User, Camera, X, Menu, MessageCircle, Newspaper, Clapperboard, ShoppingCart, Trophy, Bookmark, Heart, Search, MoreHorizontal, Repeat2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileModal } from '@/components/ProfileModal.android';
import { OtherUserProfileModal } from '@/components/OtherUserProfileModal';
import { useRouter, usePathname } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LockedScreen } from '@/components/auth/LockedScreen';
import RepostModal from '@/components/RepostModal';
import styles from './community.styles.android';

const { width: screenWidth } = Dimensions.get('window');

const NAV_ITEMS = [
  { href: '/community', icon: MessageCircle, name: 'Threads' },
  { href: '/news', icon: Newspaper, name: 'News' },
  { href: '/screenings', icon: Clapperboard, name: 'Screenings' },
  { href: '/shop', icon: ShoppingCart, name: 'Shop' },
  { href: '/drivers', icon: Trophy, name: 'Drivers' },
  { href: '/profile', icon: User, name: 'Profile' },
  { href: '/bookmarks', icon: Bookmark, name: 'Bookmarks' }
];

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';
const FEED_LIMIT = 15;

export default function CommunityScreen() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Main state
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [content, setContent] = useState('');
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isViewingThread, setIsViewingThread] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [adminUserId, setAdminUserId] = useState<string>('');
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarTranslateX = useSharedValue(-256);
  
  // Additional state for full functionality
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [followingThreads, setFollowingThreads] = useState<any[]>([]);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [selectedThreadForRepost, setSelectedThreadForRepost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const isCurrentUserAdmin = () => currentUserEmail === ADMIN_EMAIL;
  const isUserAdmin = (userId: string) => userId === adminUserId;

  // Sidebar functions
  const openSidebar = () => {
    sidebarTranslateX.value = withTiming(0);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    sidebarTranslateX.value = withTiming(-256);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    if (sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarTranslateX.value }],
    };
  });

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id').eq('is_admin', true);
      if (error) console.error('Error loading admin users:', error);
      if (data && data.length > 0) setAdminUserId(data[0].id);
    } catch (error) {
      console.error('Error in loadAdminUsers:', error);
    }
  };

  const fetchThreads = useCallback(async (currentSession: any, offset: number = 0, limit: number = FEED_LIMIT, isInitialLoad: boolean = true) => {
    if (loadingMore && !isInitialLoad) return;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const fetchLimitWithBuffer = limit + 1;

      // Fetch regular threads
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + fetchLimitWithBuffer - 1);

      if (threadsError) throw threadsError;

      // Fetch reposts
      const { data: repostsData, error: repostsError } = await supabase
        .from('reposts')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          repost_likes:likes!repost_id(count),
          repost_replies:repost_replies!repost_id(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + fetchLimitWithBuffer - 1);

      if (repostsError) throw repostsError;

      // Combine and process threads
      let processedThreads = threadsData.map(t => ({
        ...t,
        type: 'thread',
        uniqueId: `thread-${t.id}`,
        likeCount: t.likes[0]?.count || 0,
        replyCount: t.replies[0]?.count || 0,
      }));

      // Process reposts
      let processedReposts = repostsData.map(r => ({
        ...r,
        type: 'repost',
        uniqueId: `repost-${r.id}`,
        likeCount: r.repost_likes[0]?.count || 0,
        replyCount: r.repost_replies[0]?.count || 0,
      }));

      // Combine and sort by creation date
      let allContent = [...processedThreads, ...processedReposts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Check if there are more items
      if (allContent.length > limit) {
        allContent = allContent.slice(0, limit);
        setHasMore(true);
      } else {
        setHasMore(false);
      }

      if (currentSession) {
        // Fetch user likes for threads
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select('thread_id')
          .in('thread_id', processedThreads.map(t => t.id))
          .eq('user_id', currentSession.user.id);
        
        if (userLikesError) throw userLikesError;

        // Fetch user likes for reposts
        const { data: userRepostLikesData, error: userRepostLikesError } = await supabase
          .from('likes')
          .select('repost_id')
          .in('repost_id', processedReposts.map(r => r.id))
          .eq('user_id', currentSession.user.id);
        
        if (userRepostLikesError) throw userRepostLikesError;

        const likedThreadIds = new Set(userLikesData.map(l => l.thread_id));
        const likedRepostIds = new Set(userRepostLikesData.map(l => l.repost_id));

        allContent = allContent.map(item => ({
          ...item,
          isLiked: item.type === 'thread' ? likedThreadIds.has(item.id) : likedRepostIds.has(item.id)
        }));
      }

      if (isInitialLoad) {
        setThreads(allContent);
        setOffset(limit);
      } else {
        setThreads(prev => [...prev, ...allContent]);
        setOffset(prev => prev + limit);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [loadingMore]);

  const fetchBookmarkedThreads = useCallback(async (currentSession: any) => {
    if (!currentSession) return;
    
    try {
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select(`
          thread_id,
          threads!thread_id (
            *,
            profiles:user_id (username, avatar_url, favorite_team),
            likes:likes!thread_id(count),
            replies:replies!thread_id(count)
          )
        `)
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false });

      if (bookmarksError) throw bookmarksError;

      const processedBookmarks = bookmarksData.map(b => ({
        ...b.threads,
        type: 'thread',
        uniqueId: `thread-${b.threads.id}`,
        likeCount: b.threads.likes[0]?.count || 0,
        replyCount: b.threads.replies[0]?.count || 0,
        isBookmarked: true
      }));

      setBookmarkedThreads(processedBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  }, []);

  const searchThreads = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const processedResults = data.map(t => ({
        ...t,
        type: 'thread',
        uniqueId: `thread-${t.id}`,
        likeCount: t.likes[0]?.count || 0,
        replyCount: t.replies[0]?.count || 0,
      }));

      setSearchResults(processedResults);
    } catch (error) {
      console.error('Error searching threads:', error);
    }
  }, []);

  const handleCreateThread = async () => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    if (!content.trim() && !image) {
      Alert.alert('Error', 'Please enter some content or add an image');
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase.from('threads').insert({
        content: content.trim(),
        user_id: session.user.id,
        image_url: imageUrl
      });

      if (error) throw error;

      setContent('');
      setImage(null);
      fetchThreads(session);
    } catch (error) {
      console.error('Error creating thread:', error);
      Alert.alert('Error', 'Failed to create thread');
    }
  };

  const handleCreateModalThread = async () => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    if (!modalContent.trim() && !modalImage) {
      Alert.alert('Error', 'Please enter some content or add an image');
      return;
    }

    try {
      let imageUrl = null;
      if (modalImage) {
        imageUrl = await uploadImage(modalImage);
      }

      const { error } = await supabase.from('threads').insert({
        content: modalContent.trim(),
        user_id: session.user.id,
        image_url: imageUrl
      });

      if (error) throw error;

      setModalContent('');
      setModalImage(null);
      setShowPostModal(false);
      fetchThreads(session);
    } catch (error) {
      console.error('Error creating thread:', error);
      Alert.alert('Error', 'Failed to create thread');
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `thread-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('thread-images')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('thread-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const pickModalImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setModalImage(result.assets[0].uri);
    }
  };

  const handleThreadPress = (thread: any) => {
    setSelectedThread(thread);
    setIsViewingThread(true);
  };

  const handleCloseThread = () => {
    setIsViewingThread(false);
    setSelectedThread(null);
  };

  const handleLikeToggle = async (threadId: string, isLiked: boolean, threadType: 'thread' | 'repost' = 'thread') => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    try {
      if (threadType === 'thread') {
        if (isLiked) {
          await supabase.from('likes').delete().eq('thread_id', threadId).eq('user_id', session.user.id);
        } else {
          await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
        }
      } else {
        if (isLiked) {
          await supabase.from('likes').delete().eq('repost_id', threadId).eq('user_id', session.user.id);
        } else {
          await supabase.from('likes').insert({ repost_id: threadId, user_id: session.user.id });
        }
      }

      // Update local state
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, isLiked: !isLiked, likeCount: isLiked ? t.likeCount - 1 : t.likeCount + 1 } : t
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmarkToggle = async (threadId: string, isBookmarked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('thread_id', threadId).eq('user_id', session.user.id);
      } else {
        await supabase.from('bookmarks').insert({ thread_id: threadId, user_id: session.user.id });
      }

      // Update local state
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, isBookmarked: !isBookmarked } : t
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleDeleteThread = async (threadId: string, threadType: 'thread' | 'repost' = 'thread') => {
    Alert.alert("Delete Thread", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            if (threadType === 'thread') {
              await supabase.from('threads').delete().eq('id', threadId);
            } else {
              await supabase.from('reposts').delete().eq('id', threadId);
            }
            
            setThreads(prev => prev.filter(t => t.id !== threadId));
            
            if (selectedThread?.id === threadId) {
              setIsViewingThread(false);
              setSelectedThread(null);
            }
          } catch (error) {
            console.error("Error deleting thread:", error);
            Alert.alert("Error", "Failed to delete thread.");
          }
        }
      }
    ]);
  };

  const handleProfilePress = (userId: string) => {
    setSelectedProfile({ id: userId });
    setIsViewingProfile(true);
  };

  const handleCloseProfile = () => {
    setIsViewingProfile(false);
    setSelectedProfile(null);
  };

  const handleRepostPress = (thread: any) => {
    setSelectedThreadForRepost(thread);
    setShowRepostModal(true);
  };

  const handleRepostSuccess = (newRepost: any) => {
    setShowRepostModal(false);
    setSelectedThreadForRepost(null);
    fetchThreads(session);
  };

  const handleTabPress = (tab: 'for-you' | 'following') => {
    setActiveTab(tab);
    if (tab === 'following') {
      // Fetch following threads logic would go here
      setThreads(followingThreads);
    } else {
      fetchThreads(session);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads(session);
  }, [session, fetchThreads]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchThreads(session, offset, FEED_LIMIT, false);
    }
  }, [hasMore, loadingMore, session, fetchThreads, offset]);

  useEffect(() => {
    const setupSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
      }
      fetchThreads(session);
      loadAdminUsers();
    };

    setupSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
      }
      fetchThreads(session);
    });

    return () => subscription.unsubscribe();
  }, [fetchThreads]);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchThreads(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchThreads]);

  const renderCreateThread = () => (
    <View style={styles.createThreadContainer}>
      <View style={styles.createThreadRow}>
        <User size={40} color="gray" />
        <View style={styles.createThreadInputContainer}>
          <TextInput
            placeholder="What's happening?"
            placeholderTextColor="gray"
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            multiline
          />
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover"/>
              <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.createThreadActions}>
            <TouchableOpacity onPress={pickImage}>
              <Camera size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateThread}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={toggleSidebar}>
        <Menu size={24} color="#3a3a3a" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {showBookmarks ? 'Bookmarks' : 'Community'}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.headerButton}>
          <Search size={20} color="#3a3a3a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => session ? setShowProfileModal(true) : setShowAuth(true)} style={styles.headerButton}>
          <User size={20} color="#3a3a3a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'for-you' && styles.activeTab]}
        onPress={() => handleTabPress('for-you')}
      >
        <Text style={[styles.tabText, activeTab === 'for-you' && styles.activeTabText]}>
          For You
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'following' && styles.activeTab]}
        onPress={() => handleTabPress('following')}
      >
        <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
          Following
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    showSearch && (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search threads..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowSearch(false)}>
          <X size={20} color="gray" />
        </TouchableOpacity>
      </View>
    )
  );

  if (isViewingThread && selectedThread) {
    return (
      <ThreadView
        thread={selectedThread}
        onClose={handleCloseThread}
        session={session}
        onProfilePress={handleProfilePress}
        onRepostPress={handleRepostPress}
        onDeleteRepost={(repostId) => handleDeleteThread(repostId, 'repost')}
      />
    );
  }

  if (isViewingProfile && selectedProfile) {
    return (
      <OtherUserProfileModal
        visible={true}
        onClose={handleCloseProfile}
        userId={selectedProfile.id}
        session={session}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {renderSearchBar()}
      
      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.sidebarBackdrop}
          onPress={closeSidebar}
          activeOpacity={1}
        />
      )}
      
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
        <TouchableOpacity onPress={closeSidebar} style={styles.sidebarCloseButton}>
          <X size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.sidebarContent}>
          {NAV_ITEMS.map((item) => (
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
                  } else {
                    setShowAuth(true);
                  }
                } else if (item.href === '/community') {
                  setShowBookmarks(false);
                  setIsViewingProfile(false);
                  setSelectedProfile(null);
                  setIsViewingThread(false);
                  setSelectedThread(null);
                } else {
                  setShowBookmarks(false);
                  setIsViewingProfile(false);
                  setSelectedProfile(null);
                  setIsViewingThread(false);
                  setSelectedThread(null);
                  router.push(item.href);
                }
                closeSidebar();
              }}
              style={styles.sidebarItem}
            >
              <item.icon size={24} color="white" />
              <Text style={styles.sidebarItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.sidebarPostButton}
            onPress={() => {
              setShowPostModal(true);
              closeSidebar();
            }}
          >
            <Text style={styles.sidebarPostButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <FlatList
        data={showBookmarks ? bookmarkedThreads : (showSearch ? searchResults : threads)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleThreadPress(item)} style={styles.threadTouchable}>
            <PostCard
              username={item.profiles?.username || 'Anonymous'}
              avatarUrl={item.profiles?.avatar_url}
              content={item.content}
              imageUrl={item.image_url}
              timestamp={item.created_at}
              likes={item.likeCount || 0}
              comments={item.replyCount || 0}
              isLiked={item.isLiked}
              isBookmarked={item.isBookmarked}
              favoriteTeam={item.profiles?.favorite_team}
              userId={item.user_id}
              onCommentPress={() => handleThreadPress(item)}
              onLikePress={() => handleLikeToggle(item.id, item.isLiked, item.type)}
              onBookmarkPress={() => handleBookmarkToggle(item.id, item.isBookmarked)}
              onRepostPress={() => handleRepostPress(item)}
              onDeletePress={() => handleDeleteThread(item.id, item.type)}
              onProfilePress={handleProfilePress}
              canDelete={session && item.user_id === session.user.id}
              canAdminDelete={isCurrentUserAdmin()}
              isAdmin={isUserAdmin(item.user_id)}
              threadType={item.type}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.uniqueId || `${item.type}-${item.id}`}
        ListHeaderComponent={!showBookmarks && !showSearch ? renderCreateThread : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.loadingIndicator} /> : null}
        ListEmptyComponent={() => (
          loading ? <ActivityIndicator style={styles.loadingIndicator} /> : <Text style={styles.emptyText}>
            {showBookmarks ? 'No bookmarks yet.' : showSearch ? 'No results found.' : 'No threads yet.'}
          </Text>
        )}
      />

      {/* Modals */}
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

      <RepostModal
        visible={showRepostModal}
        onClose={() => {
          setShowRepostModal(false);
          setSelectedThreadForRepost(null);
        }}
        thread={selectedThreadForRepost}
        session={session}
        onSuccess={handleRepostSuccess}
      />

      {/* Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <X size={24} color="#3a3a3a" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Thread</Text>
            <TouchableOpacity onPress={handleCreateModalThread}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalTextInput}
              placeholder="What's happening?"
              placeholderTextColor="gray"
              value={modalContent}
              onChangeText={setModalContent}
              multiline
            />
            {modalImage && (
              <View style={styles.modalImagePreviewContainer}>
                <Image source={{ uri: modalImage }} style={styles.modalImagePreview} resizeMode="cover"/>
                <TouchableOpacity onPress={() => setModalImage(null)} style={styles.removeImageButton}>
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={pickModalImage}>
                <Camera size={24} color="#1DA1F2" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
