import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { X, User, Mail, Trophy, Calendar, Star } from 'lucide-react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  onLogin: () => void;
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
];

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';
const ADMIN_LOGO = require('@/assets/images/favicon.png');

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, session, onLogin }) => {
  const [selectedTeam, setSelectedTeam] = useState(F1_TEAMS[0]);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL || isAdmin;
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
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error loading user data:', error);
            return;
          }
          
          if (data?.favorite_team) {
            const userTeam = F1_TEAMS.find(team => team.name === data.favorite_team);
            if (userTeam) {
              setSelectedTeam(userTeam);
            }
          }
          
          if (data?.username) {
            setUsername(data.username);
          } else {
            // Fallback to email username if no custom username set
            setUsername(session.user.user_metadata.username || session.user.email?.split('@')[0] || '');
          }
          
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }

          // Set admin status from database
          setIsAdmin(data?.is_admin || false);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (visible && session) {
      loadUserData();
    }
  }, [visible, session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

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

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('Error updating username:', error);
        return;
      }
      
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const pickAvatarImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        if (!asset.uri) return;

        setUploading(true);

        const fileUri = asset.uri;
        const fileName = `${session.user.id}-${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`;

        const response = await fetch(fileUri);
        const blob = await response.blob();

        const contentType = blob.type || 'image/jpeg';

        const { data, error } = await supabase.storage
          .from('thread-images')
          .upload(`avatars/${fileName}`, blob, {
            contentType,
            upsert: true,
          });

        if (error) {
          console.error('Upload error:', error);
          alert('Failed to upload avatar');
          setUploading(false);
          return;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('thread-images').getPublicUrl(`avatars/${fileName}`);
        const publicUrl = publicUrlData.publicUrl;

        // Update profile row
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('Error updating avatar:', updateError);
          alert('Failed to save avatar');
        } else {
          setAvatarUrl(publicUrl);
        }
        setUploading(false);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setUploading(false);
    }
  };

  const email = session?.user.email;
  const fullName = session?.user.user_metadata.full_name || email;
  const displayUsername = username || session?.user.user_metadata.username || session?.user.email?.split('@')[0];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16 }} className="w-full max-w-md max-h-[80vh] overflow-hidden">
          <ScrollView className="flex-1">
            {/* Header */}
            <View style={{ backgroundColor: '#dc2626', padding: 24, position: 'relative' }}>
              <TouchableOpacity 
                className="absolute top-4 right-4 bg-white/20 rounded-full p-2"
                onPress={onClose}
              >
                <X size={20} color="white" />
          </TouchableOpacity>
              
              <View className="items-center mt-8">
                <TouchableOpacity onPress={pickAvatarImage} disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }}
                    />
                  ) : (
                    <View className="bg-white/20 rounded-full p-4 mb-4">
                      <User size={40} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold mb-2" selectable={false}>
                  {fullName}
                </Text>
                <Text className="text-white/80 text-lg" selectable={false}>
                  @{displayUsername}
                </Text>
              </View>
            </View>

          {session ? (
              <View className="p-6">
                {/* User Info Section */}
                <View className="mb-6">
                  <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }} selectable={false}>
                    Account Information
                  </Text>
                  
                  {/* Username Section */}
                  <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <User size={20} color="#505050" />
                        <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }} selectable={false}>Username</Text>
                      </View>
                      <TouchableOpacity onPress={() => setIsEditingUsername(!isEditingUsername)}>
                        <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>
                          {isEditingUsername ? 'Cancel' : 'Edit'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isEditingUsername ? (
                      <View className="flex-row items-center">
                        <TextInput
                          style={{
                            flex: 1,
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderColor: '#e5e5e5',
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
                          style={{
                            backgroundColor: '#dc2626',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8
                          }}
                        >
                          <Text style={{ color: '#ffffff', fontWeight: '500' }}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={{ color: '#000000', fontWeight: '500' }} selectable={false}>
                        @{displayUsername}
                      </Text>
                    )}
                  </View>
                  
                  <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <View className="flex-row items-center mb-3">
                      <Mail size={20} color="#505050" />
                      <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }} selectable={false}>Email</Text>
                    </View>
                    <Text style={{ color: '#000000', fontWeight: '500' }} selectable={false}>
                      {email}
                    </Text>
                  </View>

                  <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 }}>
                    <View className="flex-row items-center mb-3">
                      <Calendar size={20} color="#505050" />
                      <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }} selectable={false}>Joined</Text>
                    </View>
                    <Text style={{ color: '#000000', fontWeight: '500' }} selectable={false}>
                      {new Date(session.user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>

                {/* Team Selection - Hidden for Admin */}
                {!isCurrentUserAdmin() && (
                  <View className="mb-6">
                    <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }} selectable={false}>
                      Favorite Team
                    </Text>
                    
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 }}>
                      <View className="flex-row items-center mb-4">
                        <Trophy size={20} color="#505050" />
                        <Text style={{ color: '#505050', marginLeft: 12, fontSize: 14 }} selectable={false}>Current Selection</Text>
                      </View>
                      
                      <View className="flex-row items-center mb-4">
                        <Image 
                          source={getDisplayLogo()} 
                          className="w-8 h-8 rounded mr-3"
                          resizeMode="contain"
                        />
                        <Text style={{ color: '#000000', fontWeight: '500' }} selectable={false}>
                          {selectedTeam.name}
                        </Text>
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row space-x-3">
                          {F1_TEAMS.map((team) => (
                            <TouchableOpacity
                              key={team.name}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 2,
                                borderColor: selectedTeam.name === team.name ? '#dc2626' : '#e5e5e5',
                                backgroundColor: selectedTeam.name === team.name ? '#fef2f2' : '#ffffff'
                              }}
                              onPress={() => handleTeamSelect(team)}
                            >
                              <Image 
                                source={team.logo} 
                                className="w-6 h-6"
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
                  <View className="mb-6">
                    <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }} selectable={false}>
                      Admin Status
                    </Text>
                    
                    <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#dc2626' }}>
                      <View className="flex-row items-center mb-4">
                        <Trophy size={20} color="#dc2626" />
                        <Text style={{ color: '#dc2626', marginLeft: 12, fontSize: 14, fontWeight: '600' }} selectable={false}>Administrator</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Image 
                          source={ADMIN_LOGO} 
                          className="w-8 h-8 rounded mr-3"
                          resizeMode="contain"
                        />
                        <Text style={{ color: '#dc2626', fontWeight: '600' }} selectable={false}>
                          Admin Badge
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Stats Section */}
                <View className="mb-6">
                  <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600', marginBottom: 16 }} selectable={false}>
                    Community Stats
              </Text>
                  
                  <View className="flex-row space-x-4">
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, flex: 1 }}>
                      <Star size={20} color="#505050" />
                      <Text style={{ color: '#000000', fontSize: 24, fontWeight: 'bold', marginTop: 8 }} selectable={false}>0</Text>
                      <Text style={{ color: '#505050', fontSize: 14 }} selectable={false}>Posts</Text>
                    </View>
                    
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, flex: 1 }}>
                      <Trophy size={20} color="#505050" />
                      <Text style={{ color: '#000000', fontSize: 24, fontWeight: 'bold', marginTop: 8 }} selectable={false}>0</Text>
                      <Text style={{ color: '#505050', fontSize: 14 }} selectable={false}>Likes</Text>
                    </View>
                  </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#dc2626',
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                  onPress={handleLogout}
                >
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }} selectable={false}>
                    Log Out
              </Text>
              </TouchableOpacity>
              </View>
          ) : (
              <View className="p-6">
                <Text style={{ textAlign: 'center', fontSize: 18, color: '#000000', marginBottom: 24 }} selectable={false}>
                  You are not logged in.
                </Text>
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#dc2626',
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    alignItems: 'center'
                  }}
                  onPress={onLogin}
                >
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }} selectable={false}>
                    Log In
                  </Text>
              </TouchableOpacity>
              </View>
          )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};