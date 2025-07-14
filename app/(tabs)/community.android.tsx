import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal.android';
import { useRouter } from 'expo-router';
import PostCard from '@/components/post-card/index.android';
import { ThreadView } from '@/components/community/ThreadView.android';
import { User, Camera, X, Menu } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileModal } from '@/components/ProfileModal.android';
import { styles } from './community.styles.android';

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

const CommunityScreen: FC = () => {
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
  const router = useRouter();

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

  const fetchThreads = useCallback(async (currentSession: any) => {
    try {
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`*, profiles:user_id (username, avatar_url, favorite_team), likes:likes!thread_id(count), replies:replies!thread_id(count)`)
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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchThreads]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads(session);
  }, [session, fetchThreads]);

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
        
        const { error: uploadError } = await supabase.storage.from('thread-images').upload(filePath, blob, {
            contentType: blob.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('thread-images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('threads').insert({ content: content.trim(), user_id: session.user.id, image_url: imageUrl });
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
    router.push(`/thread/${thread.id}`);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setIsViewingThread(false);
    router.back();
  };
  
  const handleLikeToggle = async (threadId: string, isLiked: boolean) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === threadId) {
        return { ...t, isLiked: !isLiked, likeCount: t.likeCount + (isLiked ? -1 : 1) };
      }
      return t;
    }));

    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ thread_id: threadId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ thread_id: threadId, user_id: session.user.id });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      fetchThreads(session); // Re-fetch to correct state
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    Alert.alert("Delete Thread", "Are you sure you want to delete this thread?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await supabase.from('threads').delete().eq('id', threadId);
            fetchThreads(session);
          } catch (error) {
            console.error("Error deleting thread:", error);
            Alert.alert("Error", "Failed to delete thread.");
          }
        }
      }
    ]);
  };

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

  if (isViewingThread && selectedThread) {
    return <ThreadView thread={selectedThread} onClose={handleCloseThread} session={session} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* Open Drawer */ }}>
          <Menu size={24} color="#3a3a3a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={() => session ? setShowProfileModal(true) : setShowAuth(true)}>
          <User size={24} color="#3a3a3a" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={threads}
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
              favoriteTeam={item.profiles?.favorite_team}
              userId={item.user_id}
              onCommentPress={() => handleThreadPress(item)}
              onLikePress={() => handleLikeToggle(item.id, item.isLiked)}
              onDeletePress={() => handleDeleteThread(item.id)}
              canDelete={session && item.user_id === session.user.id}
              canAdminDelete={isCurrentUserAdmin()}
              isAdmin={isUserAdmin(item.user_id)}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderCreateThread}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          loading ? <ActivityIndicator style={styles.loadingIndicator} /> : <Text>No threads yet.</Text>
        )}
      />
      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          fetchThreads(session);
        }}
      />
      
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        onLogin={() => {
          setShowProfileModal(false);
          setShowAuth(true);
        }}
      />
    </SafeAreaView>
  );
};

export default CommunityScreen; 