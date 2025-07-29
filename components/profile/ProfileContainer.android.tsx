import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  RefreshControl, 
  StyleSheet, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { Pencil, ArrowLeft, LogOut, UserPlus, UserMinus, Heart, MessageCircle, Repeat2, Bookmark } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { EditProfileModal } from './EditProfileModal';

const { width: screenWidth } = Dimensions.get('window');

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

export default function ProfileContainer({
  userId,
  onBack,
  session,
  onLogin,
  onProfilePress,
}: {
  userId: string;
  onBack: () => void;
  session: any;
  onLogin?: () => void;
  onProfilePress?: (userId: string) => void;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL;
  };

  const isUserAdmin = (userProfile: any) => {
    return userProfile?.favorite_team === 'FIA';
  };

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  };

  const fetchThreads = async () => {
    try {
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team, full_name),
          likes:likes!thread_id(count),
          replies:replies!thread_id(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (threadsError) throw threadsError;

      const processedThreads = threadsData.map(t => ({
        ...t,
        likeCount: t.likes[0]?.count || 0,
        replyCount: t.replies[0]?.count || 0,
      }));

      setThreads(processedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId);

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const fetchAllData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchProfile(),
        fetchThreads(),
        fetchFollowCounts(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData(false);
    setIsRefreshing(false);
  };

  const handleRetry = () => {
    fetchAllData();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const getLogoToShow = (profile: any) => {
    if (!profile) return null;
    
    if (isUserAdmin(profile)) {
      return TEAM_LOGOS['FIA'];
    }
    
    if (profile.favorite_team) {
      return TEAM_LOGOS[profile.favorite_team] || null;
    }
    
    return null;
  };

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ 
                uri: profile.avatar_url || 
                `https://ui-avatars.com/api/?name=${profile.username?.charAt(0)}&background=random` 
              }} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>
                  {profile.full_name || profile.username || 'Anonymous'}
                </Text>
                {getLogoToShow(profile) && (
                  <Image source={getLogoToShow(profile)} style={styles.teamLogo} />
                )}
              </View>
              <Text style={styles.username}>@{profile.username || 'anonymous'}</Text>
              {profile.favorite_team && (
                <Text style={styles.teamText}>Supports {profile.favorite_team}</Text>
              )}
            </View>
            {session?.user?.id === userId && (
              <TouchableOpacity onPress={() => setEditModal(true)} style={styles.editButton}>
                <Pencil size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{threads.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Threads */}
        <View style={styles.threadsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {threads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          ) : (
            threads.map((thread) => (
              <View key={thread.id} style={styles.threadCard}>
                <View style={styles.threadHeader}>
                  <Text style={styles.threadContent}>{thread.content}</Text>
                </View>
                {thread.image_url && (
                  <Image source={{ uri: thread.image_url }} style={styles.threadImage} />
                )}
                <View style={styles.threadActions}>
                  <View style={styles.actionItem}>
                    <Heart size={16} color="#666666" />
                    <Text style={styles.actionText}>{thread.likeCount}</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <MessageCircle size={16} color="#666666" />
                    <Text style={styles.actionText}>{thread.replyCount}</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <Repeat2 size={16} color="#666666" />
                    <Text style={styles.actionText}>Repost</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <Bookmark size={16} color="#666666" />
                  </View>
                </View>
                <Text style={styles.threadTimestamp}>
                  {new Date(thread.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <EditProfileModal 
        visible={editModal} 
        onClose={() => setEditModal(false)} 
        profile={profile}
        onUpdate={() => {
          setEditModal(false);
          fetchAllData();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    padding: 8,
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  teamLogo: {
    width: 24,
    height: 22,
    marginLeft: 8,
  },
  username: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  teamText: {
    fontSize: 14,
    color: '#dc2626',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  threadsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
  },
  threadCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  threadHeader: {
    marginBottom: 12,
  },
  threadContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  threadImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  threadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666666',
  },
  threadTimestamp: {
    fontSize: 12,
    color: '#666666',
  },
}); 