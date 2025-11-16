import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { blogApi } from '../../../api';

export default function FeedbackPage() {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Share Your Feedback</Text>
          <Text style={styles.subtitle}>
            Your thoughts help us make ZeniaHub a better space for mental wellness.
          </Text>

          {submitted ? (
            <View style={styles.centered}>
              <Text style={styles.thankYou}>Thank you for your feedback!</Text>
              <TouchableOpacity style={styles.submitAnotherBtn} onPress={() => setSubmitted(false)}>
                <Text style={styles.submitAnotherText}>Submit Another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F4E1D2',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '400',
    marginBottom: 20,
  },
  textArea: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAF9F7',
    color: '#333',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2E8B8B',
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
