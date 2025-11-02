import React from "react";
import { useSelector } from "react-redux";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function LoginFirst() {
  const user = useSelector((state) => state?.user?.userDetails);
  const router = useRouter();

  if (user) return null;

  return (
    <View style={styles.hintContainer}>
      <Text style={styles.hintText}>
        <Text> </Text>
        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.loginLink}>Login</Text>
        </Pressable>
        <Text> to post</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  hintText: {
    color: "#2E8B8B", 
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "400", 
    textAlign: "center",
  },
  loginLink: {
    color: "#FF6B6B", 
    fontWeight: "700", 
    textDecorationLine: "underline",
  },
});
