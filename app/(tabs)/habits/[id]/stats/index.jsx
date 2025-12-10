'use client';

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../../../../api";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

export default function HabitStatsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!id) return;

    api
      .get(`habits/habits/${id}/stats/`)
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!stats)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 10 }}>Loading stats...</Text>
      </View>
    );

  const screenWidth = Dimensions.get("window").width - 20;

  // ===== Formatting Helpers =====
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const weekdayData = stats?.per_weekday?.map((item) => ({
    label: WEEKDAYS[item.weekday - 1] ?? "N/A",
    value: item.count ?? 0,
  })) || [];

  const monthlyData = stats?.per_month?.map((item) => {
    const monthNumber = parseInt(item.month?.slice(5, 7) ?? 1, 10);
    return {
      month: monthNames[monthNumber - 1] ?? "N/A",
      count: item.count ?? 0,
    };
  }) || [];

  const trendData = stats?.trend?.map((entry) => ({
    date: entry.day ?? "",
    value: entry.completed ? 1 : 0,
  })) || [];

  const completionPieData = [];

const completed = stats?.completed_entries ?? 0;
const total = stats?.total_entries ?? 0;
const missed = total - completed;

if (total > 0) {
  if (completed > 0) {
    completionPieData.push({
      name: "Completed",
      population: completed,
      color: "#2E8B8B",
      legendFontColor: "#333",
      legendFontSize: 14,
    });
  }

  if (missed > 0) {
    completionPieData.push({
      name: "Missed",
      population: missed,
      color: "#F4E1D2",
      legendFontColor: "#333",
      legendFontSize: 14,
    });
  }
}


  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        {stats?.habit ?? "Habit"} — Stats
      </Text>

      {/* Summary Cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <StatCard title="Progress" value={`${stats?.progress_percent ?? 0}%`} />
        <StatCard title="Completed" value={completed} />
        <StatCard title="Total Logs" value={total} />
        <StatCard title="Longest Streak" value={stats?.longest_streak ?? 0} />
      </View>

        <ChartCard title="Completion Breakdown">
            {completionPieData.length > 0 ? (
                <PieChart
                data={completionPieData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                />
            ) : (
                <Text style={{ textAlign: "center", color: "#666" }}>
                No completion data yet.
                </Text>
            )}
        </ChartCard>


      {/* Weekday Bar Chart */}
      <ChartCard title="Completions Per Weekday">
        {weekdayData.length > 0 ? (
          <BarChart
            data={{
              labels: weekdayData.map((d) => d.label),
              datasets: [{ data: weekdayData.map((d) => d.value) }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
          />
        ) : (
          <Text style={{ textAlign: "center", color: "#666" }}>No weekday data yet.</Text>
        )}
      </ChartCard>

      {/* Monthly Bar Chart */}
      <ChartCard title="Monthly Activity">
        {monthlyData.length > 0 ? (
          <BarChart
            data={{
              labels: monthlyData.map((d) => d.month),
              datasets: [{ data: monthlyData.map((d) => d.count) }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
          />
        ) : (
          <Text style={{ textAlign: "center", color: "#666" }}>No monthly data yet.</Text>
        )}
      </ChartCard>

      {/* Trend Line Chart */}
      <ChartCard title="Completion Trend">
        {trendData.length > 0 ? (
          <LineChart
            data={{
              labels: trendData.map((d) => d.date.slice(5) || "-"),
              datasets: [{ data: trendData.map((d) => d.value) }],
            }}
            width={screenWidth}
            height={240}
            chartConfig={chartConfig}
            bezier
            fromZero
          />
        ) : (
          <Text style={{ textAlign: "center", color: "#666" }}>No trend data yet.</Text>
        )}
      </ChartCard>
    </ScrollView>
  );
}

// ===== Components =====
function StatCard({ title, value }) {
  return (
    <View
      style={{
        width: "47%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: "#777", fontSize: 12 }}>{title}</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 6 }}>{value}</Text>
    </View>
  );
}

function ChartCard({ title, children }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginVertical: 16,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

// ===== Chart Config =====
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // matches #FF6B6B
  labelColor: () => "#333",
  propsForDots: {
    r: "4",
  },
};
