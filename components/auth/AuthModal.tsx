import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { EnhancedSignupModal } from './EnhancedSignupModal';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnhancedSignup, setShowEnhancedSignup] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalScale.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setGoogleUser(null);
    setErrorMessage(null);
    setShowSignUpPrompt(false);
    setShowSuccessMessage(false);
    setIsSignUp(false);
  };

  const handleClose = () => {
    resetForm();
    setShowEnhancedSignup(false);
    onClose();
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setShowSignUpPrompt(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.log('Error message:', error.message);
      console.log('Error type:', typeof error.message);
      
      // Check for specific error types and provide better user guidance
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Email not confirmed') ||
          errorMessage.includes('User not found') ||
          errorMessage.includes('Invalid login credentials')) {
        console.log('Showing account not found prompt');
        setErrorMessage('No account found with this email. Please sign up to create a new account.');
        setShowSignUpPrompt(true);
      } else if (errorMessage.includes('Wrong password')) {
        console.log('Showing wrong password message');
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        console.log('Showing generic error message');
        setErrorMessage(errorMessage || 'Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'projectf1://auth/callback',
        },
      });

      if (error) throw error;

      // For Google sign-in, we need to check if this is a new user
      // If it's a new user, we'll show the enhanced signup modal
      if (data.user) {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Error checking profile:', profileError);
          // If there's an error, assume no profile exists and show enhanced signup
          setGoogleUser(data.user);
          setShowEnhancedSignup(true);
          return;
        }

        // Handle case where no profile is found or multiple profiles exist
        if (!profile || profile.length === 0) {
          // No profile found - show enhanced signup
          setGoogleUser(data.user);
          setShowEnhancedSignup(true);
          return;
        }

        // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
        const userProfile = profile.length > 1 ? profile[0] : profile[0];

        if (!userProfile?.username) {
          // New user - show enhanced signup
          setGoogleUser(data.user);
          setShowEnhancedSignup(true);
        } else {
          // Existing user - proceed normally
          onSuccess();
          handleClose();
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert('Google Sign In Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    // Switch to signup mode
    setIsSignUp(true);
    setErrorMessage(null);
    setShowSignUpPrompt(false);
  };

  const handleEnhancedSignupSuccess = () => {
    setShowEnhancedSignup(false);
    onSuccess();
    handleClose();
  };

  const handleEnhancedSignupClose = () => {
    setShowEnhancedSignup(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setShowSuccessMessage(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setIsSignUp(false);
    setErrorMessage(null);
    setShowSignUpPrompt(false);
    setShowSuccessMessage(false);
  };

  // Show enhanced signup modal if it's open
  if (showEnhancedSignup) {
    return (
      <EnhancedSignupModal
        visible={showEnhancedSignup}
        onClose={handleEnhancedSignupClose}
        onSuccess={handleEnhancedSignupSuccess}
        isGoogleSignup={!!googleUser}
        googleUser={googleUser}
      />
    );
  }

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
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {showSuccessMessage ? (
              // Success Message
              <View style={styles.successContainer}>
                <Text style={styles.title}>Account Created!</Text>
                <Text style={styles.subtitle}>Welcome to projectF1</Text>
                <Text style={styles.successText}>
                  Your account has been created successfully. You can now customize your profile with your favorite team, bio, and profile picture from the profile section.
                </Text>
                <View style={styles.successInfo}>
                  <Text style={styles.successInfoText}>
                    💡 Tip: Go to your profile to set your favorite F1 team and add a bio!
                  </Text>
                </View>
              </View>
            ) : (
              // Sign In/Sign Up Form
              <>
                <Text style={styles.title}>
                  {isSignUp ? 'Create Account' : 'Welcome Back!'}
                </Text>
                <Text style={styles.subtitle}>
                  {isSignUp ? 'Sign up to join the F1 community' : 'Sign in to your account'}
                </Text>

                {/* Error Message */}
                {errorMessage && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    {showSignUpPrompt && (
                      <TouchableOpacity 
                        style={styles.signUpPromptButton}
                        onPress={handleSignUpClick}
                      >
                        <Text style={styles.signUpPromptText}>Create Account</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isSignUp ? "Create a password" : "Password"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#666666" />
                    ) : (
                      <Eye size={20} color="#666666" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.signInButton, isLoading && styles.disabledButton]}
                  onPress={isSignUp ? handleSignUp : handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.signInButtonText}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Google Sign In Button */}
                <TouchableOpacity
                  style={[styles.googleButton, isLoading && styles.disabledButton]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>

                {/* Toggle Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  </Text>
                  <TouchableOpacity onPress={isSignUp ? handleBackToSignIn : handleSignUpClick}>
                    <Text style={styles.signUpLink}>
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
    maxWidth: 400,
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
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  signUpPromptButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signUpPromptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontFamily: 'Inter',
  },
  eyeButton: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
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
  signInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  successInfo: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  successInfoText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    fontFamily: 'Inter',
    lineHeight: 20,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
  signUpLink: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
});