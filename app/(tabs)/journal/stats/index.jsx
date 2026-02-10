import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  BarChart,
  PieChart,
} from "react-native-chart-kit";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import PageLoader from "../../../../src/components/common/PageLoader";
import { useSQLiteContext } from "expo-sqlite";
import { generateJournalStats } from "../../../../src/db/JournalingStats";
import { ChartCard, StatCard , chartConfig} from "../../../../src/components/common/statsComponents";
import TimeFilters from "../../../../src/components/common/TimeFilters";
import ButtonLinks from "../../../../src/components/common/ButtonLinks";

const COLORS = ["#FF6B6B", "#2E8B8B", "#F4E1D2", "#333333", "#8884d8"];
export default function JournalStats() {
  const db = useSQLiteContext()
  const { globalStyles, colors } = useThemeStyles();
  const [stats, setStats] = useState(null);
  const [isLoading,setIsLoading] = useState(true)
  const [period,setPeriod] = useState("30 days")

  const onPeriodChange = (value) => {
    setPeriod(value)
  }

  useEffect(() => {
    const fetchStats = async () => {
      !stats && setIsLoading(true)
      try {
        let stats = await generateJournalStats(db, period)
        setStats(stats)
      } catch (error) {
        console.log(error,"hello jornal stats error")
      }
      finally{
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [period]);

  if (isLoading) return <PageLoader />

  const monthLabels = stats.entries_per_month.map((item) =>
    new Date(item.month).toLocaleString("default", { month: "short" })
  );

  const monthCounts = stats.entries_per_month.map((item) => item.count);

  /** MOOD DATA */
  const moodData = stats.mood_counts.map((item, index) => ({
    name: item.mood__name || "No Mood",
    population: item.count,
    color: COLORS[index % COLORS.length],
    legendFontColor:colors.text,
    legendFontSize: 12,
  }));

  /** WEEKDAY DATA */
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayLabels = stats.entries_per_weekday.map(
    (item) => weekdayNames[item.weekday - 1]
  );

  const weekdayCounts = stats.entries_per_weekday.map((item) => item.count);

  return (
    <ScrollView style={globalStyles.container} >
      <Text style={globalStyles.title}>Journaling Summary</Text>

      <TimeFilters 
          selectedPeriod={period}
          onPeriodChange={onPeriodChange} 
        />

        <ButtonLinks 
          links={[
            {name:"Journals",route:"/journal"}
          ]}
        />

      <View style={styles.cards}>
        <StatCard label="Total Entries" value={stats.total_entries} />
        <StatCard label="Current Streak" value={stats.current_streak} />
        <StatCard label="Best Streak" value={stats.longest_streak} />
        <StatCard label="Moods Used" value={moodData.length} />
      </View>

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
                  chartConfig={chartConfig("#FF6B6B",colors)}
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
                  chartConfig={chartConfig("#333",colors)}
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
                  chartConfig={chartConfig("#2E8B8B",colors)}
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

const styles = StyleSheet.create({
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardLabel: {
    fontSize: 13,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  chart: {
    borderRadius: 12,
  },
});
