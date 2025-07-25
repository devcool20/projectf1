import { Stack } from 'expo-router';
import { useFonts, RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';
import { globalNewsService } from '@/lib/globalNewsService';
import { AuthProvider } from '@/contexts/AuthContext';
import { StandingsProvider } from '@/contexts/StandingsContext';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import './globals.css';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { session, showOnboarding, setShowOnboarding, setHasSeenOnboarding, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const handleOnboardingSignUp = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (loading) {
    // Optionally show a splash/loading screen here
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'RacingSansOne',
          },
          headerBackTitle: 'Back',
          headerBackVisible: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="thread/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onClose={handleOnboardingClose}
        onSignUp={handleOnboardingSignUp}
      />

      {/* Auth Modal */}
      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'RacingSansOne': RacingSansOne_400Regular,
    'Inter': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize global news service on app startup
  useEffect(() => {
    globalNewsService.initialize();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <StandingsProvider>
        <AppContent />
      </StandingsProvider>
    </AuthProvider>
  );
}
