import React from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AddEditBlogForm from '../../../../components/blogs/AddEditBlogForm';

export default function EditBlogPage() {
  const route = useRoute();
  const { id } = route.params || {}; 

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{id ? 'Edit Blog' : 'Add New Blog'}</Text>
      <AddEditBlogForm blogId={id} />
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
