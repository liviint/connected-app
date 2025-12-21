// app/[...notfound].tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';

export default function NotFound() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { globalStyles, colors } = useThemeStyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>404</Text>
      <Text style={[styles.message, { color: theme.text }]}>
        Oops! Page not found.
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={globalStyles.primaryBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <Text style={globalStyles.primaryBtnText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.secondaryBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={globalStyles.secondaryBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    marginVertical: 12,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
