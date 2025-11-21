import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { api } from "@/api";

export default function FollowButton({ userId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollow = async () => {
      try {
        const res = await api.get(`social/follows?user=${userId}`);
        if (res.data.results.length > 0) setIsFollowing(true);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    checkFollow();
  }, [userId]);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.post("social/follows/unfollow/", { user_id: userId });
        setIsFollowing(false);
      } else {
        await api.post("social/follows/", { user_id: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.log(err, "toggle follow error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.button, styles.loading]}>
        <ActivityIndicator color="#333333" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={toggleFollow}
      style={[
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
      ]}
    >
      <Text style={[styles.text, isFollowing ? styles.followingText : styles.notFollowingText]}>
        {isFollowing ? "Following" : "Follow"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loading: {
    backgroundColor: "#E0E0E0",
  },
  following: {
    backgroundColor: "#F4E1D2",
  },
  notFollowing: {
    backgroundColor: "#FF6B6B",
  },
  text: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
  },
  followingText: {
    color: "#333333",
  },
  notFollowingText: {
    color: "#FFFFFF",
  },
});
