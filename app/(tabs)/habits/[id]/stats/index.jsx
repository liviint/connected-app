'use client';

import { useEffect, useState } from "react";
import { View, Text, ScrollView , StyleSheet,} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { useThemeStyles } from "../../../../../src/hooks/useThemeStyles";
import { BodyText } from "../../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../../src/components/common/PageLoader";
import { useSQLiteContext } from "expo-sqlite";
import { generateHabitStats } from "../../../../../src/db/habitsStats";
import { ChartCard, StatCard, chartConfig } from "../../../../../src/components/common/statsComponents";

export default function HabitStatsScreen() {
  const db = useSQLiteContext()
  const {globalStyles,colors}  = useThemeStyles()
  const { id } = useLocalSearchParams();
  const [stats, setStats] = useState(null);
  const [isLoading,setIsLoading] = useState(false)

  useEffect(() => {
    let fetchHabitStats = async() => {
      try {
        setIsLoading(true)
        let stats = await generateHabitStats(db,id)
        setStats(stats)
      } catch (error) {
        console.log(error,"hello habit stats error")
      }
      finally{
        setIsLoading(false)
      }
    }
    fetchHabitStats()
  }, [id]);

  if (isLoading) return <PageLoader message={"Loading stats..."} />

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
      legendFontColor: colors.text,
      legendFontSize: 14,
    });
  }

  if (missed > 0) {
    completionPieData.push({
      name: "Missed",
      population: missed,
      color: "#F4E1D2",
      legendFontColor: colors.text,
      legendFontSize: 14,
    });
  }
}

  return (
    <ScrollView style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        {stats?.habit_title ?? "Habit"} — Stats
      </BodyText>

      {/* Summary Cards */}
      <View style={styles.cards}>
        <StatCard label="Progress" value={`${stats?.progress_percent ?? 0}%`} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Total Logs" value={total} />
        <StatCard label="Longest Streak" value={stats?.longest_streak ?? 0} />
      </View>

        <ChartCard title="Completion Breakdown">
          {
            width => 
              {
                return completionPieData.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <PieChart
                      data={completionPieData}
                      width={width + 20}
                      height={220}
                      chartConfig={chartConfig("#FF6B6B",colors)}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="20"
                    />
                  </ScrollView>
            ) : (
                <Text style={{ textAlign: "center", color: "#666" }}>
                No completion data yet.
                </Text>
            )}
          }
        </ChartCard>


      {/* Weekday Bar Chart */}
      <ChartCard title="Completions Per Weekday">
        {
          width => 
            {
              const minWidth = Math.max(width,weekdayData.length * 60)
              return weekdayData.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: weekdayData.map((d) => d.label),
                      datasets: [{ data: weekdayData.map((d) => d.value) }],
                    }}
                    width={minWidth}
                    height={220}
                    chartConfig={chartConfig("#FF6B6B",colors)}
                    fromZero
                    showValuesOnTopOfBars
                    style={styles.chart}
                  />
                </ScrollView>
              ) : (
              <Text style={{ textAlign: "center", color: "#666" }}>No weekday data yet.</Text>
        )}
        }
      </ChartCard>

      {/* Monthly Bar Chart */}
      <ChartCard title="Monthly Activity">
        {
          width => {
            const minWidth = Math.max(width,monthlyData.length * 60)
            return monthlyData.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: monthlyData.map((d) => d.month),
                      datasets: [{ data: monthlyData.map((d) => d.count) }],
                    }}
                    width={minWidth}
                    height={220}
                    chartConfig={chartConfig("#2E8B8B",colors)}
                    fromZero
                    showValuesOnTopOfBars
                    style={styles.chart}
                  />
              </ScrollView>
        ) : (
          <Text style={{ textAlign: "center", color: "#666" }}>No monthly data yet.</Text>
        )}
        }
      </ChartCard>

      {/* Trend Line Chart */}
      <ChartCard title="Completion Trend">
        {
          width => {
            const minWidth = Math.max(width,trendData.length * 60)
            return trendData.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                  data={{
                    labels: trendData.map((d) => d.date.slice(5) || "-"),
                    datasets: [{ data: trendData.map((d) => d.value) }],
                  }}
                  width={minWidth}
                  height={240}
                  chartConfig={chartConfig("#FF6B6B",colors)}
                  bezier
                  fromZero
                  style={styles.chart}
                />
              </ScrollView>
            ) : (
              <Text style={{ textAlign: "center", color: "#666" }}>No trend data yet.</Text>
            )}
        }
      </ChartCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  chart: {
    borderRadius: 12,
  },
});