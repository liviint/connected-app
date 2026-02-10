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
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { Card, BodyText } from "../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../src/components/common/PageLoader";
import { useSQLiteContext } from 'expo-sqlite';
import { getHabitsForToday , toggleHabitEntry} from "../../../../src/db/habitsDb";
import uuid from 'react-native-uuid';
import { syncManager } from "../../../../utils/syncManager";
import { AddButton } from "../../../../src/components/common/AddButton";
import ButtonLinks from "../../../../src/components/common/ButtonLinks";

export default function HabitEntriesPage() {
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused()
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { globalStyles, colors } = useThemeStyles();
  const progressAnim = useRef(new Animated.Value(0)).current;

  let fetchEntries = async () => {
      if(!isFocused) return
      let entries = await getHabitsForToday(db,uuid)
      setEntries(entries)
      setLoading(false)
    }
    

  useEffect(() => {
    fetchEntries()
  }, [isFocused]);

  useEffect(() => {
    const unsub = syncManager.on("habits_updated", async () => {
      const updated = await getHabitsForToday(db);
      setEntries(updated);
    });
  
    return unsub;
  }, []);

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

  const toggleCompletion = async (entry) => {
    await toggleHabitEntry(db,{...entry,completed:!entry.completed})
    fetchEntries()
  };

  if (loading) return  <PageLoader />
  
  return (
    <>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Text
          style={globalStyles.title}
        >
          Today’s Habits
        </Text>

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

        <ButtonLinks 
          links={[
            {name:"All Habits",route:"/habits"}
          ]}
        />

        {entries.map((habit) => (
          <TouchableOpacity
            key={habit.uuid + habit.title }
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
                onPress={() => router.push(`/habits/${habit.habit_uuid}/stats`)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  backgroundColor: "#2E8B8B",
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Stats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleCompletion(habit)}
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

      </ScrollView>
      <AddButton
        primaryAction={{route:"/habits/add", label:"Add habit"}}
      />
    </>
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
