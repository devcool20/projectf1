import React, { useState, FC } from 'react';
import { View, TouchableOpacity, Text, Modal } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { User, LogOut, X } from 'lucide-react-native';
import { HeaderRightProps } from './HeaderRight.types.android';
import { styles } from './HeaderRight.styles.android';

export const HeaderRight: FC<HeaderRightProps> = () => {
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    try {
      setShowProfile(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force a hard refresh of the app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCloseModal = (): void => {
    setShowProfile(false);
  };

  const handleOpenProfile = (): void => {
    setShowProfile(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleOpenProfile}
      >
        <User size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X size={20} color="#747272" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#dc2626" />
              <Text style={styles.menuItemText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 