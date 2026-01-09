import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AddEdit from "../../../../../src/components/journal/AddEdit";

export default function CreateJournalPage() {
  const { id } = useLocalSearchParams();
  return (
    <ScrollView >
      <AddEdit id={id}/>
    </ScrollView>
  );
}


