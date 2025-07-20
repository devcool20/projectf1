import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthModalProps, AuthMode } from './AuthModal.types.android';
import styles from './AuthModal.styles.android';

export const AuthModal: FC<AuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');

  const handleAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
            },
          },
        });
        if (signUpError) throw signUpError;

        // Get the newly created user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('User not found after signup');

        // Create the profile entry
        console.log('Creating profile for user:', user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        // Handle case where no profile data is returned
        if (!profileData || profileData.length === 0) {
          throw new Error('Profile creation failed - no data returned');
        }

        // If multiple profiles exist, use the first one (this shouldn't happen but handles edge cases)
        const profile = profileData.length > 1 ? profileData[0] : profileData[0];

        console.log('Profile created successfully:', profile);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Check for specific error types and provide better user guidance
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Email not confirmed') ||
          errorMessage.includes('User not found')) {
        setError('No account found with this email. Please sign up to create a new account.');
      } else if (errorMessage.includes('Wrong password')) {
        setError('Incorrect password. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (): void => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  const resetForm = (): void => {
    setEmail('');
    setPassword('');
    setError(null);
    setMode('login');
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome Back!' : 'Join F1 Community'}
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            placeholderTextColor="#747272"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            placeholderTextColor="#747272"
          />

          <TouchableOpacity
            style={[
              styles.button,
              (!isFormValid || loading) && styles.buttonDisabled
            ]}
            onPress={handleAuth}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={[
                styles.buttonText,
                (!isFormValid || loading) && styles.buttonTextDisabled
              ]}>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={handleModeSwitch}
            disabled={loading}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 