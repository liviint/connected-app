import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import BlogsList from '../../components/blogs/BlogsList';
import { blogApi } from '../../api';

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
        const res = await blogApi.get('blogs/?published=true');
        setBlogs(res.data.results);
        } catch (err) {
        console.error('Error fetching blogs:', err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <View style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Our Latest Blog Posts</Text>
            {loading ? <ActivityIndicator size="large" color="#2E8B8B" /> : <BlogsList blogs={blogs} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FAF9F7',
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    title: {
        textAlign: 'center',
        fontFamily: 'Poppins-Bold', // optional if using Expo fonts
        fontWeight: '700',
        fontSize: 24,
        color: '#2E8B8B',
        marginBottom: 24,
    },
});
