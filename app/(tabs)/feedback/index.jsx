import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { blogApi } from '../../../api';
import {useThemeStyles} from "../../../src/hooks/useThemeStyles"
import { Card, BodyText, Input, TextArea } from '../../../src/components/ThemeProvider/components';

export default function FeedbackPage() {
  const {globalStyles} = useThemeStyles()
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await blogApi.post('feedback/', { message }); 
      console.log(res.data, 'Feedback response');
      setSubmitted(true);
      setMessage('');
    } catch (error) {
      console.error(error, 'Feedback error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card >
          <BodyText style={globalStyles.title}>Share Your Feedback</BodyText>
          <BodyText style={styles.subtitle}>
            Your input helps us make ZeniaHub a better space for personal growth and productivity.
          </BodyText>

          {submitted ? (
            <View style={styles.centered}>
              <Text style={styles.thankYou}>Thank you for your feedback!</Text>
              <TouchableOpacity style={styles.submitAnotherBtn} onPress={() => setSubmitted(false)}>
                <Text style={styles.submitAnotherText}>Submit Another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextArea
                value={message}
                onChangeText={setMessage}
                placeholder="Write your feedback here..."
                multiline
                style={styles.textArea}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FAF9F7" />
                ) : (
                  <Text style={styles.submitText}>Submit Feedback</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#FAF9F7',
    fontWeight: '700',
    fontSize: 16,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  thankYou: {
    fontSize: 18,
    color: '#2E8B8B',
    fontWeight: '500',
    marginBottom: 16,
  },
  submitAnotherBtn: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitAnotherText: {
    color: '#FAF9F7',
    fontWeight: '700',
  },
});
