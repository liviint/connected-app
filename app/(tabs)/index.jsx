import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ZeniaHub 🌿</Text>
        <Text style={styles.subtitle}>
          Your personal space to reflect, grow, and stay accountable.
        </Text>
      </View>

      <View style={styles.about}>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>ZeniaHub</Text> helps you improve your mental and
          emotional wellness through powerful tools like{" "}
          <Text style={styles.link} onPress={() => router.push("/journal")}>
            journaling
          </Text>
          ,{" "}
          <Text style={styles.link} onPress={() => router.push("/habits")}>
            habit tracking
          </Text>
          , and inspiring{" "}
          <Text style={styles.link} onPress={() => router.push('/blog')}>
            blog content
          </Text>
          .
        </Text>

        <Text style={styles.paragraph}>
          You can connect with up to <Text style={styles.bold}>5 close friends</Text> who
          support your growth journey, keep you accountable, and stay connected through
          private interactions—always in a safe, calm, and private environment.
        </Text>

        <Text style={styles.paragraph}>
          ZeniaHub is designed for people who want a peaceful space, without the noise of
          large public forums or overwhelming communities.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={() => router.push("journal")}
        >
          <Text style={styles.buttonText}>Start Journaling</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => router.push("habits")}
        >
          <Text style={styles.buttonText}>Track Habits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiary]}
          onPress={() => router.push("blog")}
        >
          <Text style={[styles.buttonText, { color: "#333" }]}>Read Blog</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7", 
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 30,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#2E8B8B", 
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
    opacity: 0.8,
  },

  about: {
    marginVertical: 20,
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
    color: "#333333",
    marginBottom: 16,
  },

  bold: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
  },

  link: {
    color: "#FF6B6B",
    fontFamily: "Inter-Bold",
  },

  actions: {
    marginTop: 20,
    gap: 12,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  primary: {
    backgroundColor: "#FF6B6B",
  },

  secondary: {
    backgroundColor: "#2E8B8B",
  },

  tertiary: {
    backgroundColor: "#F4E1D2",
  },

  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 15,
  },
});
