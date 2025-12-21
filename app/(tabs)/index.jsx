import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {useThemeStyles} from "../../src/hooks/useThemeStyles"

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomePage() {
  const { globalStyles, colors } = useThemeStyles();
  console.log(colors,"hello colors")
  const router = useRouter()

  // Responsive card width: 90% on small screens, 45% on larger screens
  const cardWidth = SCREEN_WIDTH < 500 ? '90%' : '45%';

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ZeniaHub</Text>
        <Text style={globalStyles.subTitle}>
          Your personal space to reflect, grow, and thrive.
        </Text>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/journal')}
          >
            <Text style={styles.buttonText}>Start Journaling</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/habits')}
          >
            <Text style={styles.buttonText}>Track Habits</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={[styles.featureCard, { width: cardWidth }]}>
          <Text style={styles.featureTitle}>📝 Journal</Text>
          <Text style={styles.featureText}>
            Capture your thoughts and track your personal growth.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.smallButton, styles.primaryButton]}
            onPress={() => router.push('/journal')}
          >
            <Text style={styles.buttonText}>Go to Journal</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.featureCard, { width: cardWidth }]}>
          <Text style={styles.featureTitle}>✅ Habits</Text>
          <Text style={styles.featureText}>
            Build and maintain habits that improve your daily life.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.smallButton, styles.secondaryButton]}
            onPress={() => router.push('/habits')}
          >
            <Text style={styles.buttonText}>View Habits</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.aboutContainer}>
        <Text style={{ textAlign:"center" }}>
          <Text style={{ fontWeight: 'bold' }}>ZeniaHub</Text> helps you reflect on your thoughts, track habits, and improve your daily life with simple journaling and habit tracking tools.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10, // use margin as fallback if gap unsupported
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: '#2E8B8B',
  },
  tertiaryButton: {
    backgroundColor: '#F4E1D2',
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
  tertiaryButtonText: {
    color: '#333333',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    marginVertical: 10,
  },
  featureTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  featureText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  aboutContainer: {
    maxWidth: 700,
    alignSelf: 'center',
    marginBottom: 40,
    textAlign:"center"
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
