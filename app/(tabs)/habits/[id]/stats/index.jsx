import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/api";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

export default function HabitStatsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
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

  const weekdayData = stats.per_weekday.map((item) => ({
    label: WEEKDAYS[item.weekday - 1],
    value: item.count,
  }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = stats.per_month.map((item) => {
    const monthNumber = parseInt(item.month.slice(5, 7), 10);
    return {
      month: monthNames[monthNumber - 1],
      count: item.count,
    };
  });

  const trendData = stats.trend.map((entry) => ({
    date: entry.day,
    value: entry.completed ? 1 : 0,
  }));

  const completionPieData = [
    {
      name: "Completed",
      population: stats.completed_entries,
      color: "#2E8B8B",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Missed",
      population: stats.total_entries - stats.completed_entries,
      color: "#F4E1D2",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        {stats.habit} — Stats
      </Text>

      {/* Summary Cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <StatCard title="Progress" value={`${stats.progress_percent}%`} />
        <StatCard title="Completed" value={stats.completed_entries} />
        <StatCard title="Total Logs" value={stats.total_entries} />
        <StatCard title="Longest Streak" value={stats.longest_streak} />
      </View>

      {/* Pie Chart */}
      <ChartCard title="Completion Breakdown">
        <PieChart
          data={completionPieData}
          width={screenWidth}
          height={220}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"20"}
        />
      </ChartCard>

      {/* Weekday Bar Chart */}
      <ChartCard title="Completions Per Weekday">
        <BarChart
          data={{
            labels: weekdayData.map((d) => d.label),
            datasets: [{ data: weekdayData.map((d) => d.value) }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
        />
      </ChartCard>

      {/* Monthly Bar Chart */}
      <ChartCard title="Monthly Activity">
        <BarChart
          data={{
            labels: monthlyData.map((d) => d.month),
            datasets: [{ data: monthlyData.map((d) => d.count) }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
        />
      </ChartCard>

      {/* Trend Line Chart */}
      <ChartCard title="Completion Trend">
        <LineChart
          data={{
            labels: trendData.map((d) => d.date.slice(5)),
            datasets: [{ data: trendData.map((d) => d.value) }],
          }}
          width={screenWidth}
          height={240}
          chartConfig={chartConfig}
          bezier
          fromZero
        />
      </ChartCard>
    </ScrollView>
  );
}

function StatCard({ title, value }) {
  return (
    <View
      style={{
        width: "47%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
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
