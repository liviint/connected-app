import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

import LoginFirst from "../common/LoginFirst"; // keep your converted version later
import { api, blogApi } from "../../api";

export default function Comments({ blogId }) {
  const user = useSelector((state) => state?.user?.userDetails);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    author: user?.user?.id,
    blog: blogId,
    content: "",
  });

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await blogApi.get(`blogs/comments/?blog=${blogId}`);
        setComments(res.data.results);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };
    fetchComments();
  }, [blogId]);

  // Handle submit
  const handleSubmit = async () => {
    if (!formData.content.trim() || !user) return;

    setLoading(true);
    try {
      const res = await api.post(`blogs/comments/?blog=${blogId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.access}` },
        }
      );
      setComments([res.data, ...comments]);
      setFormData((prev) => ({ ...prev, content: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.author}>{item.author_name}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Comments ({comments.length})</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.textArea}
          placeholder="Write a comment..."
          value={formData.content}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, content: text }))}
          multiline
          editable={!!user}
        />

        <TouchableOpacity
          style={[styles.button, (!user || loading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!user || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Post Comment</Text>
          )}
        </TouchableOpacity>

        <LoginFirst />
      </View>

      {comments.length > 0 ? (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          contentContainerStyle={{ paddingTop: 10 }}
        />
      ) : (
        <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  form: {
    marginBottom: 16,
  },
  textArea: {
    width: "100%",
    minHeight: 80,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  comment: {
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  author: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  content: {
    fontSize: 15,
    color: "#333",
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  noComments: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
});
