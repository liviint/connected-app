import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import AddEdit from "../../../../src/components/journal/AddEdit";

export default function CreateJournalPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AddEdit />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 768,
    width: "100%",
    alignSelf: "center",
    gap: 24, // spacing between elements, similar to space-y-6 in Tailwind
  },
});
