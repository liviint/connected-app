import { StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AddEdit from "../../../../../src/components/journal/AddEdit";

export default function CreateJournalPage() {
  const { id } = useLocalSearchParams();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AddEdit id={id}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 768,
    width: "100%",
    alignSelf: "center",
    gap: 24, 
  },
});
