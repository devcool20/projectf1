import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MessageCircle, 
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
    path: '/standings', 
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
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <IconComponent 
                  size={24} 
                  color={isFocused ? '#dc2626' : '#6e767d'} 
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.activeTabLabel
                ]}
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
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 32,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6e767d',
    fontWeight: '500',
    fontFamily: 'Formula1-Regular',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
