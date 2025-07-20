import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart, Camera, X } from 'lucide-react-native';
import PostCard from '@/components/post-card/index.android';
import * as ImagePicker from 'expo-image-picker';
import { ThreadViewProps, Thread, Reply, Profile } from './ThreadView.types.android';
import { styles } from './ThreadView.styles.android';
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

const ThreadView: FC<ThreadViewProps> = ({ thread, onClose, session }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<Thread | null>(thread);
  const [adminUserId, setAdminUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const replyInputRef = useRef<TextInput>(null);

  // Helper function to safely get user display name
  const getUserDisplayName = (profile: Profile | null | undefined): string => {
    if (!profile) return 'Anonymous';
    return profile.displayName || profile.display_name || profile.username || 'Anonymous';
  };

  // Helper function to safely get user data
  const getUserData = (profile: Profile | null | undefined) => {
    if (!profile) {
      return {
        username: 'Anonymous',
        displayName: 'Anonymous',
        avatarUrl: null,
        favoriteTeam: null
      };
    }
    
    return {
      username: profile.username || 'Anonymous',
      displayName: profile.displayName || profile.display_name || profile.username || 'Anonymous',
      avatarUrl: profile.avatar_url || null,
      favoriteTeam: profile.favorite_team || null
    };
  };

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
    if (!thread) {
      setError('Thread data is missing');
      setLoadingReplies(false);
      return;
    }
    
    setLoadingReplies(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`*, profiles:user_id (username, avatar_url, favorite_team, display_name)`)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        setError('Failed to fetch replies');
        throw error;
      }
      
      if (!data) {
        setReplies([]);
        return;
      }

      // Ensure all replies have valid profile data
      const validatedReplies = data.map(reply => ({
        ...reply,
        profiles: reply.profiles || null
      }));

      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('reply_id')
        .in('reply_id', validatedReplies.map(r => r.id));
      
      if (likesError) {
        console.error('Error fetching likes:', likesError);
        // Don't throw here, just continue without likes data
      }

      const likeCountMap = (likesData || []).reduce((acc: any, like: any) => {
        if (like && like.reply_id) {
          acc[like.reply_id] = (acc[like.reply_id] || 0) + 1;
        }
        return acc;
      }, {});

      if (session && session.user) {
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select('reply_id')
          .in('reply_id', validatedReplies.map(r => r.id))
          .eq('user_id', session.user.id);
        
        if (userLikesError) {
          console.error('Error fetching user likes:', userLikesError);
          // Don't throw here, just continue without user likes data
        }

        const likedReplyIds = new Set((userLikesData || []).map(l => l && l.reply_id).filter(Boolean));
        
        const repliesWithStatus = validatedReplies.map(r => ({
          ...r,
          isLiked: likedReplyIds.has(r.id),
          likeCount: likeCountMap[r.id] || 0,
        }));
        setReplies(repliesWithStatus);
      } else {
        const repliesWithCounts = validatedReplies.map(r => ({
          ...r,
          likeCount: likeCountMap[r.id] || 0,
        }));
        setReplies(repliesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      setError('Failed to load replies. Please try again.');
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  }, [thread, session]);

  useEffect(() => {
    if (thread) {
      fetchReplies();
      setThreadData(thread);
    }
  }, [thread]);

  useEffect(() => {
    // Load admin users from database
    loadAdminUsers();
  }, []);



  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session || !session.user) {
      Alert.alert('Error', 'You must be logged in to like replies.');
      return;
    }
    
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, isLiked: !isLiked, likeCount: Math.max(0, (r.likeCount || 0) + (isLiked ? -1 : 1)) } : r));
    
    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ reply_id: replyId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ reply_id: replyId, user_id: session.user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status.');
      fetchReplies(); // Re-fetch to correct state on error
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session || !session.user) {
      Alert.alert('Error', 'You must be logged in to like threads.');
      return;
    }
    
    setThreadData((prev: Thread | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        isLiked: !isLiked,
        likeCount: Math.max(0, (prev.likeCount || 0) + (isLiked ? -1 : 1))
      };
    });
    
    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
      }
    } catch (error) {
      console.error('Error toggling thread like:', error);
      Alert.alert('Error', 'Failed to update thread like status.');
      // Revert on error
      setThreadData(thread);
    }
  };

  const handlePostReply = async () => {
    if (!thread || (!newReply.trim() && !replyImage)) {
      Alert.alert('Error', 'Please enter a reply or select an image.');
      return;
    }
    
    if (!session || !session.user) {
      Alert.alert('Error', 'You must be logged in to post replies.');
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Authentication failed. Please try logging in again.');
        return;
      }

      let imageUrl: string | null = null;
      if (replyImage) {
        try {
          const response = await fetch(replyImage);
          const blob = await response.blob();
          const filePath = `${user.id}/${Date.now()}_${Math.random()}`;
          const { error: uploadError } = await supabase.storage.from('reply-images').upload(filePath, blob);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('reply-images').getPublicUrl(filePath);
          imageUrl = publicUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
          return;
        }
      }

      const { error: insertError } = await supabase
        .from('replies')
        .insert({ 
          content: newReply.trim(), 
          thread_id: thread.id, 
          user_id: user.id, 
          image_url: imageUrl 
        });
        
      if (insertError) throw insertError;
      
      setNewReply('');
      setReplyImage(null);
      await fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    Alert.alert("Delete Reply", "Are you sure you want to delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await supabase.from('replies').delete().eq('id', replyId);
            fetchReplies();
          } catch (error) {
            console.error('Error deleting reply:', error);
            Alert.alert('Error', 'Failed to delete reply.');
          }
        }
      }
    ]);
  };

  const handleDeleteThread = async (threadId: string) => {
    const isRepost = threadData?.type === 'repost';
    const itemType = isRepost ? 'repost' : 'thread';
    
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

  if (!threadData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={28} color="#3a3a3a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10, color: '#505050' }}>Loading thread...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={28} color="#3a3a3a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#dc2626', padding: 12, borderRadius: 8 }}
            onPress={() => {
              setError(null);
              fetchReplies();
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => {
    const userData = getUserData(threadData.profiles);
    
    return (
      <>
        <View style={styles.postContainer}>
          <PostCard
            username={userData.username}
            avatarUrl={userData.avatarUrl}
            content={threadData.content || ''}
            imageUrl={threadData.image_url}
            timestamp={threadData.created_at}
            likes={threadData.likeCount || 0}
            comments={threadData.replyCount || 0}
            views={threadData.view_count || 0}
            isLiked={threadData.isLiked || false}
            favoriteTeam={userData.favoriteTeam}
            onCommentPress={() => {}}
            onLikePress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked)}
            onDeletePress={() => handleDeleteThread(threadData.id)}
            canDelete={session && session.user && (threadData.user_id === session.user.id || isCurrentUserAdmin())}
            canAdminDelete={isCurrentUserAdmin()}
            isAdmin={isUserAdmin(threadData.user_id)}
          />
        </View>
      <View style={styles.replyBoxInline}>
        {replyImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: replyImage }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setReplyImage(null)}>
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
          />
          <TouchableOpacity onPress={pickReplyImage} style={styles.imagePickerButton}>
            <Camera size={20} color="#505050" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.replyButton, (!newReply.trim() && !replyImage) && styles.replyButtonDisabled]}
            onPress={handlePostReply}
            disabled={!newReply.trim() && !replyImage}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#747272', marginBottom: 8 }} />
      </>
    );
  };

  const renderReply = ({ item: reply }: { item: Reply }) => {
    const userData = getUserData(reply.profiles);
    
    return (
      <View style={styles.comment}>
        <View style={styles.commentContent}>
          <View style={styles.commentUsernameRow}>
            <Text style={styles.commentUsername}>{userData.username}</Text>
            {isUserAdmin(reply.user_id) ? (
              <Image 
                source={require('@/assets/images/favicon.png')} 
                style={styles.commentTeamLogo}
                resizeMode="contain"
              />
            ) : userData.favoriteTeam && TEAM_LOGOS[userData.favoriteTeam] && (
              <Image 
                source={TEAM_LOGOS[userData.favoriteTeam]} 
                style={styles.commentTeamLogo}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.commentText}>{reply.content || ''}</Text>
          <Text style={styles.replyTimestamp}>{formatThreadTimestamp(reply.created_at)}</Text>
        {reply.image_url && (
          <Image 
            source={{ uri: reply.image_url }} 
            style={[
              styles.replyImage,
              Platform.OS === 'web'
                ? { alignSelf: 'flex-start', width: 220, height: 180, maxWidth: 220, borderRadius: 12, marginLeft: 0, marginRight: 0, objectFit: 'cover' }
                : { alignSelf: 'flex-start', width: 220, height: 180, maxWidth: 220, borderRadius: 12, marginLeft: 0, marginRight: 0 }
            ]} 
            resizeMode="cover"
          />
        )}
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked || false)} style={styles.actionButton}>
              <Heart size={16} color={reply.isLiked ? '#dc2626' : '#505050'} fill={reply.isLiked ? '#dc2626' : 'none'} />
              {(reply.likeCount || 0) > 0 && <Text style={styles.actionText}>{reply.likeCount || 0}</Text>}
            </TouchableOpacity>
            {session && session.user && (reply.user_id === session.user.id || isCurrentUserAdmin()) && (
              <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={styles.actionButton}>
                <Trash2 size={16} color="#505050" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={28} color="#3a3a3a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
      </View>
      <FlatList
        data={replies}
        renderItem={renderReply}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => {
          if (loadingReplies) {
            return (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: 10, color: '#505050' }}>Loading replies...</Text>
              </View>
            );
          }
          
          if (error) {
            return (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#dc2626', marginBottom: 10 }}>Failed to load replies</Text>
                <TouchableOpacity 
                  style={{ backgroundColor: '#dc2626', padding: 8, borderRadius: 6 }}
                  onPress={() => {
                    setError(null);
                    fetchReplies();
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>Retry</Text>
                </TouchableOpacity>
              </View>
            );
          }
          
          return (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#505050' }}>
              No replies yet. Be the first to reply!
            </Text>
          );
        }}
        contentContainerStyle={styles.scrollContentContainer}
      />
      <View style={{ height: 40 }} />
    </SafeAreaView>
  );
};

export default ThreadView; 