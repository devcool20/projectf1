import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const TABS = [
  { name: 'Community', path: '/community', icon: '💬' },
  { name: 'Screenings', path: '/screenings', icon: '🎬' },
  { name: 'Shop', path: '/shop', icon: '🛍️' },
  { name: 'Drivers', path: '/drivers', icon: '🏆' },
  { name: 'Home', path: '/', icon: '🏠' },
];

export default function CustomBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView
      edges={['bottom']}
      className="absolute left-0 right-0 bottom-0 z-50"
      style={{ backgroundColor: 'transparent' }}
    >
      <View className="mx-auto mb-2 w-[98%] max-w-2xl rounded-2xl bg-gradient-to-br from-[#e7dbc7] to-[#e2d3be] shadow-kodama-lg flex-row justify-between items-center px-2 py-1 border border-[#e0d2b7]/70">
        {TABS.map((tab, idx) => {
          const isActive =
            tab.path === '/'
              ? pathname === '/' || pathname === '/index'
              : pathname.startsWith(tab.path);

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.path as any)}
              activeOpacity={0.8}
              className="flex-1 items-center py-2"
            >
              <Animated.View
                style={{
                  transform: [{ scale: isActive ? 1.2 : 1 }],
                  shadowColor: isActive ? '#d32f2f' : 'transparent',
                  shadowOpacity: isActive ? 0.25 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  shadowOffset: { width: 0, height: 2 },
                }}
                className={`rounded-full ${isActive ? 'bg-[#f9e6e1]/70' : ''} px-2 py-1 mb-1`}
              >
                <Text className="text-2xl" style={{
                  color: isActive ? 'hsl(var(--f1-red))' : '#a08c6b',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}>{tab.icon}</Text>
              </Animated.View>
              <Text
                className={`text-xs ${isActive ? 'font-bold text-[hsl(var(--f1-red))]' : 'text-[#7c6a4d]'}`}
                style={{
                  textShadowColor: isActive ? '#fff' : 'transparent',
                  textShadowRadius: isActive ? 2 : 0,
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
} 