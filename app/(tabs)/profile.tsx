import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileContainer from '@/components/profile/ProfileContainer';

export default function ProfileScreen() {
  const { session } = useAuth();
  if (!session) return null;
  return (
    <ProfileContainer userId={session.user.id} session={session} onBack={() => {}} />
  );
} 