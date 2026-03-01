import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { generateAllHabitsStatsWithBestWorst } from "./../../../../src/db/habitsStats";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useSQLiteContext } from 'expo-sqlite';
import { Card } from "../../../../src/components/ThemeProvider/components";

const screenWidth = Dimensions.get("window").width - 32; 

export default function AllHabitsStatsScreen() {
    const {globalStyles} = useThemeStyles()
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

    const trendLabels = stats.trend.map(t => t.day);
    const trendData = stats.trend.map(t => t.completed);

    const weekdayLabels = stats.per_weekday.map(w => `W${w.weekday}`);
    const weekdayData = stats.per_weekday.map(w => w.count);

    const monthLabels = stats.per_month.map(m => m.month);
    const monthData = stats.per_month.map(m => m.count);

    const chartConfig = {
        backgroundGradientFrom: "#FAF9F7",
        backgroundGradientTo: "#FAF9F7",
        color: (opacity = 1) => colors.primary + Math.floor(opacity * 255).toString(16),
        strokeWidth: 2,
        decimalPlaces: 0,
        labelColor: () => colors.text,
        propsForDots: { r: "4", strokeWidth: "2", stroke: colors.secondary },
    };

    return (
        <ScrollView style={globalStyles.container}>
        <Text style={globalStyles.title}>All Habits Stats</Text>

        <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Overall</Text>
            <Text style={{ color: colors.text }}>Total Habits: {stats.total_habits}</Text>
            <Text style={{ color: colors.text }}>Total Entries: {stats.total_entries}</Text>
            <Text style={{ color: colors.text }}>Completed Entries: {stats.completed_entries}</Text>
            <Text style={{ color: colors.text }}>Missed Entries: {stats.missed_entries}</Text>
            <Text style={{ color: colors.text }}>Progress: {stats.progress_percent}%</Text>
            <Text style={{ color: colors.text }}>Avg Current Streak: {stats.avg_current_streak}</Text>
            <Text style={{ color: colors.text }}>Avg Longest Streak: {stats.avg_longest_streak}</Text>
        </Card>

        <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Best / Worst Habits</Text>
            {stats.best_habit && <Text style={{ color: colors.text }}>Best: {stats.best_habit.habit_title} ({stats.best_habit.progress_percent}%)</Text>}
            {stats.worst_habit && <Text style={{ color: colors.text }}>Worst: {stats.worst_habit.habit_title} ({stats.worst_habit.progress_percent}%)</Text>}
            {stats.longest_streak_habit && <Text style={{ color: colors.text }}>Longest Streak: {stats.longest_streak_habit.habit_title} ({stats.longest_streak_habit.longest_streak})</Text>}
            {stats.current_streak_habit && <Text style={{ color: colors.text }}>Current Streak: {stats.current_streak_habit.habit_title} ({stats.current_streak_habit.current_streak})</Text>}
        </Card>

        <Card >
            <Text style={[styles.cardTitle, { color: colors.text }]}>Trend (Completed per Day)</Text>
            {trendData.length > 0 ? (
            <LineChart
                data={{
                labels: trendLabels,
                datasets: [{ data: trendData }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
            />
            ) : (
            <Text style={{ color: colors.text }}>No trend data</Text>
            )}
        </Card>

        <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Per Weekday</Text>
            {weekdayData.length > 0 ? (
            <BarChart
                data={{
                labels: weekdayLabels,
                datasets: [{ data: weekdayData }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
                fromZero
            />
            ) : (
            <Text style={{ color: colors.text }}>No weekday data</Text>
            )}
        </Card>

        <Card >
            <Text style={[styles.cardTitle, { color: colors.text }]}>Per Month</Text>
            {monthData.length > 0 ? (
            <BarChart
                data={{
                labels: monthLabels,
                datasets: [{ data: monthData }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
                fromZero
            />
            ) : (
            <Text style={{ color: colors.text }}>No monthly data</Text>
            )}
        </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
    heading: { 
        fontSize: 24, 
        fontWeight: "700", 
        marginBottom: 16 
    },
    cardTitle: { 
        fontSize: 16, 
        fontWeight: "700", 
        marginBottom: 8 
    },
});