import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Like({ liked, handleLike, likes, error }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.likeButton, liked && styles.likedButton]}
        onPress={handleLike}
        disabled={liked}
        activeOpacity={0.8}
      >
        <Text style={[styles.likeText, liked && styles.likedText]}>
          ❤️ {likes}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  likeButton: {
    backgroundColor: "#eee",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  likedButton: {
    backgroundColor: "#FF6B6B",
  },
  likeText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },
  likedText: {
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginLeft: 8,
  },
});
