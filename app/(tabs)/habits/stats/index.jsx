import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { generateAllHabitsStatsWithBestWorst } from "../../../../src/db/habitsStats";
import { useSQLiteContext } from 'expo-sqlite';

export default function AllHabitsStatsScreen() {
    const db = useSQLiteContext();
  const { colors } = useThemeStyles();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await generateAllHabitsStatsWithBestWorst(db, "user_uuid_here"); 
        setStats(result);
      } catch (err) {
        console.error("Failed to load habit stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No stats available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.heading, { color: colors.text }]}>All Habits Stats</Text>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Overall</Text>
        <Text style={{ color: colors.text }}>Total Habits: {stats.total_habits}</Text>
        <Text style={{ color: colors.text }}>Total Entries: {stats.total_entries}</Text>
        <Text style={{ color: colors.text }}>Completed Entries: {stats.completed_entries}</Text>
        <Text style={{ color: colors.text }}>Missed Entries: {stats.missed_entries}</Text>
        <Text style={{ color: colors.text }}>Progress: {stats.progress_percent}%</Text>
        <Text style={{ color: colors.text }}>Avg Current Streak: {stats.avg_current_streak}</Text>
        <Text style={{ color: colors.text }}>Avg Longest Streak: {stats.avg_longest_streak}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Best / Worst Habits</Text>
        {stats.best_habit && (
          <Text style={{ color: colors.text }}>
            Best Habit: {stats.best_habit.habit_title} ({stats.best_habit.progress_percent}%)
          </Text>
        )}
        {stats.worst_habit && (
          <Text style={{ color: colors.text }}>
            Worst Habit: {stats.worst_habit.habit_title} ({stats.worst_habit.progress_percent}%)
          </Text>
        )}
        {stats.longest_streak_habit && (
          <Text style={{ color: colors.text }}>
            Longest Streak Habit: {stats.longest_streak_habit.habit_title} ({stats.longest_streak_habit.longest_streak})
          </Text>
        )}
        {stats.current_streak_habit && (
          <Text style={{ color: colors.text }}>
            Current Streak Habit: {stats.current_streak_habit.habit_title} ({stats.current_streak_habit.current_streak})
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Trend (Completed per Day)</Text>
        {stats.trend.map((t) => (
          <Text key={t.day} style={{ color: colors.text }}>
            {t.day}: {t.completed}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Per Weekday</Text>
        {stats.per_weekday.map((w) => (
          <Text key={w.weekday} style={{ color: colors.text }}>
            Weekday {w.weekday}: {w.count}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Per Month</Text>
        {stats.per_month.map((m) => (
          <Text key={m.month} style={{ color: colors.text }}>
            {m.month}: {m.count}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#FAF9F7", // can replace with colors.card if you have
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
});