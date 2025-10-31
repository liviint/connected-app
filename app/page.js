'use client';

import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ZeniaHub 🌿</Text>
        <Text style={styles.subtitle}>
          A safe space to express, connect, and grow together.
        </Text>
      </View>

      <View style={styles.about}>
        <Text style={styles.paragraph}>
          At <Text style={styles.bold}>ZeniaHub</Text>, we believe that mental wellness starts with expression and connection. 
          You can share your thoughts through{' '}
          <Text style={styles.link} onPress={() => router.push('/blog')}>
            blog posts
          </Text>{' '}
          or join open{' '}
          <Text style={styles.link} onPress={() => router.push('/discussions')}>
            community discussions
          </Text>.
        </Text>

        <Text style={styles.paragraph}>
          You can also add a <Text style={styles.bold}>private username</Text> in your profile page 
          for anonymity, so you can express yourself freely while staying safe.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={() => router.push('/blog')}
        >
          <Text style={styles.buttonText}>Read Our Blog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => router.push('/discussions')}
        >
          <Text style={styles.buttonText}>Join Discussions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAF9F7',
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  header: {
    marginBottom: 32,
    maxWidth: 800,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: '#FF6B6B',
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  about: {
    maxWidth: 700,
    marginBottom: 32,
  },
  paragraph: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  link: {
    color: '#2E8B8B',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 8,
  },
  primary: {
    backgroundColor: '#FF6B6B',
  },
  secondary: {
    backgroundColor: '#2E8B8B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
