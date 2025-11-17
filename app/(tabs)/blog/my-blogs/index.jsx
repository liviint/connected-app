import React, { useState , useCallback} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BlogsList from '../../../../src/components/blogs/BlogsList';
import { useSelector } from 'react-redux';
import { useRouter, useFocusEffect } from 'expo-router';
import { blogApi } from '../../../../api';
import { globalStyles } from '../../../../src/styles/global';

export default function MyBlogsPage() {
  const user = useSelector((state) => state?.user?.userDetails);
  const [blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      if (!user?.user?.id) return;

      let isActive = true;

      const fetchBlogs = async () => {
        setLoading(true);
        try {
          const res = await blogApi.get(`blogs/?author=${user.user.id}`);

          if (isActive) {
            setBlogs(res.data.results);
          }
        } catch (error) {
          console.error('Error fetching blogs:', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchBlogs();

      return () => {
        isActive = false;
      };
    }, [user?.user?.id])
  );


  return (
    <View style={globalStyles.container} contentContainerStyle={globalStyles.containerContent}>
      <Text style={globalStyles.title}>My Blog Posts</Text>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => router.push('blog/new')}
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
