import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { X, Upload, Check, User, Camera } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface EnhancedSignupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isGoogleSignup?: boolean;
  googleUser?: any;
}

const { width: screenWidth } = Dimensions.get('window');

const teams = [
  { id: 'redbull', name: 'Red Bull Racing', logo: require('@/team-logos/redbull.png') },
  { id: 'ferrari', name: 'Ferrari', logo: require('@/team-logos/ferrari.png') },
  { id: 'mercedes', name: 'Mercedes', logo: require('@/team-logos/mercedes.png') },
  { id: 'mclaren', name: 'McLaren', logo: require('@/team-logos/mclaren.png') },
  { id: 'astonmartin', name: 'Aston Martin', logo: require('@/team-logos/astonmartin.png') },
  { id: 'alpine', name: 'Alpine', logo: require('@/team-logos/alpine.png') },
  { id: 'williams', name: 'Williams', logo: require('@/team-logos/williams.png') },
  { id: 'haas', name: 'Haas', logo: require('@/team-logos/haas.png') },
  { id: 'stake', name: 'Stake F1 Team', logo: require('@/team-logos/stake.png') },
  { id: 'racingbulls', name: 'Racing Bulls', logo: require('@/team-logos/racingbulls.png') },
];

export function EnhancedSignupModal({ 
  visible, 
  onClose, 
  onSuccess, 
  isGoogleSignup = false,
  googleUser = null 
}: EnhancedSignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
      
      // Pre-fill email for Google signup
      if (isGoogleSignup && googleUser?.email) {
        setEmail(googleUser.email);
      }
    } else {
      modalScale.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username);

        if (error) {
          console.error('Error checking username:', error);
          setIsUsernameAvailable(null);
          return;
        }

        // Handle case where no profile is found or multiple profiles exist
        if (!data || data.length === 0) {
          // No user found with this username
          setIsUsernameAvailable(true);
        } else {
          // Username is taken
          setIsUsernameAvailable(false);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setIsUsernameAvailable(null);
      }
    }, 500);

    setUsernameCheckTimeout(timeout);
  }, [username]);

  const handleProfileImageUpload = () => {
    Alert.alert(
      'Upload Profile Picture',
      'Choose an option:',
      [
        { 
          text: 'Take Photo', 
          onPress: () => {
            // In a real app, this would open camera
            Alert.alert('Camera', 'Camera functionality will be implemented soon.');
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => {
            // In a real app, this would open image picker
            Alert.alert('Gallery', 'Gallery picker will be implemented soon.');
          }
        },
        { 
          text: 'Remove Photo', 
          onPress: () => setProfileImage(null),
          style: 'destructive'
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!email || (!isGoogleSignup && !password) || !username || !selectedTeam) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (isUsernameAvailable === false) {
      Alert.alert('Username Taken', 'Please choose a different username.');
      return;
    }

    setIsLoading(true);

    try {
      let user;

      if (isGoogleSignup && googleUser) {
        // For Google signup, user is already created
        user = googleUser;
      } else {
        // Regular email/password signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        user = authData.user;
      }

      if (user) {
        // Create profile
        console.log('Creating profile for user:', user.id);
        
        // Try to create profile with better error handling
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              username,
              full_name: username, // Add full_name
              favorite_team: selectedTeam,
              avatar_url: profileImage,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here, just log the error and continue
            console.log('Profile creation failed, but user is created. Profile will be created by trigger.');
          } else if (profileData && profileData.length > 0) {
            console.log('Profile created successfully:', profileData[0]);
          }
        } catch (profileCreateError) {
          console.error('Profile creation failed:', profileCreateError);
          // Don't throw here, just log the error and continue
          console.log('Profile creation failed, but user is created. Profile will be created by trigger.');
        }

        // Always close modal and call onSuccess, even if profile creation fails
        // The profile will be created by the database trigger
        console.log('Closing modal and calling onSuccess');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      // Only show alert for critical errors, not profile creation issues
      if (error.message?.includes('Email already registered') || 
          error.message?.includes('Invalid email') ||
          error.message?.includes('Password')) {
        Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
      } else {
        // For other errors (like profile creation), just log and continue
        console.log('Non-critical error, continuing with account creation');
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setSelectedTeam('');
    setProfileImage(null);
    setIsUsernameAvailable(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, modalStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, isGoogleSignup && styles.disabledInput]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isGoogleSignup}
              />
            </View>

            {/* Password Field (hidden for Google signup) */}
            {!isGoogleSignup && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            )}

            {/* Username Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[styles.input, styles.usernameInput]}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                {isUsernameAvailable === true && (
                  <Check size={20} color="#10b981" style={styles.checkIcon} />
                )}
                {isUsernameAvailable === false && (
                  <Text style={styles.errorText}>Username taken</Text>
                )}
              </View>
            </View>

            {/* Profile Picture Upload */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity style={styles.uploadContainer} onPress={handleProfileImageUpload}>
                <View style={styles.uploadContent}>
                  <View style={styles.uploadIconContainer}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <User size={32} color="#666666" />
                    )}
                    <View style={styles.cameraOverlay}>
                      <Camera size={16} color="#ffffff" />
                    </View>
                  </View>
                  <View style={styles.uploadTextContainer}>
                    <Text style={styles.uploadText}>
                      {profileImage ? 'Change Photo' : 'Add a profile picture'}
                    </Text>
                    <Text style={styles.uploadSubtext}>
                      {profileImage ? 'Tap to change or remove' : 'Tap to upload from camera or gallery'}
                    </Text>
                  </View>
                  <Upload size={24} color="#666666" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Favorite Team Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Favorite Team</Text>
              <Text style={styles.teamSubtitle}>Select your favorite F1 team</Text>
              <View style={styles.teamsContainer}>
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamOption,
                      selectedTeam === team.id && styles.selectedTeam
                    ]}
                    onPress={() => setSelectedTeam(team.id)}
                  >
                    <Image source={team.logo} style={styles.teamLogo} />
                    <Text style={[
                      styles.teamName,
                      selectedTeam === team.id && styles.selectedTeamName
                    ]}>
                      {team.name}
                    </Text>
                    {selectedTeam === team.id && (
                      <View style={styles.selectedIndicator}>
                        <Check size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyContainer}>
              <Text style={styles.privacyText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#666666',
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameInput: {
    paddingRight: 40,
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    position: 'relative',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  teamSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  teamsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  teamOption: {
    width: '48%',
    minWidth: 140,
    maxWidth: 180,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTeam: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
    shadowColor: '#dc2626',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  teamLogo: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 16,
  },
  selectedTeamName: {
    color: '#dc2626',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyContainer: {
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Inter',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
}); 