import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from "react-native";
import {
  BarChart,
  PieChart,
} from "react-native-chart-kit";
import { api } from "../../../../api";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";

const COLORS = ["#FF6B6B", "#2E8B8B", "#F4E1D2", "#333333", "#8884d8"];
const screenWidth = Dimensions.get("window").width;
export default function JournalStats() {
   const { globalStyles, colors } = useThemeStyles();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/journal/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text>Loading stats...</Text>
      </View>
    );
  }

  /** MONTH DATA */
  const monthLabels = stats.entries_per_month.map((item) =>
    new Date(item.month).toLocaleString("default", { month: "short" })
  );

  const monthCounts = stats.entries_per_month.map((item) => item.count);

  /** MOOD DATA */
  const moodData = stats.mood_counts.map((item, index) => ({
    name: item.mood__name || "No Mood",
    population: item.count,
    color: COLORS[index % COLORS.length],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  /** WEEKDAY DATA */
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekdayLabels = stats.entries_per_weekday.map(
    (item) => weekdayNames[item.weekday - 1]
  );

  const weekdayCounts = stats.entries_per_weekday.map((item) => item.count);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={globalStyles.title}>Journaling Summary</Text>

      {/* STATS CARDS */}
      <View style={styles.cards}>
        <StatCard label="Total Entries" value={stats.total_entries} />
        <StatCard label="Current Streak" value={stats.current_streak} />
        <StatCard label="Best Streak" value={stats.best_streak} />
        <StatCard label="Moods Used" value={moodData.length} />
      </View>

      {/* ENTRIES PER MONTH */}
      <ChartCard title="Entries Per Month">
        {
          width => {
            const minWidth = Math.max(width,monthLabels.length * 60)
            return (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                data={{
                  labels: monthLabels,
                  datasets: [{ data: monthCounts }],
                }}
                width={minWidth}
                height={260}
                fromZero
                chartConfig={chartConfig("#FF6B6B")}
                verticalLabelRotation={0}
                style={styles.chart}
              />
              </ScrollView>
            )
          }
        }
      </ChartCard>

      {/* MOOD DISTRIBUTION */}
      <ChartCard title="Mood Distribution">
        {
          (width) => {
            const minWidth = Math.max(width,weekdayCounts.length * 60)
            return (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <PieChart
                data={moodData}
                width={minWidth}
                height={260}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                chartConfig={chartConfig()}
                absolute
              />
              </ScrollView>
            )
          }
        }
        
      </ChartCard>

      {/* ENTRIES PER WEEKDAY */}
      <ChartCard title="Entries Per Weekday">
        {
          width => {
            const minWidth = Math.max(width,weekdayCounts.length * 60)
            return (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: weekdayLabels,
                    datasets: [{ data: weekdayCounts }],
                  }}
                  width={minWidth}
                  height={260}
                  fromZero
                  chartConfig={chartConfig("#2E8B8B")}
                  style={styles.chart}
                />
              </ScrollView>
            )
          }
        }
        
      </ChartCard>
    </ScrollView>
  );
}

/* SMALL COMPONENTS */

function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function ChartCard({ title, children }) {
  const [width,setWidth] = useState(0)
  return (
    <View 
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.chartCard}
    >
      <Text style={styles.chartTitle}>{title}</Text>
      {width > 0 && children(width - 16)}
    </View>
  );
}

/* CHART CONFIG */
const chartConfig = (color = "#000") => ({
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: () => color,
  labelColor: () => "#333",
  barPercentage: 0.6,
});

/* STYLES */
const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardLabel: {
    fontSize: 13,
    color: "#666",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
});
