import React, { useEffect, useState,useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams , useFocusEffect} from "expo-router";
import { blogApi } from "@/api";
import FollowButton from "../../../../src/components/social/FollowButton";
import FriendshipButton from "../../../../src/components/social/FriendshipButton";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const res = await blogApi.get(`users/${id}/`);
          setUser(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    },[id])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user.profilePic ||
              "https://liviints.sgp1.cdn.digitaloceanspaces.com/media/profile_pics/Portrait_Placeholder.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>{user.bio || ""}</Text>
          <View style={styles.buttons}>
            <FollowButton userId={id} />
            <FriendshipButton userId={id} />
          </View>
        </View>
      </View>

      {/* User Posts/Journal Entries */}
      <View style={styles.postsContainer}>
        <Text style={styles.postsTitle}>Recent Posts</Text>
        {user.posts && user.posts.length > 0 ? (
          user.posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noPosts}>
            This user hasn’t shared any posts yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FAF9F7",
    minHeight: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F7",
  },
  loadingText: {
    marginTop: 8,
    color: "#333333",
    fontSize: 16,
  },
  notFoundText: {
    color: "#333333",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  bio: {
    fontSize: 14,
    color: "#333333",
    marginTop: 4,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  postsContainer: {
    marginTop: 16,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  postCard: {
    padding: 12,
    backgroundColor: "#F4E1D2",
    borderRadius: 16,
    marginBottom: 12,
  },
  postContent: {
    color: "#333333",
    fontSize: 14,
  },
  noPosts: {
    fontSize: 14,
    color: "#333333",
  },
});
