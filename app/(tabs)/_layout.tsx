import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="buy-ticket"
        options={{
          title: 'Beli Tiket',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="ticket" color={color} />,
          href: null, // Hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="time" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Ulasan',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: 'Tiket Saya',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="ticket-outline" color={color} />,
          href: null, // Hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
