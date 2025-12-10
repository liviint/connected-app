import React, { useEffect, useState, useCallback,  } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSelector } from "react-redux";
import { router,useFocusEffect } from "expo-router";
import { api } from "../../../api";
import HabitRow from "./HabitRow"; 

export default function AllHabits() {
  const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            setLoading(true);
            api.get("/habits/")
                .then((res) => {
                if (isActive) setHabits(res.data.results);
                })
                .catch(console.error)
                .finally(() => {
                if (isActive) setLoading(false);
                });

            return () => {
                isActive = false; 
            };
        }, [refreshData])
    );


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
      <Text style={styles.emptyMessage}>No habits yet. Create your first one!</Text>
    );
  }

  return (
    <View style={styles.container}>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    padding: 24,
  },
});
