import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import { api } from "../../../api";
import AllHabits from "../../../src/components/habits/AllHabits";
import ProtectedAccessPage from "../../../src/components/common/ProtectedAccessPage";

export default function HabitsPage() {
  const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  useEffect(() => {
    api
      .get("/habits/")
      .then((res) => setHabits(res.data.results))
      .finally(() => setLoading(false));
  }, [refreshData]);

  const saveOrder = async () => {
    try {
      const order = habits.map((h) => h.id);
      await api.post("/habits/reorder/", { order });
    } catch (err) {
      console.log("Order save failed:", err);
    }
  };

  // Auto-save habit order
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(saveOrder, 500);
      return () => clearTimeout(timer);
    }
  }, [habits]);

  // Authentication check
  if (!isUserLoggedIn && !loading) return <ProtectedAccessPage />
  

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Habits</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/habits/add")}
        >
          <Text style={styles.addButtonText}>+ Add habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.push("/habits/entries")}
        >
          <Text style={styles.trackButtonText}>Track progress</Text>
        </TouchableOpacity>
      </View>

      <AllHabits habits={habits} setHabits={setHabits} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 80,
    backgroundColor: "#FAF9F7",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  addButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  trackButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  trackButtonText: {
    color: "#FF6B6B",
    fontWeight: "700",
    fontSize: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  protectedWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  protectedText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    lineHeight: 26,
  },
});
