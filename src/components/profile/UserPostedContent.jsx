import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { blogApi } from "@/api";

const UserPostedContent = ({ userId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await blogApi.get(`discussions/?author=${userId}`);
        setDiscussions(res.data.results);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchBlogs = async () => {
        blogApi.get(`/blogs/?author=${userId}&published=true`)
        .then(res => {
          setBlogs(res.data.results);
        })
        .catch (err => {
          console.error(err,"hello err");
        })
    };

    fetchDiscussions();
    fetchBlogs();
  }, [userId]);

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.sectionTitle}>Recent Posts</Text>

      {/* Discussions */}
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.subTitle}>Discussions</Text>

        {discussions.slice(0, 5).map((d) => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.cardTitle}>{d.title}</Text>

            <Text style={styles.cardSummary}>
              {d.content.slice(0, 120)}...
            </Text>

            <Link
              href={`/discussions/${d.slug}/${d.id}`}
              style={styles.readMore}
            >
              Read More →
            </Link>
          </View>
        ))}
      </View>

      {/* Blogs */}
      <View>
        <Text style={styles.subTitle}>Blogs</Text>

        {blogs.slice(0, 5).map((blog) => (
          <View key={blog.id} style={styles.card}>
            <Text style={styles.cardTitle}>{blog.title}</Text>

            <Text style={styles.cardSummary}>{blog.summary}</Text>

            <Link
              href={`/blog/${blog.slug}/${blog.id}`}
              style={styles.readMore}
            >
              Read More →
            </Link>
          </View>
        ))}
      </View>
    </View>
  );
};

export default UserPostedContent;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  readMore: {
    marginTop: 5,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
});
