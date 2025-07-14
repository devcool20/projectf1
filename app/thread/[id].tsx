import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThreadView } from '@/components/community/ThreadView';

export default function ThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get session and fetch thread data
    const fetchThreadData = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        // Fetch thread data
        const { data: threadData, error: threadError } = await supabase
          .from('threads')
          .select(`
            *,
            profiles:user_id (username, avatar_url),
            likes:likes!thread_id(count),
            replies:replies!thread_id(count)
          `)
          .eq('id', id)
          .single();

        if (threadError) throw threadError;

        // Check if user liked this thread
        let isLiked = false;
        if (currentSession) {
          const { data: userLikeData, error: userLikeError } = await supabase
            .from('likes')
            .select('thread_id')
            .eq('thread_id', id)
            .eq('user_id', currentSession.user.id)
            .single();

          if (!userLikeError && userLikeData) {
            isLiked = true;
          }
        }

        const threadWithStatus = {
          ...threadData,
          isLiked,
          likeCount: threadData.likes[0]?.count || 0,
          replyCount: threadData.replies[0]?.count || 0,
        };

        setThread(threadWithStatus);
      } catch (error) {
        console.error('Error fetching thread:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThreadData();
    }
  }, [id]);

  const handleClose = () => {
    router.push('/community');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!thread) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Thread not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background items-center">
      <View style={{ width: '100%', maxWidth: 720, flex: 1 }}>
        <ThreadView thread={thread} onClose={handleClose} session={session} />
      </View>
    </View>
  );
} 