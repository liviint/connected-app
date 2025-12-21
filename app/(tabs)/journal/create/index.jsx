import { ScrollView } from "react-native";
import AddEdit from "../../../../src/components/journal/AddEdit";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";

export default function CreateJournalPage() {
  const {globalStyles} = useThemeStyles()
  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <AddEdit />
    </ScrollView>
  );
}
