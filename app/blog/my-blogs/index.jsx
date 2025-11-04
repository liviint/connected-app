import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BlogsList from '../../../src/components/blogs/BlogsList';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { blogApi } from '../../../api';
import { globalStyles } from '../../../src/styles/global';

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
    <View style={globalStyles.container} contentContainerStyle={globalStyles.containerContent}>
      <Text style={globalStyles.title}>My Blog Posts</Text>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewBlog')}
          style={globalStyles.secondaryBtn}
        >
          <Text style={styles.addButtonText}>+ Add New Blog</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E8B8B" />
      ) : (
        <BlogsList initialBlogs={blogs} author={user?.user?.id} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
