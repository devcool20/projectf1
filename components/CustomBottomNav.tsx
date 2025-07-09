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
      <View className="mx-auto mb-1 w-[96%] max-w-2xl rounded-xl bg-gradient-to-br from-[#e7dbc7] to-[#e2d3be] shadow-kodama-lg flex-row justify-between items-center px-1 py-0.5 border border-[#e0d2b7]/70 backdrop-blur-sm">
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
              className="flex-1 items-center py-1.5"
            >
              <Animated.View
                style={{
                  transform: [{ scale: isActive ? 1.1 : 1 }],
                  shadowColor: isActive ? '#d32f2f' : 'transparent',
                  shadowOpacity: isActive ? 0.2 : 0,
                  shadowRadius: isActive ? 6 : 0,
                  shadowOffset: { width: 0, height: 1 },
                }}
                className={`rounded-lg ${isActive ? 'bg-[#f9e6e1]/80' : ''} px-1.5 py-0.5 mb-0.5`}
              >
                <Text className="text-lg" style={{
                  color: isActive ? 'hsl(var(--f1-red))' : '#a08c6b',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}>{tab.icon}</Text>
              </Animated.View>
              <Text
                className={`text-[10px] ${isActive ? 'font-bold text-[hsl(var(--f1-red))]' : 'text-[#7c6a4d]'}`}
                style={{
                  textShadowColor: isActive ? '#fff' : 'transparent',
                  textShadowRadius: isActive ? 1 : 0,
                }}
                numberOfLines={1}
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