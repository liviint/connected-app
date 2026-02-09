import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { router } from "expo-router";
import HabitRow from "./HabitRow";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import PageLoader from "../common/PageLoader";
import { BodyText } from "../ThemeProvider/components";
import { getHabits } from "../../db/habitsDb";
import { useSQLiteContext } from 'expo-sqlite';
import { syncManager } from "../../../utils/syncManager";

export default function HabitsScreen({initialHabits}) {
  const db = useSQLiteContext(); 
  const { globalStyles } = useThemeStyles();
  const isFocused = useIsFocused()
  const [habits, setHabits] = useState(initialHabits);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  let fetchHabits = async() => {
      if(!isFocused) return
      let habits = await getHabits(db)
      setHabits(habits)
      setLoading(false)
  }

  useEffect(() => {
    if (!isFocused) return;
    fetchHabits(true)
}, [isFocused]);

useEffect(() => {
    fetchHabits()
}, [refreshData]);

useEffect(() => {
  const unsub = syncManager.on("habits_updated", async () => {
    const updated = await getHabits(db);
    setHabits(updated);
  });

  return unsub;
}, []);


  const onDragEnd = ({ data }) => {
    setHabits(data);
  };

  if (loading) return <PageLoader />

  if (habits.length === 0) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Your Habits</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={globalStyles.primaryBtn}
            onPress={() => router.push("/habits/add")}
          >
            <Text style={globalStyles.primaryBtnText}>+ Add habit</Text>
          </TouchableOpacity>
        </View>
        <BodyText style={styles.emptyMessage}>You haven’t added any habits yet.  
  Start with one small habit to build consistency.</BodyText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={globalStyles.container}>
      <DraggableFlatList
        data={habits}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item, index, drag, isActive }) => (
          <HabitRow
            habit={item}
            index={index}
            drag={drag}
            isActive={isActive}
            setRefreshData={setRefreshData}
          />
        )}
        onDragEnd={onDragEnd}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={globalStyles.title}>Your Habits</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={globalStyles.primaryBtn}
                onPress={() => router.push("/habits/add")}
              >
                <Text style={globalStyles.primaryBtnText}>+ Add habit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{flex:1,...globalStyles.secondaryBtn}}
                onPress={() => router.push("/habits/entries")}
              >
                <Text style={globalStyles.secondaryBtnText}>Track progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  buttonRow: {
    marginBottom:20,
    display:"flex",
    flexDirection:"row",
    justifyContent:"center",
  },
  emptyMessage: {
    textAlign: "center",
    marginBottom: 16,
    marginTop: 40, 
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  authMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 16,
  },
});
