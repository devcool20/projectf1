import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
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

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, session, onLogin }) => {
  const [selectedTeam, setSelectedTeam] = useState(F1_TEAMS[0]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const username = session?.user.user_metadata.username || session?.user.email?.split('@')[0];
  const email = session?.user.email;
  const fullName = session?.user.user_metadata.full_name || email;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
          <ScrollView className="flex-1">
            {/* Header */}
            <View className="bg-gradient-to-r from-primary to-secondary p-6 relative">
              <TouchableOpacity 
                className="absolute top-4 right-4 bg-white/20 rounded-full p-2"
                onPress={onClose}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
              
              <View className="items-center mt-8">
                <View className="bg-white/20 rounded-full p-4 mb-4">
                  <User size={40} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2" selectable={false}>
                  {fullName}
                </Text>
                <Text className="text-white/80 text-lg" selectable={false}>
                  @{username}
                </Text>
              </View>
            </View>

            {session ? (
              <View className="p-6">
                {/* User Info Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-foreground mb-4" selectable={false}>
                    Account Information
                  </Text>
                  
                  <View className="bg-muted rounded-xl p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                      <Mail size={20} color="hsl(var(--muted-foreground))" />
                      <Text className="text-muted-foreground ml-3 text-sm" selectable={false}>Email</Text>
                    </View>
                    <Text className="text-foreground font-medium" selectable={false}>
                      {email}
                    </Text>
                  </View>

                  <View className="bg-muted rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                      <Calendar size={20} color="hsl(var(--muted-foreground))" />
                      <Text className="text-muted-foreground ml-3 text-sm" selectable={false}>Joined</Text>
                    </View>
                    <Text className="text-foreground font-medium" selectable={false}>
                      {new Date(session.user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>

                {/* Team Selection */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-foreground mb-4" selectable={false}>
                    Favorite Team
                  </Text>
                  
                  <View className="bg-muted rounded-xl p-4">
                    <View className="flex-row items-center mb-4">
                      <Trophy size={20} color="hsl(var(--muted-foreground))" />
                      <Text className="text-muted-foreground ml-3 text-sm" selectable={false}>Current Selection</Text>
                    </View>
                    
                    <View className="flex-row items-center mb-4">
                      <Image 
                        source={selectedTeam.logo} 
                        className="w-8 h-8 rounded mr-3"
                        resizeMode="contain"
                      />
                      <Text className="text-foreground font-medium" selectable={false}>
                        {selectedTeam.name}
                      </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row space-x-3">
                        {F1_TEAMS.map((team) => (
                          <TouchableOpacity
                            key={team.name}
                            className={`p-3 rounded-lg border-2 ${
                              selectedTeam.name === team.name 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border bg-background'
                            }`}
                            onPress={() => setSelectedTeam(team)}
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

                {/* Stats Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-foreground mb-4" selectable={false}>
                    Community Stats
                  </Text>
                  
                  <View className="flex-row space-x-4">
                    <View className="bg-muted rounded-xl p-4 flex-1">
                      <Star size={20} color="hsl(var(--muted-foreground))" />
                      <Text className="text-2xl font-bold text-foreground mt-2" selectable={false}>0</Text>
                      <Text className="text-muted-foreground text-sm" selectable={false}>Posts</Text>
                    </View>
                    
                    <View className="bg-muted rounded-xl p-4 flex-1">
                      <Trophy size={20} color="hsl(var(--muted-foreground))" />
                      <Text className="text-2xl font-bold text-foreground mt-2" selectable={false}>0</Text>
                      <Text className="text-muted-foreground text-sm" selectable={false}>Likes</Text>
                    </View>
                  </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                  className="bg-f1-red rounded-xl py-4 px-6 items-center shadow-lg"
                  onPress={handleLogout}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Text className="text-white text-lg font-semibold" selectable={false}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="p-6">
                <Text className="text-center text-lg text-foreground mb-6" selectable={false}>
                  You are not logged in.
                </Text>
                <TouchableOpacity 
                  className="bg-primary rounded-xl py-4 px-6 items-center"
                  onPress={onLogin}
                >
                  <Text className="text-primary-foreground text-lg font-semibold" selectable={false}>
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