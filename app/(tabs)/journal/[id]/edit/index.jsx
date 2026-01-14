import { useLocalSearchParams } from "expo-router";
import AddEdit from "../../../../../src/components/journal/AddEdit";

export default function CreateJournalPage() {
  const { id } = useLocalSearchParams();
  return <AddEdit id={id}/>
}


