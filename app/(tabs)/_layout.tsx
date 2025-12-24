import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useThemeStyles } from '@/src/hooks/useThemeStyles';

export default function TabLayout() {
  const {colors} = useThemeStyles()
  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.textMuted, 
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 100,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
      <Tabs.Screen
        name="welcome/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="checkmark.seal.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle.fill" color={color} />,
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
        name="signup/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="verify-email/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="reset-password-confirm/index"
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
