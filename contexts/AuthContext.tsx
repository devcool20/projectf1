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
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 Initializing authentication...');
      
      // Check onboarding status first
      await checkOnboardingStatus();

      // Get initial session from Supabase
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting initial session:', error);
      } else if (initialSession) {
        console.log('✅ Initial session found:', initialSession.user.email);
        setSession(initialSession);
      } else {
        console.log('ℹ️ No initial session found');
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (session) {
          setSession(session);
          console.log('✅ Session set:', session.user.email);
        } else {
          setSession(null);
          console.log('❌ Session cleared');
        }
        
        setLoading(false);
      });

      setLoading(false);

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Error refreshing session:', error);
      } else if (refreshedSession) {
        console.log('✅ Session refreshed:', refreshedSession.user.email);
        setSession(refreshedSession);
      }
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      // For now, use a simple approach without persistent storage
      // This will be enhanced later with proper AsyncStorage implementation
      setHasSeenOnboarding(false);
      
      // Show onboarding for new users who haven't seen it
      if (!session) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  const handleSetHasSeenOnboarding = async (seen: boolean) => {
    try {
      setHasSeenOnboarding(seen);
      console.log('📝 Onboarding status set:', seen);
      // For now, we'll just update the state without persistence
      // This will be enhanced later with AsyncStorage
    } catch (error) {
      console.error('❌ Error saving onboarding status:', error);
    }
  };

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
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
    signOut,
    refreshSession,
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