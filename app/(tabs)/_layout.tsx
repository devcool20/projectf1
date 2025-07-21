import { Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts, RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import CustomBottomNav from '@/components/CustomBottomNav';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
    <Tabs
      tabBar={(props) => {
        const routeName = props.state.routes[props.state.index].name;
        const showNav = !['community', 'bookmarks'].includes(routeName);
        if (!showNav) return null;
        return <CustomBottomNav {...props} />;
      }}
    >
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="home" options={{ headerShown: false }} />
      <Tabs.Screen name="community" options={{ headerShown: false }} />
      <Tabs.Screen name="screenings" options={{ headerShown: false }} />
      <Tabs.Screen name="shop" options={{ headerShown: false }} />
      <Tabs.Screen name="drivers" options={{ headerShown: false }} />
      <Tabs.Screen name="news" options={{ headerShown: false }} />
    </Tabs>
  );
}
