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
  // Don't render if no session
  if (!session) {
    return null;
  }

  const [selectedTeam, setSelectedTeam] = useState<F1Team>(F1_TEAMS[0]);
  const [isAdmin, setIsAdmin] = useState(false);

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
    </Modal>
  );
}; 