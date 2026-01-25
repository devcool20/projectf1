import React, { useState, useEffect, FC } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { X, User, Mail, Trophy, Calendar, Star } from 'lucide-react-native';
import { ProfileModalProps, F1Team } from './ProfileModal.types.android';
import styles from './ProfileModal.styles.android';

const F1_TEAMS: F1Team[] = [
  { name: 'Red Bull Racing', color: '#1E3A8A', logo: require('@/team-logos/redbull.png') },
  { name: 'Scuderia Ferrari', color: '#DC2626', logo: require('@/team-logos/ferrari.png') },
  { name: 'Mercedes-AMG', color: '#00D2BE', logo: require('@/team-logos/mercedes.png') },
  { name: 'McLaren', color: '#F97316', logo: require('@/team-logos/mclaren.png') },
  { name: 'Aston Martin', color: '#16A34A', logo: require('@/team-logos/astonmartin.png') },
  { name: 'Alpine', color: '#EC4899', logo: require('@/team-logos/alpine.png') },
  { name: 'Williams', color: '#3B82F6', logo: require('@/team-logos/williams.png') },
  { name: 'Haas', color: '#DC2626', logo: require('@/team-logos/haas.png') },
  { name: 'Stake F1', color: '#16A34A', logo: require('@/team-logos/stake.png') },
  { name: 'RB', color: '#6366F1', logo: require('@/team-logos/racingbulls.png') },
  { name: 'FIA', color: '#000000', logo: require('@/team-logos/fia.png') }, // Admin-only team
];

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';
const ADMIN_LOGO = require('@/assets/images/favicon.png');

