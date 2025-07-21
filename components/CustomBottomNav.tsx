import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const TABS = [
  { name: 'Threads', path: '/community', icon: '💬' },
  { name: 'News', path: '/news', icon: '📰' },
  { name: 'Screenings', path: '/screenings', icon: '🎬' },
  { name: 'Shop', path: '/shop', icon: '🛍️' },
  { name: 'Drivers', path: '/drivers', icon: '🏆' },
  { name: 'Home', path: '/home', icon: '🏠' },
];

export default function CustomBottomNav({ state, descriptors, navigation }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView
      edges={['bottom']}
      className="absolute left-0 right-0 bottom-0 z-50"
      style={{ backgroundColor: 'transparent' }}
    >
      <View className="mx-auto mb-1 w-[96%] max-w-2xl rounded-xl bg-gradient-to-br from-[#e7dbc7] to-[#e2d3be] shadow-kodama-lg flex-row justify-between items-center px-1 py-0.5 border border-[#e0d2b7]/70 backdrop-blur-sm">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const tab = TABS.find(t => t.path.includes(route.name));

          if (!tab) return null;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              className="flex-1 items-center py-1.5"
            >
              <Animated.View
                style={{
                  transform: [{ scale: isFocused ? 1.1 : 1 }],
                  shadowColor: isFocused ? '#d32f2f' : 'transparent',
                  shadowOpacity: isFocused ? 0.2 : 0,
                  shadowRadius: isFocused ? 6 : 0,
                  shadowOffset: { width: 0, height: 1 },
                }}
                className={`rounded-lg ${isFocused ? 'bg-[#f9e6e1]/80' : ''} px-1.5 py-0.5 mb-0.5`}
              >
                <Text className="text-lg" style={{
                  color: isFocused ? 'hsl(var(--f1-red))' : '#a08c6b',
                  fontWeight: isFocused ? 'bold' : 'normal',
                }}>{tab.icon}</Text>
              </Animated.View>
              <Text
                className={`text-[10px] ${isFocused ? 'font-bold text-[hsl(var(--f1-red))]' : 'text-[#7c6a4d]'}`}
                style={{
                  textShadowColor: isFocused ? '#fff' : 'transparent',
                  textShadowRadius: isFocused ? 1 : 0,
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
