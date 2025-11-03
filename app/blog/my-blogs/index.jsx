import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import BlogsList from '../../../components/blogs/BlogsList';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { blogApi } from '../../../api';

export default function MyBlogsPage() {
  const user = useSelector((state) => state?.user?.userDetails);
  const [blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user?.user?.id) return;

    const fetchBlogs = async () => {
      try {
        const res = await blogApi.get(`blogs/?author=${user.user.id}`);
        console.log(res.data.results, 'Fetched blogs');
        setBlogs(res.data.results);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [user]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Blog Posts</Text>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewBlog')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add New Blog</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E8B8B" />
      ) : (
        <BlogsList initialBlogs={blogs} author={user?.user?.id} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F7',
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Poppins-Bold', // Optional, if using Expo fonts
    fontWeight: '700',
    fontSize: 24,
    color: '#2E8B8B',
    marginBottom: 16,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
