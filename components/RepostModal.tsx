import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Modal, Alert } from 'react-native';
import { X, Camera } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

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
  'FIA': require('@/team-logos/fia.png'), // Admin-only team
};

const ADMIN_LOGO = require('@/assets/images/favicon.png');
const ADMIN_EMAIL = 'sharmadivyanshu265@gmail.com';

interface RepostModalProps {
  visible: boolean;
  onClose: () => void;
  originalThread: any;
  session: any;
  onRepostSuccess?: () => void;
}

export default function RepostModal({
  visible,
  onClose,
  originalThread,
  session,
  onRepostSuccess
}: RepostModalProps) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleRepost = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to repost');
      return;
    }

    if (!originalThread) {
      Alert.alert('Error', 'No thread to repost');
      return;
    }

    setIsPosting(true);

    try {
      const { data, error } = await supabase
        .from('reposts')
        .insert({
          user_id: session.user.id,
          original_thread_id: originalThread.id,
          content: content.trim() || null
        })
        .select();

      if (error) {
        throw error;
      }

      console.log('Repost created successfully:', data);
      Alert.alert('Success', 'Thread reposted successfully!');
      setContent('');
      onRepostSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating repost:', error);
      Alert.alert('Error', 'Failed to repost. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const getLogoToShow = (userProfile: any) => {
    if (userProfile?.email === ADMIN_EMAIL) {
      return ADMIN_LOGO;
    }
    if (userProfile?.favorite_team && TEAM_LOGOS[userProfile.favorite_team]) {
      return TEAM_LOGOS[userProfile.favorite_team];
    }
    return null;
  };

  const userLogo = getLogoToShow(originalThread?.profiles);
  const currentUserLogo = getLogoToShow(session?.user);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
        <View style={{ width: '90%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', alignItems: 'stretch', position: 'relative' }}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <X size={28} color="#dc2626" />
          </TouchableOpacity>
          
          {/* Repost Title */}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 16, textAlign: 'center' }}>Repost</Text>
          
          {/* User Avatar and Input */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Image
              source={{ 
                uri: session?.user?.user_metadata?.avatar_url || 
                     `https://ui-avatars.com/api/?name=${session?.user?.email?.split('@')[0]?.charAt(0)}&background=f5f5f5&color=666` 
              }}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5' }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextInput
                placeholder="Add your thoughts..."
                placeholderTextColor="gray"
                style={{
                  fontSize: 18,
                  color: '#000000',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  cursor: 'text',
                  caretColor: 'auto',
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  outlineColor: 'transparent',
                  borderColor: 'transparent',
                  minHeight: 40,
                  maxHeight: 120,
                } as any}
                value={content}
                onChangeText={setContent}
                multiline
              />
            </View>
          </View>

          {/* Original thread preview */}
          {originalThread && (
            <View style={{
              borderWidth: 1,
              borderColor: '#e5e5e5',
              borderRadius: 12,
              padding: 16,
              backgroundColor: '#f8f9fa',
              marginTop: 16
            }}>
              <Text style={{
                fontSize: 14,
                color: '#657786',
                marginBottom: 12,
                fontWeight: '500'
              }}>
                Reposting
              </Text>
              
              {/* Original thread content */}
              <View style={{ flexDirection: 'row' }}>
                <Image
                  source={{ 
                    uri: originalThread.profiles?.avatar_url || 
                         `https://ui-avatars.com/api/?name=${originalThread.profiles?.username?.charAt(0)}&background=random` 
                  }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: 15 }}>
                      {originalThread.profiles?.username || 'Unknown User'}
                    </Text>
                    {userLogo && (
                      <Image 
                        source={userLogo} 
                        style={{ width: 20, height: 18, marginLeft: 4 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={{ color: '#1a1a1a', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
                    {originalThread.content}
                  </Text>
                  {originalThread.image_url && (
                    <Image
                      source={{ uri: originalThread.image_url }}
                      style={{ 
                        width: '100%', 
                        height: 150, 
                        borderRadius: 8,
                        backgroundColor: '#f3f4f6'
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <TouchableOpacity>
              <Camera size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRepost}
              style={{ backgroundColor: '#dc2626', borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.15)' }}
              disabled={isPosting}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, opacity: isPosting ? 0.5 : 1 }}>
                {isPosting ? 'Posting...' : 'Repost'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 