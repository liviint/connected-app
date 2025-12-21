import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AddEdit from "../../../../../src/components/journal/AddEdit";
import { useThemeStyles } from "../../../../../src/hooks/useThemeStyles";

export default function CreateJournalPage() {
  const {globalStyles} = useThemeStyles()
  const { id } = useLocalSearchParams();
  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <AddEdit id={id}/>
    </ScrollView>
  );
}


