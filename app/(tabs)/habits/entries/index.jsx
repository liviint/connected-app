import { useEffect, useState, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../../../api";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { Card, BodyText } from "../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../src/components/common/PageLoader";

export default function HabitEntriesPage() {
  const router = useRouter();
  const isFocused = useIsFocused()
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
   const { globalStyles, colors } = useThemeStyles();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if(!isFocused) return
    api
      .get("habits/entries/entries/")
      .then((res) => setEntries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isFocused]);
  const completed = entries.filter((h) => h.completed).length;
  const total = entries.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const toggleCompletion = (habitId) => {
    api
      .put("/habits/entries/toggle/", { habit_id: habitId })
      .then((res) => {
        setEntries((prev) =>
          prev.map((h) => (h.habit_id === habitId ? res.data : h))
        );
      })
      .catch(console.error);
  };

  if (loading) return  <PageLoader />
  
  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text
        style={globalStyles.title}
      >
        Today’s Habits
      </Text>

      {/* PROGRESS CARD */}
      <Card
        style={{
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
        }}
      >
        <View>
          <BodyText style={{ fontSize: 18, fontWeight: "600",}}>
            Today’s progress
          </BodyText> 
        </View>

        <View
          style={{
            width: "100%",
            height: 10,
            backgroundColor: "#e5e7eb",
            borderRadius: 10,
            marginTop: 8,
          }}
        >
          <Animated.View
            style={{
              height: 10,
              borderRadius: 10,
              backgroundColor: "#FF6B6B",
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>

        <BodyText style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
          {completed}/{total}
        </BodyText>
      </Card>

      {/* HABIT LIST */}
      {entries.map((habit) => (
        <TouchableOpacity
          key={habit.id + habit.title }
          activeOpacity={0.85}
          style={{
            backgroundColor: habit.completed ? "#e8fbe8" : colors.background,
            ...styles.rowContainer
          }}
        >
          <View style={styles.titleContainer}>
            <BodyText style={{...styles.title,color:habit.completed ? "#000" : colors.text}}>
              {habit.title}
            </BodyText>
            <BodyText style={{ fontSize: 14, marginTop: 4, color:habit.completed ? "#666" : colors.text}}>
              Streak: {habit.current_streak}{" "}
              {habit.current_streak > 1 ? "days" : "day"}
            </BodyText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push(`/habits/${habit.habit_id}/stats`)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                backgroundColor: "#2E8B8B",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Stats</Text>
            </TouchableOpacity>

            {/* TOGGLE BUTTON */}
            <TouchableOpacity
              onPress={() => toggleCompletion(habit.habit_id)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: habit.completed ? "#FF6B6B" : "#ccc",
                backgroundColor: habit.completed ? "#FF6B6B" : "white",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: habit.completed ? "white" : "#666", fontWeight: "800" }}>
                {habit.completed ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {/* BOTTOM BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 24,
          gap: 16,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/habits/add")}
          style={{flex:1,...globalStyles.primaryBtn}}
        >
          <Text style={globalStyles.primaryBtnText}>
            + Add habit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/habits")}
          style={{flex:1,...globalStyles.secondaryBtn}}
        >
          <Text style={globalStyles.secondaryBtnText}>
            All Habits
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  rowContainer:{
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap:12,
  },
  titleContainer:{
    flex:1,
    minWidth:0,
  },
  title:{
    fontSize: 18, 
    fontWeight: "600", 
    flexWrap:"wrap",
    flexShrink: 1,
  }
}
