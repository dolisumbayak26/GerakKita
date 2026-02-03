import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function DriverTabLayout() {
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
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Ionicons size={26} name="speedometer" color={color} />,
                }}
            />
            <Tabs.Screen
                name="route-info"
                options={{
                    title: 'Rute Saya',
                    tabBarIcon: ({ color }) => <Ionicons size={26} name="map" color={color} />,
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
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons size={26} name="person-circle-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="select-bus"
                options={{
                    href: null, // Hidden from tab bar
                    tabBarStyle: { display: 'none' }, // Hide tab bar when on this screen
                }}
            />
        </Tabs>
    );
}
