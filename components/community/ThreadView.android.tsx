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
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Heart, Camera, X } from 'lucide-react-native';
import PostCard from '@/components/post-card/index.android';
import * as ImagePicker from 'expo-image-picker';
import { ThreadViewProps } from './ThreadView.types.android';
import { styles } from './ThreadView.styles.android';

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
};

const ThreadView: FC<ThreadViewProps> = ({ thread, onClose, session }) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [threadData, setThreadData] = useState(thread);
  const [adminUserId, setAdminUserId] = useState<string>('');
  const replyInputRef = useRef<TextInput>(null);

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
      const { data, error } = await supabase
        .from('replies')
        .select(`*, profiles:user_id (username, avatar_url, favorite_team)`)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data) {
        setReplies([]);
        return;
      }

      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('reply_id')
        .in('reply_id', data.map(r => r.id));
      
      if (likesError) throw likesError;

      const likeCountMap = (likesData || []).reduce((acc: any, like: any) => {
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

        const likedReplyIds = new Set((userLikesData || []).map(l => l.reply_id));
        
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
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [thread, session]);

  useEffect(() => {
    fetchReplies();
    setThreadData(thread);
  }, [fetchReplies, thread]);

  useEffect(() => {
    // Load admin users from database
    loadAdminUsers();
  }, []);

  const handleLikeToggle = async (replyId: string, isLiked: boolean) => {
    if (!session) return;
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, isLiked: !isLiked, likeCount: r.likeCount + (isLiked ? -1 : 1) } : r));
    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ reply_id: replyId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ reply_id: replyId, user_id: session.user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchReplies(); // Re-fetch to correct state on error
    }
  };

  const handleThreadLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) return;
    setThreadData((prev: any) => ({ ...prev, isLiked: !isLiked, likeCount: prev.likeCount + (isLiked ? -1 : 1) }));
    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
      }
    } catch (error) {
      console.error('Error toggling thread like:', error);
      // Revert on error
      setThreadData(thread);
    }
  };

  const handlePostReply = async () => {
    if (!thread || (!newReply.trim() && !replyImage)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl: string | null = null;
      if (replyImage) {
        const response = await fetch(replyImage);
        const blob = await response.blob();
        const filePath = `${user.id}/${Math.random()}`;
        const { error: uploadError } = await supabase.storage.from('reply-images').upload(filePath, blob);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('reply-images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      await supabase.from('replies').insert({ content: newReply.trim(), thread_id: thread.id, user_id: user.id, image_url: imageUrl });
      setNewReply('');
      setReplyImage(null);
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply.');
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
    Alert.alert("Delete Thread", "Are you sure you want to delete this thread?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await supabase.from('threads').delete().eq('id', threadId);
            onClose();
          } catch (error) {
            console.error('Error deleting thread:', error);
            Alert.alert('Error', 'Failed to delete thread.');
          }
        }
      }
    ]);
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
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      <View style={styles.postContainer}>
        <PostCard
          username={threadData.profiles?.username || 'Anonymous'}
          avatarUrl={threadData.profiles?.avatar_url}
          content={threadData.content}
          imageUrl={threadData.image_url}
          timestamp={threadData.created_at}
          likes={threadData.likeCount || 0}
          comments={threadData.replyCount || 0}
          isLiked={threadData.isLiked}
          favoriteTeam={threadData.profiles?.favorite_team}
          onCommentPress={() => {}}
          onLikePress={() => handleThreadLikeToggle(threadData.id, threadData.isLiked)}
          onDeletePress={() => handleDeleteThread(threadData.id)}
          canDelete={session && threadData.user_id === session.user.id}
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
    </>
  );

  const renderReply = ({ item: reply }: { item: any }) => (
    <View style={styles.comment}>
      <View style={styles.commentContent}>
        <View style={styles.commentUsernameRow}>
          <Text style={styles.commentUsername}>{reply.profiles?.username || 'Anonymous'}</Text>
          {isUserAdmin(reply.user_id) ? (
            <Image 
              source={require('@/assets/images/favicon.png')} 
              style={styles.commentTeamLogo}
              resizeMode="contain"
            />
          ) : reply.profiles?.favorite_team && TEAM_LOGOS[reply.profiles.favorite_team] && (
            <Image 
              source={TEAM_LOGOS[reply.profiles.favorite_team]} 
              style={styles.commentTeamLogo}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.commentText}>{reply.content}</Text>
        {reply.image_url && (
          <Image source={{ uri: reply.image_url }} style={styles.replyImage} resizeMode="contain" />
        )}
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => handleLikeToggle(reply.id, reply.isLiked)} style={styles.actionButton}>
            <Heart size={16} color={reply.isLiked ? '#dc2626' : '#505050'} fill={reply.isLiked ? '#dc2626' : 'none'} />
            {reply.likeCount > 0 && <Text style={styles.actionText}>{reply.likeCount}</Text>}
          </TouchableOpacity>
          {session && (reply.user_id === session.user.id || isCurrentUserAdmin()) && (
            <TouchableOpacity onPress={() => handleDeleteReply(reply.id)} style={styles.actionButton}>
              <Trash2 size={16} color="#505050" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

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
        ListEmptyComponent={() => (
          loadingReplies ? <ActivityIndicator style={{marginTop: 20}}/> : <Text style={{textAlign: 'center', marginTop: 20, color: '#505050'}}>No replies yet.</Text>
        )}
        contentContainerStyle={styles.scrollContentContainer}
      />
    </SafeAreaView>
  );
};

export default ThreadView; 