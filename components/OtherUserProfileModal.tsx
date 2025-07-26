import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { X, User, Mail, Trophy } from 'lucide-react-native';
import CarLoadingAnimation from './CarLoadingAnimation';

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

type OtherUserProfileModalProps = {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  currentUserId: string;
};

type UserProfile = {
  id: string;
  username: string;
  favorite_team: string;
  avatar_url?: string;
};

export const OtherUserProfileModal: React.FC<OtherUserProfileModalProps> = ({
  isVisible,
  onClose,
  userId,
  currentUserId,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (isVisible && userId) {
      fetchProfile();
      checkFollowStatus();
    }
  }, [isVisible, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, favorite_team, avatar_url')
        .eq('id', userId);

      if (error) throw error;
      
      // Handle case where no profile is found or multiple profiles exist
      if (!data || data.length === 0) {
        throw new Error('Profile not found');
      }

      // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
      const profile = data.length > 1 ? data[0] : data[0];
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST123') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error('Unfollow error:', error);
          alert('Failed to unfollow. Please try again.');
          return;
        }
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (error) {
          console.error('Follow error:', error);
          alert('Failed to follow. Please try again.');
          return;
        }
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (!profile && !loading) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
        <View style={{
          width: '95%',
          maxWidth: 400,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
          marginVertical: 24,
        }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Text className="text-xl font-bold text-foreground">Profile</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#3a3a3a" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center p-8" style={{ backgroundColor: '#000000' }}>
              <CarLoadingAnimation 
                duration={1000}
              />
            </View>
          ) : profile ? (
            <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24 }} style={{ maxHeight: 600 }}>
              {/* Profile Header */}
              <View className="items-center mb-8">
                <Image
                  source={{ 
                    uri: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username.charAt(0)}&background=random` 
                  }}
                  style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#22c55e', marginBottom: 16 }}
                />
                <Text className="text-2xl font-bold text-foreground mb-2" style={{ textAlign: 'center' }}>{profile.username}</Text>
                {/* Follow Button */}
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  disabled={followLoading}
                  style={{
                    backgroundColor: isFollowing ? '#e3e3e3' : '#dc2626',
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    borderRadius: 25,
                    marginTop: 8,
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  {followLoading ? (
                    <ActivityIndicator size="small" color={isFollowing ? "#3a3a3a" : "#ffffff"} />
                  ) : (
                    <Text style={{
                      color: isFollowing ? '#3a3a3a' : '#ffffff',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Profile Info */}
              <View style={{ width: '100%' }}>
                {/* Username */}
                <View className="bg-card rounded-xl p-4 border border-border mb-4" style={{ width: '100%' }}>
                  <View className="flex-row items-center mb-2">
                    <User size={20} color="#505050" />
                    <Text className="text-muted-foreground ml-2 text-sm">Username</Text>
                  </View>
                  <Text className="text-foreground font-medium">@{profile.username}</Text>
                </View>

                {/* Favorite Team */}
                <View className="bg-card rounded-xl p-4 border border-border" style={{ width: '100%' }}>
                  <View className="flex-row items-center mb-2">
                    <Trophy size={20} color="#505050" />
                    <Text className="text-muted-foreground ml-2 text-sm">Favorite Team</Text>
                  </View>
                  <View className="flex-row items-center">
                    {profile.favorite_team && TEAM_LOGOS[profile.favorite_team] && (
                      <Image 
                        source={TEAM_LOGOS[profile.favorite_team]} 
                        style={{ width: 32, height: 32, marginRight: 12 }}
                        resizeMode="contain"
                      />
                    )}
                    <Text className="text-foreground font-medium">{profile.favorite_team || 'Not set'}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}; 