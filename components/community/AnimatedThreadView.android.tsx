import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { formatThreadTimestamp, getResponsiveImageStyle } from '@/lib/utils';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Camera, X, Trash2 } from 'lucide-react-native';
import EngagementButton from '@/components/engagement-button';
import * as ImagePicker from 'expo-image-picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing,
} from 'react-native-reanimated';

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
  'FIA': require('@/team-logos/fia.png'),
};

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

type AnimatedThreadViewProps = {
  thread: any | null;
  onClose: () => void;
  session: any;
  onProfilePress?: (userId: string) => void;
  onRepostPress?: (thread: any) => void;
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
  const [selectedReplyForDelete, setSelectedReplyForDelete] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [repostReplyCount, setRepostReplyCount] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const replyInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { width: screenWidth } = Dimensions.get('window');
  
  // Animation values
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);

  const isCurrentUserAdmin = () => session?.user?.email === ADMIN_EMAIL;
  const isUserAdmin = (userId: string) => userId === adminUserId;

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1);
      if (!error && data && data.length > 0) {
        setAdminUserId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  // Animation styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.5,
  }));

  // Handle animation
  useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(screenWidth, { duration: 250, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, screenWidth]);

  const handleCloseWithAnimation = useCallback(() => {
    translateX.value = withTiming(screenWidth, { duration: 250, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  }, [translateX, opacity, screenWidth, onClose]);

  const fetchReplies = useCallback(async () => {
    if (!thread) return;
    try {
      setLoadingReplies(true);
      let repliesData = [];
      let error = null;
      
      if (thread.type === 'repost') {
        const { data, error: err } = await supabase
          .from('repost_replies')
          .select(`*, profiles:user_id (username, avatar_url, favorite_team, is_admin)`)
          .eq('repost_id', thread.id)
          .order('created_at', { ascending: true });
        repliesData = data || [];
        error = err;
      } else {
        const { data, error: err } = await supabase
          .from('replies')
          .select(`*, profiles:user_id (username, avatar_url, favorite_team, is_admin)`)
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: true });
        repliesData = data || [];
        error = err;
      }
      
      if (error) throw error;
      
      const repliesWithLikes = await Promise.all(
        repliesData.map(async (reply) => {
          let isLiked = false;
          let likeCount = 0;
          if (session) {
            if (thread.type === 'repost') {
              const { data: likeData } = await supabase
                .from('repost_reply_likes')
                .select('id')
                .eq('repost_reply_id', reply.id)
                .eq('user_id', session.user.id);
              isLiked = likeData && likeData.length > 0;
              const { count } = await supabase
                .from('repost_reply_likes')
                .select('*', { count: 'exact', head: true })
                .eq('repost_reply_id', reply.id);
              likeCount = count || 0;
            } else {
              const { data: likeData } = await supabase
                .from('reply_likes')
                .select('id')
                .eq('reply_id', reply.id)
                .eq('user_id', session.user.id);
              isLiked = likeData && likeData.length > 0;
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

  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session) return;
    try {
      if (threadData.type === 'repost') {
        if (isLiked) {
          await supabase.from('repost_reply_likes').delete().eq('repost_reply_id', replyId).eq('user_id', session.user.id);
        } else {
          await supabase.from('repost_reply_likes').insert({ repost_reply_id: replyId, user_id: session.user.id });
        }
      } else {
        if (isLiked) {
          await supabase.from('reply_likes').delete().eq('reply_id', replyId).eq('user_id', session.user.id);
        } else {
          await supabase.from('reply_likes').insert({ reply_id: replyId, user_id: session.user.id });
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

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean, isRepost: boolean = false) => {
    if (!session) return;
    try {
      if (isRepost) {
        if (isLiked) {
          await supabase.from('likes').delete().match({ repost_id: threadId, user_id: session.user.id });
        } else {
          await supabase.from('likes').insert({ repost_id: threadId, user_id: session.user.id });
        }
      } else {
        if (isLiked) {
          await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
        } else {
          await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
        }
      }
      setThreadData(prev => prev ? {
        ...prev,
        isLiked: !isLiked,
        likeCount: isLiked ? (prev.likeCount || 1) - 1 : (prev.likeCount || 0) + 1
      } : prev);
    } catch (error) {
      console.error('Error toggling thread like:', error);
    }
  };

  const handlePostReply = async () => {
    if (!session || !threadData || (!newReply.trim() && !replyImage)) return;
    try {
      let imageUrl = null;
      if (replyImage) {
        imageUrl = await uploadReplyImage(replyImage);
      }
      
      let replyData, error;
      if (threadData.type === 'repost') {
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
      
      const newReplyWithProfile = {
        ...replyData,
        profiles: {
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Anonymous',
          avatar_url: session.user.user_metadata?.avatar_url,
          favorite_team: null,
          is_admin: false
        },
        isLiked: false,
        likeCount: 0
      };
      
      setReplies(prev => [...prev, newReplyWithProfile]);
      setNewReply('');
      setReplyImage(null);
      setThreadData(prev => prev ? {
        ...prev,
        replyCount: (prev.replyCount || 0) + 1
      } : prev);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      await fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    }
  };

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
      await fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      Alert.alert('Error', 'Failed to delete reply');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!session || !threadData) return;
    try {
      const threadIdToBookmark = threadData.id;
      if (threadData.isBookmarked) {
        await supabase.from('bookmarks').delete().eq('thread_id', threadIdToBookmark).eq('user_id', session.user.id);
      } else {
        await supabase.from('bookmarks').insert({ thread_id: threadIdToBookmark, user_id: session.user.id });
      }
      setThreadData(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : prev);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

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

  const uploadReplyImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `reply-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, blob);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  useEffect(() => {
    setThreadData(thread);
    if (thread) {
      setTimeout(() => {
        fetchReplies();
      }, 100);
    }
    loadAdminUsers();
  }, [thread, fetchReplies]);

  if (!thread || !threadData) {
    return null;
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
            backgroundColor: '#ffffff',
            zIndex: 1000,
          },
          animatedStyle
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e5e5',
            backgroundColor: '#ffffff'
          }}>
            <TouchableOpacity onPress={handleCloseWithAnimation} style={{ marginRight: 12 }}>
              <ArrowLeft size={24} color="#3a3a3a" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#3a3a3a' }}>
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
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => onProfilePress?.(threadData.user_id)}
                  style={{ marginRight: 10 }}
                >
                  <Image
                    source={{ 
                      uri: threadData.profiles?.avatar_url || 
                           `https://ui-avatars.com/api/?name=${threadData.profiles?.username?.charAt(0) || 'U'}&background=random` 
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: '700', color: '#0f1419', fontSize: 15 }}>
                      {threadData.profiles?.username || 'Unknown User'}
                    </Text>
                    {threadData.profiles?.favorite_team && TEAM_LOGOS[threadData.profiles.favorite_team] && (
                      <Image 
                        source={TEAM_LOGOS[threadData.profiles.favorite_team]} 
                        style={{ width: 14, height: 14, marginLeft: 4 }}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={{ fontSize: 13, color: '#536471', marginLeft: 6 }}>
                      · {formatThreadTimestamp(threadData.created_at)}
                    </Text>
                  </View>

                  <Text style={{ color: '#0f1419', fontSize: 15, lineHeight: 20, marginBottom: 12 }}>
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

                  {/* Engagement buttons */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                      <EngagementButton
                        icon={Heart}
                        active={threadData.isLiked || false}
                        onPress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked || false, threadData.type === 'repost')}
                        type="like"
                        size={18}
                      />
                      <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                        {threadData.likeCount || 0}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                      <EngagementButton
                        icon={MessageCircle}
                        active={false}
                        onPress={() => {}}
                        type="comment"
                        size={18}
                      />
                      <Text style={{ marginLeft: 4, color: '#536471', fontSize: 13 }}>
                        {threadData.replyCount || 0}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                      <EngagementButton
                        icon={Repeat2}
                        active={false}
                        onPress={() => onRepostPress?.(threadData)}
                        type="repost"
                        size={18}
                      />
                    </View>
                    <EngagementButton
                      icon={Bookmark}
                      active={threadData.isBookmarked || false}
                      onPress={handleBookmarkToggle}
                      type="bookmark"
                      size={18}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Replies Section */}
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f1419', marginBottom: 16 }}>
                Replies ({replies.length})
              </Text>
              
              {loadingReplies ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : replies.length === 0 ? (
                <Text style={{ color: '#536471', textAlign: 'center', marginTop: 20 }}>
                  No replies yet. Be the first to reply!
                </Text>
              ) : (
                replies.map((reply) => (
                  <View key={reply.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => onProfilePress?.(reply.user_id)}>
                        <Image
                          source={{ 
                            uri: reply.profiles?.avatar_url || 
                                 `https://ui-avatars.com/api/?name=${reply.profiles?.username?.charAt(0) || 'U'}&background=random` 
                          }}
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                        />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '600', color: '#0f1419', fontSize: 14 }}>
                              {reply.profiles?.username || 'Unknown'}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#536471', marginLeft: 6 }}>
                              · {formatThreadTimestamp(reply.created_at)}
                            </Text>
                          </View>
                          {(session?.user?.id === reply.user_id || isCurrentUserAdmin()) && (
                            <TouchableOpacity onPress={() => handleDeleteReply(reply.id)}>
                              <Trash2 size={14} color="#dc2626" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={{ color: '#0f1419', fontSize: 14, marginTop: 4 }}>
                          {reply.content}
                        </Text>
                        {reply.image_url && (
                          <Image
                            source={{ uri: reply.image_url }}
                            style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 8 }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <TouchableOpacity 
                            onPress={() => handleLikeToggle(reply.id, reply.isLiked)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                          >
                            <Heart size={14} color={reply.isLiked ? '#dc2626' : '#536471'} fill={reply.isLiked ? '#dc2626' : 'none'} />
                            {reply.likeCount > 0 && (
                              <Text style={{ marginLeft: 4, color: '#536471', fontSize: 12 }}>
                                {reply.likeCount}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Reply Input */}
          {session && (
            <View style={{ 
              borderTopWidth: 1, 
              borderTopColor: '#e5e5e5', 
              padding: 12, 
              backgroundColor: '#ffffff' 
            }}>
              {replyImage && (
                <View style={{ position: 'relative', marginBottom: 8 }}>
                  <Image source={{ uri: replyImage }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <TouchableOpacity 
                    onPress={() => setReplyImage(null)}
                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  ref={replyInputRef}
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 20, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8,
                    marginRight: 8,
                    maxHeight: 100
                  }}
                  placeholder="Write a reply..."
                  placeholderTextColor="#536471"
                  value={newReply}
                  onChangeText={setNewReply}
                  multiline
                />
                <TouchableOpacity onPress={pickReplyImage} style={{ marginRight: 8 }}>
                  <Camera size={20} color="#536471" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handlePostReply}
                  disabled={!newReply.trim() && !replyImage}
                  style={{ 
                    backgroundColor: (!newReply.trim() && !replyImage) ? '#ccc' : '#dc2626', 
                    borderRadius: 20, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8 
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setPreviewImageUrl(null)}
        >
          <TouchableOpacity 
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
            onPress={() => setPreviewImageUrl(null)}
          >
            <X size={30} color="#fff" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={{ width: screenWidth, height: screenWidth }}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </>
  );
}