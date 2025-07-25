import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const TABS = [
  { name: 'Threads', path: '/community', icon: '\ud83d\udcac' },
  { name: 'News', path: '/news', icon: '\ud83d\udcf0' },
  { name: 'Screenings', path: '/screenings', icon: '\ud83c\udfac' },
  { name: 'Shop', path: '/shop', icon: '\ud83d\udecd\ufe0f' },
  { name: 'Standings', path: '/drivers', icon: '\ud83c\udfc6' },
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
      <View className="mx-auto mb-1 w-[96%] max-w-2xl rounded-xl bg-gradient-to-br from-[#23272f] to-[#111216] shadow-kodama-lg flex-row justify-between items-center px-1 py-0.5 border border-[#23272f]/80 backdrop-blur-sm">
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
                  shadowColor: isFocused ? '#fff' : 'transparent',
                  shadowOpacity: isFocused ? 0.15 : 0,
                  shadowRadius: isFocused ? 6 : 0,
                  shadowOffset: { width: 0, height: 1 },
                }}
                className={`rounded-lg ${isFocused ? 'bg-[#23272f]/80' : ''} px-1.5 py-0.5 mb-0.5`}
              >
                <Text className="text-lg" style={{
                  color: isFocused ? '#fff' : '#b0b3b8',
                  fontWeight: isFocused ? 'bold' : 'normal',
                }}>{tab.icon}</Text>
              </Animated.View>
              <Text
                className={`text-[10px] ${isFocused ? 'font-bold text-white' : 'text-[#b0b3b8]'}`}
                style={{
                  textShadowColor: isFocused ? '#23272f' : 'transparent',
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
