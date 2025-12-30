'use client';

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

export default function HabitsScreen({initialHabits}) {
  const { globalStyles } = useThemeStyles();
  const isFocused = useIsFocused()
  const [habits, setHabits] = useState(initialHabits);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  let fetchHabits = async() => {
      if(!isFocused) return
      let habits = await getHabits()
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

  const onDragEnd = ({ data }) => {
    setHabits(data);
  };

  if (loading) return <PageLoader />

  if (habits.length === 0) {
    return (
      <View style={globalStyles.container}>
        <BodyText style={styles.emptyMessage}>No habits yet. Create your first one!</BodyText>

        <TouchableOpacity
          style={globalStyles.primaryBtn}
          onPress={() => router.push("/habits/add")}
        >
          <Text style={globalStyles.primaryBtnText}>+ Add habit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={globalStyles.container}>
      <DraggableFlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
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
                style={{flex:1,...globalStyles.primaryBtn}}
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  emptyMessage: {
    textAlign: "center",
    marginBottom: 16,
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
