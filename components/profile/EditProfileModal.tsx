import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { X, Camera, User, Edit3, Heart, Trophy } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import CarLoadingAnimation from '../CarLoadingAnimation';

// Team logos constant
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
  'FIA': require('@/team-logos/fia.png'), // Added FIA logo
};

const F1_TEAMS = [
  { name: 'Red Bull Racing', color: '#1E3A8A' },
  { name: 'Scuderia Ferrari', color: '#DC2626' },
  { name: 'Mercedes-AMG', color: '#00D2BE' },
  { name: 'McLaren', color: '#F97316' },
  { name: 'Aston Martin', color: '#16A34A' },
  { name: 'Alpine', color: '#EC4899' },
  { name: 'Williams', color: '#3B82F6' },
  { name: 'Haas', color: '#DC2626' },
  { name: 'Stake F1', color: '#16A34A' },
  { name: 'RB', color: '#6366F1' },
  { name: 'FIA', color: '#000000' }, // Admin-only team
];

const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';
const ADMIN_LOGO = require('@/assets/images/favicon.png');

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  onProfileUpdate?: () => void;
}

export interface ProfileData {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  favorite_team?: string;
  avatar_url?: string;
  email?: string; // Added for admin check
  is_admin?: boolean; // Added for admin check
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  session,
  onProfileUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Helper function to check if current user is admin
  const isCurrentUserAdmin = () => {
    return session?.user?.email === ADMIN_EMAIL || profile?.is_admin;
  };

  // Get teams to display (admin users see FIA team, regular users don't)
  const getDisplayTeams = () => {
    if (isCurrentUserAdmin()) {
      return F1_TEAMS; // Admin sees all teams including FIA
    }
    return F1_TEAMS.filter(team => team.name !== 'FIA'); // Regular users don't see FIA
  };

  // Load profile data when modal opens
  useEffect(() => {
    if (visible && session?.user?.id) {
      loadProfile();
    }
  }, [visible, session]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      if (error) {
        console.error('Error loading profile:', error);
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
          .select('*');

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
        setProfile(profile);
        setUsername(profile.username || '');
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setSelectedTeam(profile.favorite_team || '');
        setAvatarUrl(profile.avatar_url || '');
        return; // Skip the rest since we just created the profile
      }

      // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
      const profile = data.length > 1 ? data[0] : data[0];
      
      if (profile) {
        setProfile(profile);
        setUsername(profile.username || '');
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setSelectedTeam(profile.favorite_team || '');
        setAvatarUrl(profile.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to upload an avatar');
      return;
    }

    try {
      setUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
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
        
        // Set the processed image URI for immediate preview
        setAvatarUrl(processedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async (uri: string): Promise<string | null> => {
    try {
      // Determine MIME type from file extension
      const extension = uri.split('.').pop()?.toLowerCase();
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
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${session.user.id}/${fileName}`, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${session.user.id}/${fileName}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to save changes');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setLoading(true);
      
      let finalAvatarUrl = avatarUrl;
      
      // If avatar was changed and is a local URI, upload it
      if (avatarUrl && avatarUrl.startsWith('file://')) {
        const uploadedUrl = await uploadAvatar(avatarUrl);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          favorite_team: selectedTeam || null,
          avatar_url: finalAvatarUrl || null,
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!');
      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setSelectedTeam(profile.favorite_team || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    onClose();
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <CarLoadingAnimation 
                duration={1000}
              />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarContainer}>
                  {uploading ? (
                    <View style={styles.avatarPlaceholder}>
                      <ActivityIndicator size="small" color="#666" />
                    </View>
                  ) : (
                    <Image
                      source={{
                        uri: avatarUrl || `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=f5f5f5&color=666`
                      }}
                      style={styles.avatar}
                    />
                  )}
                  <View style={styles.cameraIcon}>
                    <Camera size={16} color="#666" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarText}>Tap to change avatar</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* Username */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Username *</Text>
                  <View style={styles.inputContainer}>
                    <User size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter username"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Full Name */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <Edit3 size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter full name"
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Bio */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Bio</Text>
                  <View style={styles.inputContainer}>
                    <Heart size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, styles.bioInput]}
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell us about yourself"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                      autoCapitalize="sentences"
                      autoCorrect={true}
                    />
                  </View>
                </View>

                {/* Favorite Team */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Favorite Team</Text>
                  <View style={styles.teamContainer}>
                    <Trophy size={20} color="#666" style={styles.teamIcon} />
                    <Text style={styles.teamText}>
                      {selectedTeam || 'Select your favorite team'}
                    </Text>
                  </View>
                  
                  {/* Team Selection Grid */}
                  <View style={styles.teamGrid}>
                    {getDisplayTeams().map((team) => (
                      <TouchableOpacity
                        key={team.name}
                        style={[
                          styles.teamButton,
                          selectedTeam === team.name && styles.selectedTeamButton
                        ]}
                        onPress={() => setSelectedTeam(team.name)}
                      >
                        <Image
                          source={TEAM_LOGOS[team.name]}
                          style={styles.teamLogo}
                          resizeMode="contain"
                        />
                        <Text style={[
                          styles.teamName,
                          selectedTeam === team.name && styles.selectedTeamName
                        ]}>
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
  },
  formSection: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 16,
  },
  teamIcon: {
    marginRight: 12,
  },
  teamText: {
    fontSize: 16,
    color: '#333',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: '48%',
  },
  selectedTeamButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  teamLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  selectedTeamName: {
    color: '#dc2626',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#dc2626',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
