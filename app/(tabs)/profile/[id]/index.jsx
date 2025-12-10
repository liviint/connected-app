import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { blogApi } from "@/api";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await blogApi.get(`users/${id}/`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
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
          
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FAF9F7",
    minHeight: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  notFound: {
    fontSize: 18,
    color: "#333",
  },
  profileHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  bio: {
    fontSize: 14,
    color: "#444",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
});
