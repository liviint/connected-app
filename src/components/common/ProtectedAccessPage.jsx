import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { BodyText } from '../ThemeProvider/components';

const ProtectedAccessPage = ({ message }) => {
    const router = useRouter()
    const {globalStyles} = useThemeStyles()

    return (
        <View style={{...globalStyles.container,...styles.container}}>
        <BodyText style={styles.heading}>
            Your space awaits
        </BodyText>
        <BodyText style={styles.subtext}>
            {message || "Your personal journal and habit tracker are waiting for you. Please sign up or log in to continue."}
        </BodyText>

        <View style={styles.buttonContainer}>
            <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            >
            <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/signup')}
            >
            <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12, 
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  signupButton: {
    borderWidth: 2,
    borderColor: '#2E8B8B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signupButtonText: {
    color: '#2E8B8B',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProtectedAccessPage;