export const ProfileModal: FC<ProfileModalProps> = ({ 
  visible, 
  onClose, 
  session, 
  onLogin 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<F1Team>(F1_TEAMS[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL || isAdmin;
  };

  // Get teams to display (admin users see FIA team, regular users don't)
  const getDisplayTeams = () => {
    if (isCurrentUserAdmin()) {
      return F1_TEAMS; // Admin sees all teams including FIA
    }
    return F1_TEAMS.filter(team => team.name !== 'FIA'); // Regular users don't see FIA
  };

  // Get the logo to display (admin logo overrides team logo)
  const getDisplayLogo = () => {
    if (isCurrentUserAdmin()) {
      return ADMIN_LOGO;
    }
    return selectedTeam.logo;
  };

  // Load user's favorite team when modal opens
  useEffect(() => {
    const loadUserTeam = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('favorite_team, is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error loading user team:', error);
            return;
          }
          
          if (data?.favorite_team) {
            const userTeam = F1_TEAMS.find(team => team.name === data.favorite_team);
            if (userTeam) {
              setSelectedTeam(userTeam);
            }
          }
          
          // Set admin status from database
          setIsAdmin(data?.is_admin || false);
        } catch (error) {
          console.error('Error fetching team preference:', error);
        }
      }
    };

    if (visible && session) {
      loadUserTeam();
    }
  }, [visible, session]);

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    onClose();
  };

  const handleDeleteProfile = async (): Promise<void> => {
    if (!session?.user?.id) return;

    setDeletingProfile(true);
    try {
      const userId = session.user.id;
      console.log('Starting profile deletion for user:', userId);

      // Delete all user data manually in the correct order
      console.log('Deleting repost reply likes...');
      await supabase.from('repost_reply_likes').delete().eq('user_id', userId);

      console.log('Deleting repost replies...');
      await supabase.from('repost_replies').delete().eq('user_id', userId);

      console.log('Deleting repost likes...');
      await supabase.from('likes').delete().eq('user_id', userId).not('repost_id', 'is', null);

      console.log('Deleting reposts...');
      await supabase.from('reposts').delete().eq('user_id', userId);



      console.log('Deleting bookmarks...');
      await supabase.from('bookmarks').delete().eq('user_id', userId);

      console.log('Deleting likes...');
      await supabase.from('likes').delete().eq('user_id', userId);

      console.log('Deleting replies...');
      await supabase.from('replies').delete().eq('user_id', userId);

      console.log('Deleting threads...');
      await supabase.from('threads').delete().eq('user_id', userId);

      console.log('Deleting follows...');
      await supabase.from('follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);

      console.log('Deleting profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      console.log('Profile deletion completed successfully');

      // Sign out the user
      await supabase.auth.signOut();
      
      setShowDeleteConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile. Please try again.');
    } finally {
      setDeletingProfile(false);
    }
  };

  const handleTeamSelect = async (team: F1Team): Promise<void> => {
    setSelectedTeam(team);
    
    // Save team preference to database if user is logged in
    if (session?.user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ favorite_team: team.name })
          .eq('id', session.user.id);
        
        if (error) {
          console.error('Error updating favorite team:', error);
        }
      } catch (error) {
        console.error('Error saving team preference:', error);
      }
    }
  };

  const username = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0];
  const email = session?.user?.email;
  const fullName = session?.user?.user_metadata?.full_name || email;

  const renderLoggedInContent = (): JSX.Element => (
    <View style={styles.content}>
      {/* Account Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Mail size={20} color="#747272" />
            <Text style={styles.infoLabel}>Email</Text>
          </View>
          <Text style={styles.infoValue}>{email}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Calendar size={20} color="#747272" />
            <Text style={styles.infoLabel}>Joined</Text>
          </View>
          <Text style={styles.infoValue}>
            {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Team Selection Section - Hidden for Admin */}
      {!isCurrentUserAdmin() && (
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Favorite Team</Text>
          
          <View style={styles.teamCard}>
            <View style={styles.infoHeader}>
              <Trophy size={20} color="#747272" />
              <Text style={styles.infoLabel}>Current Selection</Text>
            </View>
            
            <View style={styles.currentTeamRow}>
              <Image 
                source={getDisplayLogo()} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{selectedTeam.name}</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.teamScrollView}
            >
              <View style={styles.teamOptionsRow}>
                {getDisplayTeams().map((team) => (
                  <TouchableOpacity
                    key={team.name}
                    style={[
                      styles.teamOption,
                      selectedTeam.name === team.name 
                        ? styles.teamOptionSelected 
                        : styles.teamOptionUnselected
                    ]}
                    onPress={() => handleTeamSelect(team)}
                  >
                    <Image 
                      source={team.logo} 
                      style={styles.teamOptionLogo}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Admin Status Display */}
      {isCurrentUserAdmin() && (
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Admin Status</Text>
          
          <View style={[styles.teamCard, { backgroundColor: '#fef2f2', borderWidth: 2, borderColor: '#dc2626' }]}>
            <View style={styles.infoHeader}>
              <Trophy size={20} color="#dc2626" />
              <Text style={[styles.infoLabel, { color: '#dc2626', fontWeight: '600' }]}>Administrator</Text>
            </View>
            
            <View style={styles.currentTeamRow}>
              <Image 
                source={ADMIN_LOGO} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={[styles.teamName, { color: '#dc2626', fontWeight: '600' }]}>Admin Badge</Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Community Stats</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Star size={20} color="#747272" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          
          <View style={styles.statCard}>
            <Trophy size={20} color="#747272" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Delete Profile Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#dc2626', opacity: 0.8, marginTop: 12 }]}
        onPress={() => setShowDeleteConfirmation(true)}
      >
        <Text style={styles.logoutText}>Delete Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotLoggedInContent = (): JSX.Element => (
    <View style={styles.notLoggedInContainer}>
      <Text style={styles.notLoggedInText}>
        You are not logged in.
      </Text>
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={onLogin}
      >
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
              
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <User size={40} color="white" />
                </View>
                <Text style={styles.fullName}>{fullName}</Text>
                <Text style={styles.username}>@{username}</Text>
              </View>
            </View>

            {session ? renderLoggedInContent() : renderNotLoggedInContent()}
          </ScrollView>
        </View>
      </View>

      {/* Delete Profile Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 16, 
            padding: 24, 
            width: '100%', 
            maxWidth: 400,
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: '#dc2626', 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              Delete Profile
            </Text>
            
            <Text style={{ 
              fontSize: 16, 
              color: '#374151', 
              marginBottom: 24,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Are you sure you want to delete your profile? This action cannot be undone and will permanently remove all your data including:
            </Text>
            
            <View style={{ 
              backgroundColor: '#fef2f2', 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 24,
              width: '100%'
            }}>
              <Text style={{ color: '#dc2626', fontSize: 14, marginBottom: 4 }}>• All your posts and replies</Text>
              <Text style={{ color: '#dc2626', fontSize: 14, marginBottom: 4 }}>• All your likes and bookmarks</Text>
              <Text style={{ color: '#dc2626', fontSize: 14, marginBottom: 4 }}>• All your reposts and comments</Text>
              <Text style={{ color: '#dc2626', fontSize: 14, marginBottom: 4 }}>• Your profile information</Text>
              <Text style={{ color: '#dc2626', fontSize: 14 }}>• Your avatar and settings</Text>
            </View>
            
            <View style={{ 
              flexDirection: 'row', 
              gap: 12, 
              width: '100%'
            }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirmation(false)}
                disabled={deletingProfile}
                style={{ 
                  flex: 1,
                  backgroundColor: '#6b7280', 
                  paddingVertical: 12, 
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDeleteProfile}
                disabled={deletingProfile}
                style={{ 
                  flex: 1,
                  backgroundColor: '#dc2626', 
                  paddingVertical: 12, 
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {deletingProfile ? 'Deleting...' : 'Delete Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}; 