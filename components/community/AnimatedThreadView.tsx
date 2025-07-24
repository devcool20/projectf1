import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { formatThreadTimestamp, getResponsiveImageStyle, getCompactImageStyle, getVeryCompactImageStyle } from '@/lib/utils';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Camera, X, Trash2 } from 'lucide-react-native';
import EngagementButton from '@/components/engagement-button';
import * as ImagePicker from 'expo-image-picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
  withSpring
} from 'react-native-reanimated';
import { useEngagementStore } from './engagementStore';

const TEAM_LOGOS = {
  'ferrari': require('@/team-logos/ferrari.png'),
  'mercedes': require('@/team-logos/mercedes.png'),
  'redbull': require('@/team-logos/redbull.png'),
  'mclaren': require('@/team-logos/mclaren.png'),
  'astonmartin': require('@/team-logos/astonmartin.png'),
  'alpine': require('@/team-logos/alpine.png'),
  'williams': require('@/team-logos/williams.png'),
  'haas': require('@/team-logos/haas.png'),
  'stake': require('@/team-logos/stake.png'),
  'racingbulls': require('@/team-logos/racingbulls.png'),
  'fia': require('@/team-logos/fia.png'),
};

const ADMIN_EMAIL = 'admin@projectf1.com';

// Animated Like Button Component
const AnimatedLikeButton = ({ isLiked, likeCount, onPress }: { isLiked: boolean; likeCount: number; onPress: () => void }) => {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(isLiked ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }]
  }));

  const handlePress = () => {
    // Animate the button press
    scale.value = withSpring(0.8, { damping: 10, stiffness: 100 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    });

    // Animate the heart
    if (!isLiked) {
      heartScale.value = withSpring(1.2, { damping: 8, stiffness: 100 }, () => {
        heartScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      });
    } else {
      heartScale.value = withSpring(0, { damping: 8, stiffness: 100 });
    }

    onPress();
  };

  // Update heart scale when isLiked changes
  useEffect(() => {
    heartScale.value = withSpring(isLiked ? 1 : 0, { damping: 8, stiffness: 100 });
  }, [isLiked]);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
    >
      <Animated.View style={animatedStyle}>
        <View style={{ position: 'relative' }}>
          <Heart size={14} color="#666666" fill="none" />
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, heartAnimatedStyle]}>
            <Heart size={14} color="#dc2626" fill="#dc2626" />
          </Animated.View>
        </View>
      </Animated.View>
      {likeCount > 0 && (
        <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
          {likeCount}
        </Text>
      )}
    </TouchableOpacity>
  );
};

type AnimatedThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
  onProfilePress?: (userId: string) => void;
  onRepostPress?: (thread: any) => void;
  onThreadPress?: (threadId: string) => void;
  onThreadIdPress?: (threadId: string) => void;
  onDeleteRepost?: (repostId: string) => void;
  isVisible: boolean;
};

