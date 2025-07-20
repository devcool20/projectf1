import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { X, User, Mail, Trophy, Calendar, Star, LogOut } from 'lucide-react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  onLogin: () => void;
  onAvatarChange?: (url: string) => void;
}

const F1_TEAMS = [
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

const { height: screenHeight } = Dimensions.get('window');

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, session, onLogin, onAvatarChange }) => {
  // Don't render if no session
  if (!session) {
    return null;
  }

  const [selectedTeam, setSelectedTeam] = useState(F1_TEAMS[0]);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'following'>('account');
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
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

  // Load user's favorite team and username when modal opens
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('favorite_team, username, is_admin, avatar_url')
            .eq('id', session.user.id);
          
          if (error) {
            console.error('Error loading user data:', error);
            return;
          }
          
          // Handle case where no profile is found or multiple profiles exist
          if (!data || data.length === 0) {
            // Try to create a profile if one doesn't exist
            console.log('No profile found, attempting to create one for user:', session.user.id);
            const { data: newProfileData, error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select('favorite_team, username, is_admin, avatar_url');

            if (createError) {
              console.error('Error creating profile:', createError);
              return;
            }

            // Handle case where no profile data is returned
            if (!newProfileData || newProfileData.length === 0) {
              console.error('Profile not found and could not be created');
              return;
            }

            // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
            const profile = newProfileData.length > 1 ? newProfileData[0] : newProfileData[0];

            // Use the newly created profile data
            if (profile?.favorite_team) {
              const userTeam = F1_TEAMS.find(team => team.name === profile.favorite_team);
              if (userTeam) {
                setSelectedTeam(userTeam);
              }
            }
            
            if (profile?.username) {
              setUsername(profile.username);
            } else {
              // Fallback to email username if no custom username set
              setUsername(session.user.user_metadata.username || session.user.email?.split('@')[0] || '');
            }
            
            if (profile?.avatar_url) {
              setAvatarUrl(profile.avatar_url);
            }

            // Set admin status from database
            setIsAdmin(profile?.is_admin || false);
            return; // Skip the rest since we just created the profile
          }

          // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
          const profile = data.length > 1 ? data[0] : data[0];
          
          if (profile?.favorite_team) {
            const userTeam = F1_TEAMS.find(team => team.name === profile.favorite_team);
            if (userTeam) {
              setSelectedTeam(userTeam);
            }
          }
          
          if (profile?.username) {
            setUsername(profile.username);
          } else {
            // Fallback to email username if no custom username set
            setUsername(session.user.user_metadata.username || session.user.email?.split('@')[0] || '');
          }
          
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }

          // Set admin status from database
          setIsAdmin(profile?.is_admin || false);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (visible && session) {
      loadUserData();
    }
  }, [visible, session]);

  // Fetch following users
  const fetchFollowingUsers = useCallback(async () => {
    if (!session?.user?.id) return;

    setFollowingLoading(true);
    try {
      // First fetch follows rows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', session.user.id);

      if (followsError) throw followsError;

      const followingIds = (followsData || []).map((f) => f.following_id).filter(Boolean);

      if (followingIds.length === 0) {
        setFollowingUsers([]);
        return;
      }

      // Fetch corresponding profile rows
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      setFollowingUsers(profilesData || []);
    } catch (err) {
      console.error('Following fetch error:', err);
      setFollowingUsers([]);
    } finally {
      setFollowingLoading(false);
    }
  }, [session]);

  const handleUnfollow = async (userId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing:', error);
        alert('Failed to unfollow user');
      } else {
        // Remove from local state
        setFollowingUsers(prev => prev.filter(follow => follow.id !== userId));
      }
    } catch (err) {
      console.error('Unfollow error:', err);
      alert('Failed to unfollow user');
    }
  };

  useEffect(() => {
    if (visible && activeTab === 'following') {
      fetchFollowingUsers();
    }
  }, [visible, activeTab, fetchFollowingUsers]);

  const handleLogout = async () => {
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
      await supabase.from('repost_likes').delete().eq('user_id', userId);

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

      // Delete avatar from storage if exists
      if (avatarUrl) {
        try {
          console.log('Deleting avatar from storage...');
          const avatarPath = avatarUrl.split('/').pop();
          if (avatarPath) {
            await supabase.storage
              .from('avatars')
              .remove([avatarPath]);
          }
        } catch (storageError) {
          console.error('Error deleting avatar from storage:', storageError);
          // Don't throw here as the main deletion succeeded
        }
      }

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

      // Try to delete the auth user as well
      console.log('Attempting to delete auth user...');
      try {
        const { data: authDeleteResult, error: authDeleteError } = await supabase.rpc('delete_auth_user', {
          user_id: userId
        });

        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError);
          // Don't throw here as the profile is already deleted
        } else {
          console.log('Auth user deletion result:', authDeleteResult);
          if (authDeleteResult) {
            console.log('Auth user deleted successfully');
          } else {
            console.log('Auth user deletion failed or user not found');
          }
        }
      } catch (authError) {
        console.error('Error calling delete_auth_user function:', authError);
        // Don't throw here as the profile is already deleted
      }

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

  // Check username availability in real-time
  const checkUsernameAvailability = useCallback(async (newUsername: string) => {
    if (!newUsername.trim() || !session?.user?.id) {
      setUsernameError('');
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data: existingUser, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', newUsername.trim())
        .neq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking username:', error);
        setUsernameError('Error checking username availability');
        return;
      }

      if (existingUser) {
        setUsernameError('Username already exists');
      } else {
        setUsernameError('');
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  }, [session]);

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username);
      } else {
        setUsernameError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailability]);

  const handleTeamSelect = async (team: typeof F1_TEAMS[0]) => {
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

  const handleUsernameUpdate = async () => {
    if (!session?.user?.id || !username.trim()) {
      return;
    }

    if (usernameError) {
      alert('Please fix the username error before saving.');
      return;
    }

    try {
      // Check if username already exists (excluding current user)
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.trim())
        .neq('id', session.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking username:', checkError);
        return;
      }

      if (existingUser) {
        alert('Username already exists. Please choose a different username.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('Error updating username:', error);
        if (error.code === '23505') { // Unique constraint violation
          alert('Username already exists. Please choose a different username.');
        }
        return;
      }
      
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const uploadAvatar = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to upload an avatar');
      return;
    }

    try {
      setUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1, // Start with full quality
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let processedUri = asset.uri;
        
        // Check file size and resize if needed
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const fileSizeInMB = blob.size / (1024 * 1024);
        
        // If file is larger than 2MB, resize it
        if (fileSizeInMB > 2) {
          console.log(`Original file size: ${fileSizeInMB.toFixed(2)}MB, resizing...`);
          
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800, height: 800 } }],
            { 
              compress: 0.8, 
              format: ImageManipulator.SaveFormat.JPEG 
            }
          );
          
          processedUri = manipResult.uri;
          console.log('Image resized successfully');
        }
        
        // Determine MIME type from file extension
        const extension = processedUri.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg'; // default
        let fileExtension = 'jpg'; // default
        if (extension === 'png') {
          mimeType = 'image/png';
          fileExtension = 'png';
        } else if (extension === 'jpg' || extension === 'jpeg') {
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
        }
        
        const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;

        // Convert to blob for upload
        const uploadResponse = await fetch(processedUri);
        const uploadBlob = await uploadResponse.blob();

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`${session.user.id}/${fileName}`, uploadBlob, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          console.error('Upload error:', error);
          alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${session.user.id}/${fileName}`);

        // Update profile in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          alert('Failed to update profile');
          return;
        }

        setAvatarUrl(publicUrl);
        if (onAvatarChange) {
          onAvatarChange(publicUrl);
        }
        
        console.log('Avatar uploaded successfully');
        
        // Refresh the page to show the new avatar immediately
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const email = session?.user?.email;
  const fullName = session?.user?.user_metadata?.full_name || email;
  const displayUsername = username || session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      deviceHeight={screenHeight}
    >
      <View style={{ 
        backgroundColor: '#ffffff', 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24,
        maxHeight: '90%',
        minHeight: '70%'
      }}>
        {/* Header */}
        <View style={{ 
          backgroundColor: '#dc2626', 
          padding: 24, 
          position: 'relative',
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4
        }}>
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: 8,
              zIndex: 50
            }}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
          
          {/* Avatar Section with Pencil Icon */}
          <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
                {uploading ? (
                  <View style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    backgroundColor: '#f5f5f5', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <ActivityIndicator size="small" color="#666" />
                  </View>
                ) : (
                  <Image
                    source={{ 
                      uri: avatarUrl || session?.user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayUsername.charAt(0)}&background=f5f5f5&color=666`
                    }}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 40, 
                      backgroundColor: '#f5f5f5' 
                    }}
                  />
                )}
              </TouchableOpacity>
              {/* Pencil Icon Overlay */}
              <View style={{ 
                position: 'absolute', 
                bottom: 2, 
                right: 2, 
                backgroundColor: '#fff', 
                borderRadius: 10, 
                width: 20, 
                height: 20, 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }}>
                <Text style={{ fontSize: 10, color: '#666' }}>✏️</Text>
              </View>
            </View>
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '600', color: '#fff' }}>
              {displayUsername}
            </Text>
          </View>

          {/* Tab Navigation */}
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: activeTab === 'account' ? '#fff' : 'transparent',
                borderRadius: 20,
                marginRight: 8
              }}
              onPress={() => setActiveTab('account')}
            >
              <Text style={{ 
                textAlign: 'center', 
                fontWeight: '500',
                color: activeTab === 'account' ? '#dc2626' : '#fff'
              }}>
                Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: activeTab === 'following' ? '#fff' : 'transparent',
                borderRadius: 20,
                marginLeft: 8
              }}
              onPress={() => setActiveTab('following')}
            >
              <Text style={{ 
                textAlign: 'center', 
                fontWeight: '500',
                color: activeTab === 'following' ? '#dc2626' : '#fff'
              }}>
                Following ({followingUsers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
          <View style={{ padding: 24 }}>
            {activeTab === 'account' && (
              <>
                {/* Account Information Header */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 }}>
                  Account Information
                </Text>
                
                {/* Username Section */}
                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <User size={20} color="#505050" />
                      <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }}>Username</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                      setIsEditingUsername(!isEditingUsername);
                      if (!isEditingUsername) {
                        setUsernameError('');
                      }
                    }}>
                      <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>
                        {isEditingUsername ? 'Cancel' : 'Edit'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isEditingUsername ? (
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <TextInput
                          style={{
                            flex: 1,
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderColor: usernameError ? '#dc2626' : '#ffffff',
                            color: '#000000',
                            fontSize: 16,
                            marginRight: 8
                          }}
                          value={username}
                          onChangeText={setUsername}
                          placeholder="Enter username"
                          placeholderTextColor="#505050"
                        />
                        <TouchableOpacity
                          onPress={handleUsernameUpdate}
                          disabled={!!usernameError || isCheckingUsername}
                          style={{
                            backgroundColor: usernameError || isCheckingUsername ? '#9ca3af' : '#dc2626',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8
                          }}
                        >
                          <Text style={{ color: '#ffffff', fontWeight: '500' }}>
                            {isCheckingUsername ? 'Checking...' : 'Save'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {usernameError && (
                        <Text style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                          {usernameError}
                        </Text>
                      )}
                      {isCheckingUsername && !usernameError && (
                        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                          Checking username availability...
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: '#000000', fontWeight: '500' }}>
                      @{displayUsername}
                    </Text>
                  )}
                </View>
                
                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Mail size={20} color="#505050" />
                    <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }}>Email</Text>
                  </View>
                  <Text style={{ color: '#000000', fontWeight: '500' }}>
                    {email}
                  </Text>
                </View>

                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Calendar size={20} color="#505050" />
                    <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }}>Joined</Text>
                  </View>
                  <Text style={{ color: '#000000', fontWeight: '500' }}>
                    {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Unknown'}
                  </Text>
                </View>

                {/* Team/Admin Section */}
                {isCurrentUserAdmin() ? (
                  <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={ADMIN_LOGO}
                      style={{ width: 20, height: 20, marginRight: 12 }}
                      resizeMode="contain"
                    />
                    <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>Admin</Text>
                  </View>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                      Favorite Team
                    </Text>
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Trophy size={20} color="#505050" />
                        <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }}>Current:</Text>
                        <Image
                          source={getDisplayLogo()} 
                          style={{ width: 16, height: 16, marginLeft: 8, marginRight: 6 }}
                          resizeMode="contain"
                        />
                        <Text style={{ color: '#000000', fontWeight: '500', fontSize: 14 }}>
                          {selectedTeam.name}
                        </Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          {getDisplayTeams().map((team) => (
                            <TouchableOpacity
                              key={team.name}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 2,
                                borderColor: selectedTeam.name === team.name ? '#dc2626' : '#ffffff',
                                backgroundColor: selectedTeam.name === team.name ? '#fef2f2' : '#ffffff'
                              }}
                              onPress={() => handleTeamSelect(team)}
                            >
                              <Image 
                                source={team.logo} 
                                style={{ width: 24, height: 24 }}
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
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                      Admin Status
                    </Text>
                    
                    <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#dc2626' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Trophy size={20} color="#dc2626" />
                        <Text style={{ color: '#dc2626', marginLeft: 12, fontSize: 14, fontWeight: '600' }}>Administrator</Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                          source={ADMIN_LOGO} 
                          style={{ width: 24, height: 24, marginRight: 12 }}
                          resizeMode="contain"
                        />
                        <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 16 }}>
                          Admin Badge
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Logout Button */}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ 
                    backgroundColor: '#dc2626', 
                    width: '100%', 
                    paddingVertical: 12, 
                    borderRadius: 9999, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginTop: 24 
                  }}
                >
                  <LogOut size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
                </TouchableOpacity>

                {/* Delete Profile Button */}
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirmation(true)}
                  style={{ 
                    backgroundColor: '#dc2626', 
                    width: '100%', 
                    paddingVertical: 12, 
                    borderRadius: 9999, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginTop: 12,
                    opacity: 0.8
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Delete Profile</Text>
                </TouchableOpacity>
              </>
            )}
            
            {activeTab === 'following' && (
              <>
                {/* Following Section */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 }}>
                  Following
                </Text>
                
                {followingLoading ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <ActivityIndicator size="large" color="#dc2626" />
                  </View>
                ) : followingUsers.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#666', fontSize: 16 }}>You're not following anyone yet</Text>
                  </View>
                ) : (
                  <View style={{ maxHeight: 300 }}>
                    {followingUsers.map((profile) => (
                      <View key={profile.id} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0'
                      }}>
                        <Image
                          source={{ 
                            uri: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username?.charAt(0) || 'U'}&background=f5f5f5&color=666`
                          }}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                        />
                        <Text style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
                          @{profile.username || 'Unknown'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleUnfollow(profile.id)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16
                          }}
                        >
                          <Text style={{ color: '#666', fontSize: 12, fontWeight: '500' }}>
                            Unfollow
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
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
                {deletingProfile ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    Delete Profile
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};