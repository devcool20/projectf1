import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StandingsProvider } from '@/contexts/StandingsContext';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { SplashScreenComponent } from '@/components/SplashScreenComponent';
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
            fontFamily: 'Formula1-Bold',
          },
          headerBackTitle: 'Back',
          headerBackVisible: false,
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
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    'Formula1-Bold': require('../assets/fonts/Formula1-Bold_web_0.ttf'),
    'Formula1-Regular': require('../assets/fonts/Formula1-Regular_web_0.ttf'),
    'Formula1-Wide': require('../assets/fonts/Formula1-Wide_web_0.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <AuthProvider>
        <StandingsProvider>
          <AppContent />
        </StandingsProvider>
      </AuthProvider>
      
      {/* Splash Screen - Renders at top level for immediate display */}
      {showSplash && <SplashScreenComponent onFinish={() => setShowSplash(false)} />}
    </>
  );
}
