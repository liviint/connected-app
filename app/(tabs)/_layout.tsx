import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.seal.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/[id]/index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="profile/edit/index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="feedback/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="login/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reset-password/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="[...notfound]"
        options={{
          href: null,
        }}
      />
      
    </Tabs>
    </>
  );
}
