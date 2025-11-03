import React from "react";
import { View, TouchableOpacity, Alert, Share, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

export default function ShareButton({ product = {}, url }) {
  const { title } = product;

  const handleShare = async () => {
    try {
      await Share.share({
        title: title || "Check this out",
        message: `${title ? title + " - " : ""}${url}`,
        url,
      });
    } catch (error) {
      console.log("Share failed:", error);
      Alert.alert("Error", "Could not share link");
    }
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(url);
    Alert.alert("Copied", "Link copied to clipboard!");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleShare}
        onLongPress={copyLink}
      >
        <Ionicons name="share-social-outline" size={22} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
