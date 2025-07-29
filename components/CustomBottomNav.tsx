import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { 
  MessageCircle, 
  Newspaper, 
  Clapperboard, 
  ShoppingCart, 
  Trophy
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

const TABS = [
  { 
    name: 'Threads', 
    path: '/community', 
    icon: MessageCircle,
    activeIcon: MessageCircle
  },
  { 
    name: 'News', 
    path: '/news', 
    icon: Newspaper,
    activeIcon: Newspaper
  },
  { 
    name: 'Screenings', 
    path: '/screenings', 
    icon: Clapperboard,
    activeIcon: Clapperboard
  },
  { 
    name: 'Shop', 
    path: '/shop', 
    icon: ShoppingCart,
    activeIcon: ShoppingCart
  },
  { 
    name: 'Standings', 
    path: '/drivers', 
    icon: Trophy,
    activeIcon: Trophy
  },
];

interface CustomBottomNavProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomBottomNav({ state, descriptors, navigation }: CustomBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.navContainer}>
        {state.routes.map((route: any, index: number) => {
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

          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.6}
              style={styles.tabButton}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer
                ]}
              >
                <IconComponent 
                  size={isFocused ? 26 : 24} 
                  color={isFocused ? '#ffffff' : '#9ca3af'} 
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </Animated.View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.activeTabLabel
                ]}
                numberOfLines={1}
              >
                {tab.name}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  navContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#0f0f0f',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    position: 'relative',
    minHeight: 60,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
});
