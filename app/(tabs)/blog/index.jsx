import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import BlogsList from '../../../src/components/blogs/BlogsList';
import { blogApi } from '../../../api';
import { globalStyles } from '../../../src/styles/global';

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
    
            const fetchBlogs = async () => {
                setLoading(true);
                try {
                    const res = await blogApi.get(`blogs/?published=true`);
            
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
        }, [])
    );

    return (
        <View style={globalStyles.container} contentContainerStyle={globalStyles.containerContent}>
            <Text style={globalStyles.title}>Our Latest Blog Posts</Text>
            {loading ? <ActivityIndicator size="large" color="#2E8B8B" /> : <BlogsList initialBlogs={blogs} />}
        </View>
    );
}
