import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/20">
        <View className="bg-gradient-card rounded-2xl p-8 items-center shadow-kodama-lg max-w-md w-full">
          <Text className="text-6xl mb-4">🏎️</Text>
          <Text className="text-2xl font-heading font-bold text-foreground mb-2 text-center">
            Page Not Found
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            This screen doesn't exist. Let's get you back on track!
          </Text>
          
          <Link href="/" asChild>
            <Button className="w-full bg-gradient-f1 text-white font-semibold rounded-xl py-4 shadow-kodama-md">
              🏠 Go to Home
            </Button>
          </Link>
          
          <View className="mt-4 flex-row space-x-4">
            <Link href="/community" asChild>
              <Button variant="outline" className="flex-1">
                💬 Community
              </Button>
            </Link>
            <Link href="/screenings" asChild>
              <Button variant="outline" className="flex-1">
                🎬 Screenings
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}