export function AnimatedThreadView({ 
  thread, 
  onClose, 
  session, 
  onProfilePress, 
  onRepostPress, 
  onThreadPress, 
  onThreadIdPress, 
  onDeleteRepost,
  isVisible 
}: AnimatedThreadViewProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [threadData, setThreadData] = useState(thread);
  const [adminUserId, setAdminUserId] = useState<string>('');
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [repostReplyCount, setRepostReplyCount] = useState(0);
  const replyInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const menuAnchorRef = useRef<any>(null);

  // Add state for repost delete menu
  const [repostDeleteMenuVisible, setRepostDeleteMenuVisible] = useState(false);
  const [selectedRepostForDelete, setSelectedRepostForDelete] = useState<string | null>(null);
  const [repostMenuPos, setRepostMenuPos] = useState({ top: 0, left: 0 });

  // Add state for repost modal
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [selectedThreadForRepost, setSelectedThreadForRepost] = useState<any>(null);

  // Add state for current user's profile avatar
  const [currentUserProfile, setCurrentUserProfile] = useState<{ avatar_url?: string } | null>(null);

  // Add state for image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { width: screenWidth } = Dimensions.get('window');
  
  // Animation values
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const { setReplyCount } = useEngagementStore();

  // Helper to detect mobile web
  function isMobileWeb() {
    if (Platform.OS !== 'web') return false;
    if (typeof navigator !== 'undefined') {
      return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    }
    return false;
  }

  const isVerySmallMobileWeb = isMobileWeb() && screenWidth < 400;

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL;
  };

  const isUserAdmin = (userId: string) => {
    return adminUserId === userId;
  };

  const loadAdminUsers = async () => {
    try {
      const { data: adminData, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1);

      if (!error && adminData && adminData.length > 0) {
        setAdminUserId(adminData[0].id);
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  // Animation styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        opacity.value,
        [0, 1],
        [0, 0.5],
        Extrapolate.CLAMP
      ),
    };
  });

  // Handle animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Slide in from right with better timing
      translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
    } else {
      // Slide out to right
      translateX.value = withTiming(screenWidth, { duration: 200, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.95, { duration: 200, easing: Easing.in(Easing.cubic) });
    }
  }, [isVisible, screenWidth]);

  const handleCloseWithAnimation = useCallback(() => {
    // Start exit animation with better timing
    translateX.value = withTiming(screenWidth, { duration: 200, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.95, { duration: 200, easing: Easing.in(Easing.cubic) }, () => {
      // Call onClose after animation completes
      runOnJS(onClose)();
    });
  }, [translateX, opacity, scale, screenWidth, onClose]);

  // Fix fetchReplies to handle reposts and threads correctly
  const fetchReplies = useCallback(async () => {
    if (!thread) return;
    try {
      setLoadingReplies(true);
      let repliesData = [];
      let error = null;
      if (thread.type === 'repost') {
        // Fetch from repost_replies for reposts
        const { data, error: err } = await supabase
          .from('repost_replies')
          .select(`*, profiles:user_id (username, avatar_url, favorite_team, is_admin)`)
          .eq('repost_id', thread.id)
          .order('created_at', { ascending: true });
        repliesData = data || [];
        error = err;
      } else {
        // Fetch from replies for threads
        const { data, error: err } = await supabase
          .from('replies')
          .select(`*, profiles:user_id (username, avatar_url, favorite_team, is_admin)`)
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: true });
        repliesData = data || [];
        error = err;
      }
      if (error) throw error;
      // Check if user liked each reply and get like counts
      const repliesWithLikes = await Promise.all(
        repliesData.map(async (reply) => {
          let isLiked = false;
          let likeCount = 0;
          if (session) {
            if (thread.type === 'repost') {
              // Check repost_reply_likes
              const { data: likeData } = await supabase
                .from('repost_reply_likes')
                .select('id')
                .eq('repost_reply_id', reply.id)
                .eq('user_id', session.user.id);
              isLiked = likeData && likeData.length > 0;
              // Get like count for this repost reply
              const { count } = await supabase
                .from('repost_reply_likes')
                .select('*', { count: 'exact', head: true })
                .eq('repost_reply_id', reply.id);
              likeCount = count || 0;
            } else {
              // Check reply_likes
              const { data: likeData } = await supabase
                .from('reply_likes')
                .select('id')
                .eq('reply_id', reply.id)
                .eq('user_id', session.user.id);
              isLiked = likeData && likeData.length > 0;
              // Get like count for this reply
              const { count } = await supabase
                .from('reply_likes')
                .select('*', { count: 'exact', head: true })
                .eq('reply_id', reply.id);
              likeCount = count || 0;
            }
          }
          return { ...reply, isLiked, likeCount };
        })
      );
      setReplies(repliesWithLikes);
      if (thread.type === 'repost') {
        setRepostReplyCount(repliesWithLikes.length);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [thread, session]);

  // In fetchThreadData, always check bookmarks using thread_id = thread.id
  const fetchThreadData = async () => {
    if (!thread) return;
    try {
      const { data: threadData, error } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .eq('id', thread.id)
        .single();
      if (error) throw error;
      // Check if user liked this thread
      let isLiked = false;
      if (session) {
        const { data: userLikeData } = await supabase
          .from('likes')
          .select('thread_id')
          .eq('thread_id', thread.id)
          .eq('user_id', session.user.id)
          .single();
        isLiked = !!userLikeData;
      }
      // Check if user bookmarked this thread or repost (always use bookmarks.thread_id)
      let isBookmarked = false;
      if (session) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('thread_id')
          .eq('thread_id', thread.id)
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
      };
      setThreadData(threadWithStatus);
    } catch (error) {
      console.error('Error fetching thread data:', error);
    }
  };

  useEffect(() => {
    setThreadData(thread);
    if (thread) {
      // Load replies in the background without blocking the UI
      setTimeout(() => {
        fetchReplies();
      }, 100);
      // Don't fetch thread data again since it's already passed from parent
    }
    loadAdminUsers();
  }, [thread, fetchReplies]);

  // In handleLikeToggle, use reply_likes for thread replies and repost_reply_likes for repost replies
  const handleLikeToggle = async (replyId: string, isLiked: boolean, isRepostReply: boolean = false) => {
    if (!session) return;
    try {
      if (threadData.type === 'repost' || isRepostReply) {
        if (isLiked) {
          const { error } = await supabase
            .from('repost_reply_likes')
            .delete()
            .eq('repost_reply_id', replyId)
            .eq('user_id', session.user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('repost_reply_likes')
            .insert({ repost_reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        }
      } else {
        if (isLiked) {
          const { error } = await supabase
            .from('reply_likes')
            .delete()
            .eq('reply_id', replyId)
            .eq('user_id', session.user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('reply_likes')
            .insert({ reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        }
      }
      setReplies(prev => prev.map(reply => 
        reply.id === replyId ? { 
          ...reply, 
          isLiked: !isLiked,
          likeCount: isLiked ? Math.max(0, (reply.likeCount || 1) - 1) : (reply.likeCount || 0) + 1
        } : reply
      ));
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  // Handle thread like toggle
  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean, isRepost: boolean = false) => {
    if (!session) return;
    try {
      if (isRepost) {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
            .match({ repost_id: threadId, user_id: session.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
            .insert({ repost_id: threadId, user_id: session.user.id });
        if (error) throw error;
      }
      } else {
        if (isLiked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .match({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
        } else {
          const { error } = await supabase
            .from('likes')
            .insert({ thread_id: threadId, user_id: session.user.id });
        if (error) throw error;
        }
      }
      // Update local state
      setThreadData(prev => prev ? {
        ...prev,
        isLiked: !isLiked,
        likeCount: isLiked ? (prev.likeCount || 1) - 1 : (prev.likeCount || 0) + 1
      } : prev);
    } catch (error) {
      console.error('Error toggling thread like:', error);
    }
  };

  // --- Fix handlePostReply for reposts ---
  const handlePostReply = async () => {
    if (!session || !threadData || (!newReply.trim() && !replyImage)) return;
    try {
      let imageUrl = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }
      let replyData, error;
      if (threadData.type === 'repost') {
        // Insert into repost_replies
        ({ data: replyData, error } = await supabase
          .from('repost_replies')
          .insert({
            repost_id: threadData.id,
            user_id: session.user.id,
            content: newReply.trim(),
            image_url: imageUrl
          })
          .select()
          .single());
      } else {
        // Insert into replies
        ({ data: replyData, error } = await supabase
          .from('replies')
          .insert({
            thread_id: threadData.id,
            user_id: session.user.id,
            content: newReply.trim(),
            image_url: imageUrl
          })
          .select()
          .single());
      }
      if (error) throw error;
      // Add the new reply to the list
      const newReplyWithProfile = {
        ...replyData,
        profiles: {
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Anonymous',
          avatar_url: session.user.user_metadata?.avatar_url,
          favorite_team: null,
          is_admin: false
        },
        isLiked: false
      };
      setReplies(prev => [...prev, newReplyWithProfile]);
      setNewReply('');
      setReplyImage(null);
      // Update thread/repost reply count
      setThreadData(prev => prev ? {
        ...prev,
        replyCount: (prev.replyCount || 0) + 1
      } : prev);
      setReplyCount(threadData.id, (threadData.replyCount || 0) + 1);
      setRepostReplyCount((prev) => threadData.type === 'repost' ? (prev || 0) + 1 : prev);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      await fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    }
  };
  // --- Add handleDeleteReply for both threads and reposts ---
  const handleDeleteReply = async (replyId: string) => {
    if (!session || !threadData) return;
    try {
      let error;
      if (threadData.type === 'repost') {
        ({ error } = await supabase.from('repost_replies').delete().eq('id', replyId));
        if (error) throw error;
        setRepostReplyCount((prev) => (prev || 1) - 1);
      } else {
        ({ error } = await supabase.from('replies').delete().eq('id', replyId));
        if (error) throw error;
      }
      setReplies(prev => prev.filter(r => r.id !== replyId));
      setThreadData(prev => prev ? {
        ...prev,
        replyCount: (prev.replyCount || 1) - 1
      } : prev);
      setReplyCount(threadData.id, (threadData.replyCount || 1) - 1);
      await fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      Alert.alert('Error', 'Failed to delete reply');
    }
  };
  // In handleBookmarkToggle, always use bookmarks table and thread_id = threadData.id
  const handleBookmarkToggle = async () => {
    if (!session || !threadData) return;
    try {
      const threadIdToBookmark = threadData.id;
      if (threadData.isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('thread_id', threadIdToBookmark)
          .eq('user_id', session.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ thread_id: threadIdToBookmark, user_id: session.user.id });
        if (error) {
          if (error.code === '23505') {
            setThreadData(prev => prev ? { ...prev, isBookmarked: true } : prev);
            return;
          }
          throw error;
        }
      }
      setThreadData(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : prev);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  // Handle image picker for replies
  const pickReplyImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReplyImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Upload reply image
  const uploadReplyImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `reply-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Handle reply to specific user
  const handleReplyTo = (username: string) => {
    setNewReply(`@${username} `);
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 100);
  };

  // Handle repost delete menu
  const openRepostDeleteMenu = (repostId: string, event: any) => {
    setSelectedRepostForDelete(repostId);
    if (event && event.nativeEvent) {
      const { pageX, pageY } = event.nativeEvent;
      setRepostMenuPos({ top: pageY + 20, left: pageX - 60 });
    } else {
      setRepostMenuPos({ top: 100, left: 200 });
    }
    setRepostDeleteMenuVisible(true);
  };

  // Fetch current user's profile on mount
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setCurrentUserProfile(data);
        } else {
          setCurrentUserProfile(null);
        }
      } catch (err) {
        setCurrentUserProfile(null);
        console.error('Error fetching current user profile:', err);
      }
    };
    fetchCurrentUserProfile();
  }, [session]);

  // Add a helper to get image style based on aspect ratio
  function getReplyImageStyle(width: number, height: number, screenWidth: number) {
    if (width > height) {
      // Landscape
      const maxWidth = Math.min(screenWidth - 32, 320);
      const aspectRatio = width / height;
      return {
        width: maxWidth,
        height: maxWidth / aspectRatio,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f3f4f6',
        // alignSelf: 'center', // Remove centering
      };
    } else {
      // Portrait
      const maxHeight = 320;
      const aspectRatio = width / height;
      return {
        width: maxHeight * aspectRatio,
        height: maxHeight,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f3f4f6',
        // alignSelf: 'center', // Remove centering
      };
    }
  }

  if (!thread || !threadData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 40, left: 20, padding: 8 }}>
          <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 18 }}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', marginTop: 60 }}>This thread is not available.</Text>
      </View>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
            zIndex: 999,
          },
          backdropStyle
        ]}
        onTouchEnd={handleCloseWithAnimation}
      />
      
      {/* Thread View */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: isMobileWeb() ? '100%' : 600,
            backgroundColor: '#ffffff',
            zIndex: 1000,
            shadowColor: '#000000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          },
          animatedStyle
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e5e5',
            backgroundColor: '#ffffff'
          }}>
            <TouchableOpacity onPress={handleCloseWithAnimation} style={{ marginRight: 16 }}>
              <ArrowLeft size={28} color="#3a3a3a" />
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#3a3a3a' }}>
              Thread
            </Text>
          </View>

          {/* Content */}
          <ScrollView 
            ref={scrollViewRef}
            style={{ flex: 1, backgroundColor: '#ffffff' }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Thread Content */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
              {threadData?.type === 'repost' ? (
                <View>
                  {/* Repost content */}
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                      onPress={() => onProfilePress?.(threadData.user_id)}
                      style={{ marginRight: 12 }}
                    >
                      <Image
                        source={{ 
                          uri: threadData.profiles?.avatar_url || 
                               `https://ui-avatars.com/api/?name=${threadData.profiles?.username?.charAt(0) || 'U'}&background=random` 
                        }}
                        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
                      />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      {/* Repost user info */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
                          {threadData.profiles?.username || 'Unknown User'}
                        </Text>
                        {threadData.profiles?.is_admin ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: 24, height: 22, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        ) : threadData.profiles?.favorite_team && TEAM_LOGOS[threadData.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[threadData.profiles.favorite_team]} 
                            style={{ width: 24, height: 22, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>
                          {formatThreadTimestamp(threadData.created_at)}
                        </Text>
                      </View>

                      {/* Repost content */}
                      {threadData.content && (
                        <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                          {threadData.content}
                        </Text>
                      )}

                      {/* Repost image */}
                      {threadData.image_url && (
                        <TouchableOpacity onPress={() => setPreviewImageUrl(threadData.image_url)}>
                          <Image
                            source={{ uri: threadData.image_url }}
                            style={getResponsiveImageStyle(screenWidth)}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}

                      {/* Original thread preview */}
                      {threadData.original_thread && (
                        <TouchableOpacity 
                          onPress={() => onThreadIdPress?.(threadData.original_thread_id)}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e5e5',
                            borderRadius: 12,
                            padding: 12,
                            backgroundColor: '#f8f9fa',
                            marginTop: 16
                          }}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Image
                              source={{ 
                                uri: threadData.original_thread?.profiles?.avatar_url || 
                                     `https://ui-avatars.com/api/?name=${threadData.original_thread?.profiles?.username?.charAt(0) || 'U'}&background=random` 
                              }}
                              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 13 }}>
                                {threadData.original_thread?.profiles?.username || 'Unknown User'}
                              </Text>
                              <Text style={{ color: '#1a1a1a', fontSize: 12, lineHeight: 16 }}>
                                {threadData.original_thread?.content}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Engagement buttons for repost */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 60 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <EngagementButton
                        icon={Heart}
                        active={threadData.isLiked || false}
                        onPress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked || false, true)}
                        type="like"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        {threadData.likeCount || 0}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <EngagementButton
                        icon={MessageCircle}
                        active={false}
                        onPress={() => {}}
                        type="comment"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        {repostReplyCount || 0}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      onPress={() => onRepostPress?.(threadData)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                    >
                      <EngagementButton
                        icon={Repeat2}
                        active={false}
                        onPress={() => onRepostPress?.(threadData)}
                        type="repost"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        0
                      </Text>
                    </TouchableOpacity>

                    {/* In the engagement bar for reposts (threadData.type === 'repost'), remove the EngagementButton for bookmark.
                        Only show Like, Comment, and Repost icons for reposts. */}
                  </View>
                </View>
              ) : (
                <View>
                  {/* Regular thread content */}
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                      onPress={() => onProfilePress?.(threadData.user_id)}
                      style={{ marginRight: 12 }}
                    >
                      <Image
                        source={{ 
                          uri: threadData.profiles?.avatar_url || 
                               `https://ui-avatars.com/api/?name=${threadData.profiles?.username?.charAt(0) || 'U'}&background=random` 
                        }}
                        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' }}
                      />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 15 }}>
                          {threadData.profiles?.username || 'Unknown User'}
                        </Text>
                        {threadData.profiles?.is_admin ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: 24, height: 22, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        ) : threadData.profiles?.favorite_team && TEAM_LOGOS[threadData.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[threadData.profiles.favorite_team]} 
                            style={{ width: 24, height: 22, marginLeft: 4 }}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>
                          {formatThreadTimestamp(threadData.created_at)}
                        </Text>
                      </View>

                      <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                        {threadData.content}
                      </Text>

                      {threadData.image_url && (
                        <TouchableOpacity onPress={() => setPreviewImageUrl(threadData.image_url)}>
                          <Image
                            source={{ uri: threadData.image_url }}
                            style={getResponsiveImageStyle(screenWidth)}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Engagement buttons for regular thread */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 60 }}>
                    {/* Like */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <EngagementButton
                        icon={Heart}
                        active={threadData.isLiked || false}
                        onPress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked || false, false)}
                        type="like"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        {threadData.likeCount || 0}
                      </Text>
                    </View>
                    {/* Comment */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <EngagementButton
                        icon={MessageCircle}
                        active={false}
                        onPress={() => {}}
                        type="comment"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        {threadData.replyCount || 0}
                      </Text>
                    </View>
                    {/* Repost */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <EngagementButton
                        icon={Repeat2}
                        active={false}
                      onPress={() => onRepostPress?.(threadData)}
                        type="repost"
                        size={14}
                      />
                      <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                        0
                      </Text>
                    </View>
                    {/* Bookmark */}
                    <EngagementButton
                      icon={Bookmark}
                      active={threadData.isBookmarked || false}
                      onPress={handleBookmarkToggle}
                      type="bookmark"
                      size={14}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Reply Input */}
            {session && (
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Image
                    source={{
                      uri: currentUserProfile?.avatar_url || session?.user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${session?.user?.user_metadata?.username?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}&background=random`
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <TextInput
                      ref={replyInputRef}
                      placeholder="Post your reply..."
                      value={newReply}
                      onChangeText={setNewReply}
                      multiline
                      style={{
                        fontSize: 16,
                        color: '#000000',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        backgroundColor: '#f8f9fa',
                        borderWidth: 1,
                        borderColor: '#e5e5e5',
                        minHeight: 40,
                        maxHeight: 120,
                      }}
                    />
                    {replyImage && (
                      <View style={{ position: 'relative', marginTop: 8 }}>
                        <Image
                          source={{ uri: replyImage }}
                          style={{ width: '100%', height: 150, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          onPress={() => setReplyImage(null)}
                          style={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            backgroundColor: 'rgba(0,0,0,0.6)', 
                            borderRadius: 12, 
                            width: 24, 
                            height: 24, 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <TouchableOpacity onPress={pickReplyImage}>
                        <Camera size={20} color="#1DA1F2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handlePostReply}
                        style={{ 
                          backgroundColor: '#dc2626', 
                          borderRadius: 20, 
                          paddingVertical: 8, 
                          paddingHorizontal: 16,
                          opacity: (!newReply.trim() && !replyImage) ? 0.5 : 1
                        }}
                        disabled={!newReply.trim() && !replyImage}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                          Reply
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Replies */}
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              {loadingReplies && replies.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <ActivityIndicator size="small" color="#666666" />
                  <Text style={{ marginTop: 8, color: '#666666', fontSize: 12 }}>
                    Loading replies...
                  </Text>
                </View>
              ) : replies.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#666666' }}>
                  No replies yet. Be the first to reply!
                </Text>
              ) : (
                replies.map((reply) => (
                  <View key={reply.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <Image
                      source={{ 
                        uri: reply.profiles?.avatar_url || 
                             `https://ui-avatars.com/api/?name=${reply.profiles?.username?.charAt(0) || 'U'}&background=random` 
                      }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 14 }}>
                          {reply.profiles?.username || 'Unknown User'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                          {formatThreadTimestamp(reply.created_at)}
                        </Text>
                      </View>
                      <Text style={{ color: '#000', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
                        {reply.content}
                      </Text>
                      {reply.image_url && (
                        <ReplyImageResponsive uri={reply.image_url} screenWidth={screenWidth} />
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {/* Like */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                          <EngagementButton
                            icon={Heart}
                            active={reply.isLiked || false}
                            onPress={() => handleLikeToggle(reply.id, reply.isLiked, threadData.type === 'repost')}
                            type="like"
                            size={14}
                            accessibilityLabel="Like reply"
                        />
                          <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 12, minWidth: 16, textAlign: 'left' }}>{reply.likeCount || 0}</Text>
                        </View>
                        {/* Comment */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                          <EngagementButton
                            icon={MessageCircle}
                            active={false}
                            onPress={() => handleReplyTo(reply.profiles?.username || 'user')}
                            type="comment"
                            size={14}
                            accessibilityLabel="Reply"
                          />
                        </View>
                        {/* Delete */}
                        {reply.user_id === session?.user?.id || isCurrentUserAdmin() ? (
                          <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={{ marginLeft: 8 }}>
                            <Trash2 size={14} color="#dc2626" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {previewImageUrl && (
        <Modal
          visible={!!previewImageUrl}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImageUrl(null)}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setPreviewImageUrl(null)}>
            <Image
              source={{ uri: previewImageUrl }}
              style={{ width: '90%', height: '70%', borderRadius: 16, resizeMode: 'contain' }}
            />
            <TouchableOpacity onPress={() => setPreviewImageUrl(null)} style={{ position: 'absolute', top: 60, right: 30, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 }}>
              <X size={32} color="#fff" />
            </TouchableOpacity>
          </Pressable>
        </Modal>
      )}
    </>
  );
} 

function ReplyImageResponsive({ uri, screenWidth }: { uri: string, screenWidth: number }) {
  // On web, Image.getSize is not supported, so use default style
  if (Platform.OS === 'web') {
    return (
      <Image
        source={{ uri }}
        style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 8, backgroundColor: '#f3f4f6', objectFit: 'contain', alignSelf: 'flex-start', marginLeft: 0, marginTop: 0 }}
        resizeMode="contain"
      />
    );
  }
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (uri) {
      Image.getSize(
        uri,
        (width, height) => {
          if (isMounted) setDimensions({ width, height });
        },
        () => {
          if (isMounted) setDimensions(null);
        }
      );
    }
    return () => {
      isMounted = false;
    };
  }, [uri]);

  if (!dimensions) {
    return (
      <Image
        source={{ uri }}
        style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8, backgroundColor: '#f3f4f6', alignSelf: 'flex-start', marginLeft: 0, marginTop: 0 }}
        resizeMode="cover"
      />
    );
  }
  const style = { ...getReplyImageStyle(dimensions.width, dimensions.height, screenWidth), alignSelf: 'flex-start', marginLeft: 0, marginTop: 0 };
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
    />
  );
} 