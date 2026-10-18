import { Tabs } from 'expo-router';
import React from 'react';
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
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.textMuted, 
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 100,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >

        <Tabs.Screen
          name="settings/index"
          options={{
            href: null,
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
        name="index"
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
