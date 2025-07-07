import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  onLogin: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, session, onLogin }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="black" />
          </TouchableOpacity>
          {session ? (
            <>
              <Text style={styles.modalText}>
                {session.user.user_metadata.full_name || session.user.email}
              </Text>
              <Text style={styles.modalSubText}>
                @{session.user.user_metadata.username || session.user.email?.split('@')[0]}
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.textStyle}>Log Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.modalText}>You are not logged in.</Text>
              <TouchableOpacity style={styles.button} onPress={onLogin}>
                <Text style={styles.textStyle}>Log In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalSubText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'gray',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
}); 