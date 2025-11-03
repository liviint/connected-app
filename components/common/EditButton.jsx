import React from "react";
import { useSelector } from "react-redux";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function EditButton({ contentAuthor, href }) {
  const loggedUser = useSelector(
    (state) => state?.user?.userDetails?.user?.id
  );
  const navigation = useNavigation();

  if (loggedUser !== contentAuthor) return null;

  const handlePress = () => {
    // Navigate to the edit screen (href becomes your route name)
    navigation.navigate(href);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editText: {
    color: "#D97706", // Tailwind yellow-600
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
