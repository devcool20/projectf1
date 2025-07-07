import { Stack } from 'expo-router';
import { useFonts, RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import './globals.css';

SplashScreen.preventAutoHideAsync();

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
          title: 'Thread',
        }}
      />
    </Stack>
  );
}
