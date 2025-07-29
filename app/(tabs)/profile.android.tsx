import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Alert 
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, User, Settings, Heart, MessageCircle, Repeat2, Bookmark } from 'lucide-react-native';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { AuthModal } from '@/components/auth/AuthModal.android';

export default function ProfileScreen() {
  const { session, loading, signOut, refreshSession } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  // Debug effect to log showAuth changes
  useEffect(() => {
    console.log('showAuth state changed to:', showAuth);
  }, [showAuth]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      setNetworkError(false);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If profile doesn't exist, create a default one
        if (profileError.code === 'PGRST116') {
          const defaultProfile = {
            user_id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            full_name: session.user.user_metadata?.full_name || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            favorite_team: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(defaultProfile);
          return;
        }
        throw profileError;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.message?.includes('Network request failed')) {
        setNetworkError(true);
        // Set a fallback profile
        setProfile({
          user_id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          full_name: session.user.user_metadata?.full_name || 'User',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          favorite_team: null,
        });
      } else {
        setError('Failed to load profile');
      }
    }
  };

  const fetchThreads = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles:user_id (username, avatar_url, favorite_team, full_name)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (threadsError) {
        console.error('Threads fetch error:', threadsError);
        return;
      }

      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
      // Don't set error for threads, just leave empty
    }
  };

  const loadData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchProfile(),
        fetchThreads(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Try to refresh the session first
      await refreshSession();
      await loadData(false);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!loading && session) {
      loadData();
    } else if (!loading && !session) {
      setIsLoading(false);
    }
  }, [loading, session]);

  if (loading || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noSessionContainer}>
          <User size={64} color="#666666" />
          <Text style={styles.noSessionTitle}>Not Signed In</Text>
          <Text style={styles.noSessionText}>
            Please sign in to view your profile and access all features.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => {
              console.log('Login button pressed, setting showAuth to true');
              setShowAuth(true);
            }}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor="#dc2626"
            colors={["#dc2626"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Auth Status for Debugging */}
        <AuthStatus />

        {/* Network Error Banner */}
        {networkError && (
          <View style={styles.networkErrorBanner}>
            <Text style={styles.networkErrorText}>
              ⚠️ Network connection issues. Some features may be limited.
            </Text>
          </View>
        )}

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {profile?.full_name || profile?.username || 'User'}
              </Text>
              <Text style={styles.username}>
                @{profile?.username || 'user'}
              </Text>
              {profile?.favorite_team && (
                <Text style={styles.teamText}>
                  Supports {profile.favorite_team}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{threads.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Threads */}
        <View style={styles.threadsSection}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          {threads.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#666666" />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                Start sharing your thoughts about F1!
              </Text>
            </View>
          ) : (
            threads.map((thread) => (
              <View key={thread.id} style={styles.threadCard}>
                <Text style={styles.threadContent}>{thread.content}</Text>
                {thread.image_url && (
                  <View style={styles.threadImagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷 Image</Text>
                  </View>
                )}
                <View style={styles.threadActions}>
                  <View style={styles.actionItem}>
                    <Heart size={16} color="#666666" />
                    <Text style={styles.actionText}>0</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <MessageCircle size={16} color="#666666" />
                    <Text style={styles.actionText}>0</Text>
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

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadData()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Auth Modal */}
      <AuthModal 
        visible={showAuth} 
        onClose={() => {
          console.log('AuthModal onClose called');
          setShowAuth(false);
        }}
        onSuccess={() => {
          console.log('AuthModal onSuccess called');
          setShowAuth(false);
          // Refresh the session after successful login
          setTimeout(() => {
            loadData();
          }, 1000);
        }}
      />
      
      {/* Test Modal for debugging */}
      <Modal
        visible={showAuth}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuth(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Test Modal</Text>
            <Text>showAuth is: {showAuth ? 'true' : 'false'}</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#dc2626', padding: 10, borderRadius: 5, marginTop: 10 }}
              onPress={() => setShowAuth(false)}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  noSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSessionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noSessionText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    padding: 8,
  },
  networkErrorBanner: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  networkErrorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
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
  settingsButton: {
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
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  threadCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  threadContent: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
  },
  threadImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: '#666666',
    fontSize: 16,
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
}); 