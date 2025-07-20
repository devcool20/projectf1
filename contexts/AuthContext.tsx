import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: any;
  loading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  checkOnboardingStatus: () => void;
  triggerOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    checkOnboardingStatus();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = () => {
    // Check localStorage for onboarding status
    if (typeof window !== 'undefined') {
      const onboardingSeen = localStorage.getItem('projectF1_onboarding_seen');
      setHasSeenOnboarding(!!onboardingSeen);
      
      // Show onboarding for new users who haven't seen it
      if (!onboardingSeen && !session) {
        setShowOnboarding(true);
      }
    }
  };

  const handleSetHasSeenOnboarding = (seen: boolean) => {
    setHasSeenOnboarding(seen);
    if (seen && typeof window !== 'undefined') {
      localStorage.setItem('projectF1_onboarding_seen', 'true');
    }
  };

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  const value = {
    session,
    loading,
    showOnboarding,
    setShowOnboarding,
    hasSeenOnboarding,
    setHasSeenOnboarding: handleSetHasSeenOnboarding,
    checkOnboardingStatus,
    triggerOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 