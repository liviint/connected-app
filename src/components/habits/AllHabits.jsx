'use client';

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import { api } from "../../../api";
import HabitRow from "./HabitRow";
import { useThemeStyles } from "../../hooks/useThemeStyles";

export default function HabitsScreen() {
  const { globalStyles, colors } = useThemeStyles();
  const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);
    const isFocused = useIsFocused()
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  const fetchHabits = (reload) => {
    reload && setLoading(true)
    api.get("/habits/")
        .then((res) => {
            setHabits(res.data.results);
        })
        .catch(console.error)
        .finally(() => {
            setLoading(false);
        });
  }

  useEffect(() => {
    if (!isFocused) return;
    fetchHabits(true)
}, [isFocused]);

useEffect(() => {
    fetchHabits()
}, [refreshData]);

  const saveOrder = async (newData) => {
    try {
      const order = newData.map((h) => h.id);
      await api.post("/habits/reorder/", { order });
    } catch (error) {
      console.log("Order save failed:", error);
    }
  };

  const onDragEnd = ({ data }) => {
    setHabits(data);
    saveOrder(data);
  };

  if (!isUserLoggedIn && !loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.authMessage}>
          Your personal habit tracker is waiting. Log in to continue.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyMessage}>No habits yet. Create your first one!</Text>

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    color: "#666",
    fontSize: 16,
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
