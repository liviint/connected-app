import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AddEditBlogForm from '../../../../src/components/blogs/AddEditBlogForm';

export default function NewBlogPage() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Blog</Text>
      <AddEditBlogForm />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
    padding: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    fontSize: 22,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
});
