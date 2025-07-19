import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart, Camera, X, MessageCircle, Repeat2, BarChart3, MoreHorizontal } from 'lucide-react-native';
import PostCard from '../PostCard';
import * as ImagePicker from 'expo-image-picker';
import { formatThreadTimestamp } from '@/lib/utils';

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

type ThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
  onProfilePress?: (userId: string) => void;
  onRepostPress?: (thread: any) => void;
  onThreadPress?: (threadId: string) => void;
  onThreadIdPress?: (threadId: string) => void;
  onDeleteRepost?: (repostId: string) => void;
};

export function ThreadView({ thread, onClose, session, onProfilePress, onRepostPress, onThreadPress, onThreadIdPress, onDeleteRepost }: ThreadViewProps) {
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

  const { width: screenWidth } = Dimensions.get('window');
  
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
        backgroundColor: '#f3f4f6'
      };
    }
    return {
      width: 280,
      height: 200,
      borderRadius: 12,
      backgroundColor: '#f3f4f6'
    };
  };
  
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

  const fetchReplies = useCallback(async () => {
    if (!thread) return;
    setLoadingReplies(true);
    try {
      let data;
      let error;

      if (threadData?.type === 'repost') {
        // For reposts, fetch from repost_replies table
        const { data: repostRepliesData, error: repostRepliesError } = await supabase
          .from('repost_replies')
          .select('*')
          .eq('repost_id', thread.id)
          .order('created_at', { ascending: true });
        
        if (repostRepliesError) throw repostRepliesError;
        
        // Fetch profiles data separately for repost replies
        if (repostRepliesData && repostRepliesData.length > 0) {
          const userIds = repostRepliesData.map(reply => reply.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, favorite_team')
            .in('id', userIds);
          
          if (profilesError) throw profilesError;
          
          // Combine the data
          const profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          
          data = repostRepliesData.map(reply => ({
            ...reply,
            profiles: profilesMap[reply.user_id]
          }));
        } else {
          data = [];
        }
        
        // Update the repost reply count
        setRepostReplyCount(repostRepliesData?.length || 0);
        
        error = null;
      } else {
        // For regular threads, fetch from replies table
        const { data: threadRepliesData, error: threadRepliesError } = await supabase
          .from('replies')
          .select(`
            *,
            profiles:user_id (username, avatar_url, favorite_team)
          `)
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: true });
        
        data = threadRepliesData;
        error = threadRepliesError;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        // For repost replies, we need to handle likes differently since they're in a different table
        if (threadData?.type === 'repost') {
          // Fetch likes for repost replies from repost_reply_likes table
          if (data && data.length > 0) {
            const { data: likesData, error: likesError } = await supabase
              .from('repost_reply_likes')
              .select('repost_reply_id')
              .in('repost_reply_id', data.map(r => r.id));
            
            if (likesError) throw likesError;

            const likeCountMap = likesData.reduce((acc: any, like: any) => {
              acc[like.repost_reply_id] = (acc[like.repost_reply_id] || 0) + 1;
              return acc;
            }, {});

            if (session) {
              const { data: userLikesData, error: userLikesError } = await supabase
                .from('repost_reply_likes')
                .select('repost_reply_id')
                .in('repost_reply_id', data.map(r => r.id))
                .eq('user_id', session.user.id);
              
              if (userLikesError) throw userLikesError;

              const likedReplyIds = new Set(userLikesData.map(l => l.repost_reply_id));
              
              const repliesWithStatus = data.map(r => ({
                ...r,
                isLiked: likedReplyIds.has(r.id),
                likeCount: likeCountMap[r.id] || 0,
              }));
              setReplies(repliesWithStatus);
            } else {
              const repliesWithCounts = data.map(r => ({
                ...r,
                likeCount: likeCountMap[r.id] || 0,
              }));
              setReplies(repliesWithCounts);
            }
          } else {
            setReplies([]);
          }
        } else {
          // For regular thread replies, use the existing likes system
          const { data: likesData, error: likesError } = await supabase
            .from('likes')
            .select('reply_id')
            .in('reply_id', data.map(r => r.id));
          
          if (likesError) throw likesError;

          const likeCountMap = likesData.reduce((acc: any, like: any) => {
            acc[like.reply_id] = (acc[like.reply_id] || 0) + 1;
            return acc;
          }, {});

          if (session) {
            const { data: userLikesData, error: userLikesError } = await supabase
              .from('likes')
              .select('reply_id')
              .in('reply_id', data.map(r => r.id))
              .eq('user_id', session.user.id);
            
            if (userLikesError) throw userLikesError;

            const likedReplyIds = new Set(userLikesData.map(l => l.reply_id));
            
            const repliesWithStatus = data.map(r => ({
              ...r,
              isLiked: likedReplyIds.has(r.id),
              likeCount: likeCountMap[r.id] || 0,
            }));
            setReplies(repliesWithStatus);
          } else {
            const repliesWithCounts = data.map(r => ({
              ...r,
              likeCount: likeCountMap[r.id] || 0,
            }));
            setReplies(repliesWithCounts);
          }
        }
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [thread]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  // Fetch current view count when component mounts
  useEffect(() => {
    const fetchViewCount = async () => {
      if (thread) {
        try {
          const { count, error } = await supabase
            .from('thread_views')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);
          
          if (!error && count !== null) {
            setThreadData(prev => prev ? { ...prev, view_count: count } : prev);
          }
        } catch (error) {
          console.error('Error fetching view count:', error);
        }
      }
    };
    
    fetchViewCount();
  }, [thread]);

  useEffect(() => {
    setThreadData(thread);

    // Debug: Log thread data for reposts
    if (thread && thread.type === 'repost') {
      console.log('DEBUG - ThreadView received repost:', {
        id: thread.id,
        original_thread_id: thread.original_thread_id,
        original_thread_exists: !!thread.original_thread,
        original_thread_image: thread.original_thread?.image_url,
        original_thread_content: thread.original_thread?.content
      });
    }

    // Scroll to top when thread changes
    if (thread && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 300);
    }
  }, [thread]);

  // Additional effect to ensure scroll to top on mount
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, []);

  // Force scroll to top when thread data is set
  useEffect(() => {
    if (threadData && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 200);
    }
  }, [threadData]);

  useEffect(() => {
    // Load admin users from database
    loadAdminUsers();
  }, []);



  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session?.user) {
      console.log('No session, cannot like reply');
      return;
    }

    // Optimistic update
    setReplies(prevReplies => prevReplies.map(r => {
      if (r.id === replyId) {
        const newLikeCount = isLiked ? r.likeCount - 1 : r.likeCount + 1;
        return { ...r, isLiked: !isLiked, likeCount: newLikeCount };
      }
      return r;
    }));

    try {
      if (threadData?.type === 'repost') {
        // Handle likes for repost replies
        if (isLiked) {
          const { error } = await supabase.from('repost_reply_likes').delete().match({ repost_reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('repost_reply_likes').insert({ repost_reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        }
      } else {
        // Handle likes for regular thread replies
        if (isLiked) {
          const { error } = await supabase.from('likes').delete().match({ reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('likes').insert({ reply_id: replyId, user_id: session.user.id });
          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setReplies(prevReplies => prevReplies.map(r => {
        if (r.id === replyId) {
          const revertedLikeCount = isLiked ? r.likeCount + 1 : r.likeCount - 1;
          return { ...r, isLiked: isLiked, likeCount: revertedLikeCount };
        }
        return r;
      }));
      Alert.alert('Failed to update like');
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session?.user) {
      console.log('No session, cannot like thread');
      return;
    }

    // Check if this is a repost or regular thread
    const isRepost = threadData?.type === 'repost';

    // Optimistic update
    setThreadData(prevThread => ({
      ...prevThread,
      isLiked: !isLiked,
      likeCount: isLiked ? prevThread.likeCount - 1 : prevThread.likeCount + 1
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
      console.error('Error toggling thread like:', error);
      // Revert optimistic update on error
      setThreadData(prevThread => ({
        ...prevThread,
        isLiked: isLiked,
        likeCount: isLiked ? prevThread.likeCount + 1 : prevThread.likeCount - 1
      }));
      Alert.alert('Failed to update like');
    }
  };

  // Bookmark toggle logic
  const handleBookmarkToggle = async () => {
    if (!session?.user) {
      Alert.alert('Please log in to bookmark threads.');
      return;
    }
    try {
      if (threadData.isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('thread_id', threadData.id)
          .eq('user_id', session.user.id);
        if (error) throw error;
        setThreadData((prev) => ({ ...prev, isBookmarked: false }));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ thread_id: threadData.id, user_id: session.user.id });
        if (error) throw error;
        setThreadData((prev) => ({ ...prev, isBookmarked: true }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Failed to update bookmark');
    }
  };

  const pickReplyImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReplyImage(result.assets[0].uri);
    }
  };

  const uploadReplyImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = uri.split('/').pop();
      const fileExt = fileName?.split('.').pop();

      const filePath = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('reply-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reply-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading reply image:', error);
      throw error;
    }
  };

  const handlePostReply = async () => {
    if (!thread || (!newReply.trim() && !replyImage)) return;
    if (!session?.user) {
      console.log('No session, cannot post reply');
      return;
    }



    try {
      let imageUrl: string | null = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }

      // For reposts, use the repost_replies table
      if (threadData.type === 'repost') {
        const { error } = await supabase.from('repost_replies').insert({
          content: newReply.trim(),
          repost_id: thread.id,
          user_id: session.user.id, // This should reference profiles.id
          image_url: imageUrl,
        });
        if (error) throw error;
      } else {
        // For regular threads, use the replies table
        const { error } = await supabase.from('replies').insert({
          content: newReply.trim(),
          thread_id: thread.id,
          user_id: session.user.id,
          image_url: imageUrl,
        });
        if (error) throw error;
      }

      setNewReply('');
      setReplyImage(null);
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Failed to post reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      if (threadData?.type === 'repost') {
        // Delete from repost_replies table
        const { error } = await supabase.from('repost_replies').delete().eq('id', replyId);
        if (error) throw error;
      } else {
        // Delete from replies table
        const { error } = await supabase.from('replies').delete().eq('id', replyId);
        if (error) throw error;
      }
      await fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      Alert.alert('Failed to delete reply');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    const isRepost = threadData?.type === 'repost';
    const itemType = isRepost ? 'repost' : 'thread';
    
    Alert.alert(
      `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
      `Are you sure you want to delete this ${itemType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isRepost) {
                // Delete repost
                const { error } = await supabase.from('reposts').delete().eq('id', threadId);
                if (error) throw error;
              } else {
                // Delete regular thread
                const { error } = await supabase.from('threads').delete().eq('id', threadId);
                if (error) throw error;
              }
              onClose();
            } catch (error) {
              console.error(`Error deleting ${itemType}:`, error);
              Alert.alert('Error', `Failed to delete ${itemType}`);
            }
          },
        },
      ]
    );
  };

  const handleReplyTo = (username: string) => {
    setNewReply(`@${username} `);
    // Focus the input after a small delay to ensure the text is set
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    onClose();
  };

  const openDeleteMenu = () => {
    // Use a fixed position instead of measuring to avoid positioning issues
    setMenuPos({ top: 100, left: 200 });
    setDeleteMenuVisible(true);
  };

  if (!thread) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </View>
    );
  }

  const USERNAME_FONT_SIZE = 18;

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <ArrowLeft size={28} color="#3a3a3a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} selectable={false}>Thread</Text>
      </View>

      {/* Scrollable Content Wrapper */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          indicatorStyle="default"
          scrollIndicatorInsets={{ right: 1 }}
          nestedScrollEnabled={true}
          alwaysBounceVertical={true}
          automaticallyAdjustContentInsets={false}
          contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        >
          {/* Main Post */}
          <View style={[styles.postContainer, isVerySmallMobileWeb && { alignItems: 'flex-start', paddingLeft: 0, paddingRight: 0, marginLeft: -8 }]}> {/* <-- left shift only for mobile web */}
            {threadData.type === 'repost' ? (
              <View>
                {/* Custom repost display without views and bookmarks icons */}
                <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                      onPress={() => onProfilePress?.(threadData.user_id)}
                      style={{ marginRight: 12 }}
                    >
                      <Image
                        source={{ 
                          uri: threadData.profiles?.avatar_url || 
                               `https://ui-avatars.com/api/?name=${threadData.profiles?.username?.charAt(0)}&background=random` 
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
                        {threadData.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
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

                      {/* Repost's own image */}
                      {threadData.image_url && (
                        <Image
                          source={{ uri: threadData.image_url }}
                          style={{ 
                            width: screenWidth < 400 ? screenWidth - 80 : 280, 
                            height: screenWidth < 400 ? ((screenWidth - 80) * 200) / 280 : 200, 
                            borderRadius: 12,
                            marginBottom: 12,
                            backgroundColor: '#f3f4f6'
                          }}
                          resizeMode="cover"
                        />
                      )}

                      {/* Original thread preview - inline with repost */}
                      {threadData.original_thread && (
                        <TouchableOpacity 
                          onPress={() => {
                            // Navigate to the original thread directly
                            if (onThreadIdPress) {
                              onThreadIdPress(threadData.original_thread_id);
                            }
                          }}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e5e5',
                            borderRadius: 12,
                            padding: 12,
                            backgroundColor: '#f8f9fa',
                            marginTop: 12
                          }}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Image
                              source={{ 
                                uri: threadData.original_thread?.profiles?.avatar_url || 
                                     `https://ui-avatars.com/api/?name=${threadData.original_thread?.profiles?.username?.charAt(0)}&background=random` 
                              }}
                              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                            />
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 13 }}>
                                  {threadData.original_thread?.profiles?.username || 'Unknown User'}
                                </Text>
                              </View>
                              <Text style={{ color: '#1a1a1a', fontSize: 12, lineHeight: 16 }}>
                                {threadData.original_thread?.content}
                              </Text>
                              {threadData.original_thread?.image_url && (
                                <Image
                                  source={{ uri: threadData.original_thread.image_url }}
                                  style={{ 
                                    width: screenWidth < 400 ? screenWidth - 80 : 280, 
                                    height: screenWidth < 400 ? ((screenWidth - 80) * 200) / 280 : 200, 
                                    borderRadius: 12,
                                    marginTop: 4,
                                    backgroundColor: '#f3f4f6'
                                  }}
                                  resizeMode="cover"
                                />
                              )}
                              {/* Show original thread views */}
                              <Text style={{ color: '#666666', fontSize: 11, marginTop: 4 }}>
                                {threadData.original_thread?.view_count || 0} views
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Engagement bar - moved below preview for reposts */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginHorizontal: 16 }}>
                  {/* Comments */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                    <MessageCircle size={14} color="#666666" />
                    <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                      {threadData?.type === 'repost' ? repostReplyCount : (threadData.replyCount || 0)}
                    </Text>
                  </View>

                  {/* Reposts */}
                  <TouchableOpacity 
                    onPress={() => onRepostPress?.(threadData)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  >
                    <Repeat2 size={14} color="#666666" />
                    <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>{threadData.repostCount || 0}</Text>
                  </TouchableOpacity>

                  {/* Likes */}
                  <TouchableOpacity 
                    onPress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked || false)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  >
                    <Heart 
                      size={14} 
                      color={threadData.isLiked ? '#dc2626' : '#666666'} 
                      fill={threadData.isLiked ? '#dc2626' : 'none'} 
                    />
                    <Text style={{ marginLeft: 4, color: '#666666', fontSize: 12 }}>
                      {threadData.likeCount || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Show regular thread
              <PostCard
                username={threadData.profiles?.username || 'Anonymous'}
                avatarUrl={threadData.profiles?.avatar_url}
                content={threadData.content}
                imageUrl={threadData.image_url}
                timestamp={threadData.created_at}
                likes={threadData.likeCount || 0}
                comments={threadData?.type === 'repost' ? repostReplyCount : (threadData.replyCount || 0)}
                views={threadData.view_count || 0}
                isLiked={threadData.isLiked}
                isBookmarked={threadData.isBookmarked || false}
                favoriteTeam={threadData.profiles?.favorite_team}
                userId={threadData.user_id}
                userEmail={threadData.profiles?.email}
                onCommentPress={() => {}} // No action needed in thread view
                onLikePress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked)}
                onBookmarkPress={handleBookmarkToggle}
                onDeletePress={() => handleDeleteThread(threadData.id)}
                onProfilePress={onProfilePress}
                canDelete={session && (threadData.user_id === session.user.id || isCurrentUserAdmin())}
                canAdminDelete={isCurrentUserAdmin()}
                isAdmin={isUserAdmin(threadData.user_id)}
              />
            )}
          </View>

          {/* Reply Box - Show for all threads including reposts */}
          <View style={styles.replyBoxInline}>
            {replyImage && (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: replyImage }} 
                  style={[styles.previewImage, { backgroundColor: 'transparent' }]} 
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => setReplyImage(null)}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.replyInputContainer}>
              <TextInput
                ref={replyInputRef}
                style={styles.replyInput}
                placeholder="Post your reply"
                placeholderTextColor="#505050"
                value={newReply}
                onChangeText={setNewReply}
                multiline={false}
                numberOfLines={1}
              />
              <TouchableOpacity onPress={pickReplyImage} style={styles.imagePickerButton}>
                <Camera size={20} color="#505050" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.replyButton, (!newReply.trim() && !replyImage) && styles.replyButtonDisabled]} 
                onPress={handlePostReply}
                disabled={!newReply.trim() && !replyImage}
              >
                <Text style={styles.replyButtonText} selectable={false}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e5e5', marginBottom: 8 }} />

          {/* Comments Section - Show for all threads including reposts */}
          {loadingReplies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {replies.map((reply) => (
                <TouchableOpacity key={reply.id} onLongPress={() => handleReplyTo(reply.profiles?.username || 'Anonymous')}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                    {/* Avatar Column */}
                    <TouchableOpacity 
                      onPress={() => reply.user_id && onProfilePress && onProfilePress(reply.user_id)}
                      disabled={!reply.user_id || !onProfilePress}
                      style={{ marginRight: 12, marginTop: 2 }}
                    >
                      {reply.profiles?.avatar_url ? (
                        <Image 
                          source={{ uri: reply.profiles.avatar_url }} 
                          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            {(reply.profiles?.username || 'A').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    {/* Content Column */}
                    <View style={{ flex: 1, paddingLeft: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <TouchableOpacity 
                          onPress={() => reply.user_id && onProfilePress && onProfilePress(reply.user_id)}
                          disabled={!reply.user_id || !onProfilePress}
                        >
                          <Text style={{ fontWeight: 'bold', color: '#000', fontSize: USERNAME_FONT_SIZE }} selectable={false}>{reply.profiles?.username || 'Anonymous'}</Text>
                        </TouchableOpacity>
                        {reply.profiles?.email === 'sharmadivyanshu265@gmail.com' ? (
                          <Image 
                            source={require('@/assets/images/favicon.png')} 
                            style={{ width: USERNAME_FONT_SIZE * 1.2, height: USERNAME_FONT_SIZE * 1.2, marginLeft: 6 }}
                            resizeMode="contain"
                          />
                        ) : reply.profiles?.favorite_team && TEAM_LOGOS[reply.profiles.favorite_team] && (
                          <Image 
                            source={TEAM_LOGOS[reply.profiles.favorite_team]} 
                            style={{ width: USERNAME_FONT_SIZE * 1.2, height: USERNAME_FONT_SIZE * 1.2, marginLeft: 6 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{formatThreadTimestamp(reply.created_at)}</Text>
                      <Text style={{ color: '#000', marginBottom: 8 }} selectable={false}>{reply.content}</Text>
                      {reply.image_url && (
                        <View style={{ alignItems: 'center', marginTop: 4 }}>
                          <Image 
                            source={{ uri: reply.image_url }} 
                            style={getResponsiveImageStyle(screenWidth)}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                          <Heart size={14} color={reply.isLiked ? '#dc2626' : '#505050'} fill={reply.isLiked ? '#dc2626' : 'none'} />
                          {reply.likeCount > 0 && <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 12 }}>{reply.likeCount}</Text>}
                        </TouchableOpacity>
                        {session && (reply.user_id === session.user.id || isCurrentUserAdmin()) && (
                          <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                            <Trash2 size={14} color="#505050" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Delete menu modal */}
      <Modal
        visible={deleteMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setDeleteMenuVisible(false)}>
          <View style={{ 
            position: 'absolute', 
            top: menuPos.top, 
            left: menuPos.left, 
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
              onPress={() => { 
                setDeleteMenuVisible(false); 
                if (threadData.type === 'repost' && onDeleteRepost) {
                  onDeleteRepost(threadData.id);
                } else {
                  handleDeleteThread(threadData.id);
                }
              }} 
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff'
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a3a3a',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  replyBoxInline: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    fontSize: 14,
    minHeight: 36,
    maxHeight: 36,
    pointerEvents: 'auto',
    caretColor: 'auto',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderColor: 'transparent',
  },
  imagePickerButton: {
    padding: 6,
    marginRight: 8,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 4,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  replyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  replyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  replyImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  commentsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: 400,
    flex: 1,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentUsernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#000000',
  },
  commentTeamLogo: {
    width: 12,
    height: 12,
    marginLeft: 6,
  },
  commentText: {
    color: '#000000',
    marginBottom: 8,
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 12,
  },
}); 