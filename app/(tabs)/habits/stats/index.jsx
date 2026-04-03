import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { Card, BodyText, SecondaryText } from "../../../../src/components/ThemeProvider/components"
import { generateAllHabitsStatsWithBestWorst } from "./../../../../src/db/habitsStats";
import { useSQLiteContext } from "expo-sqlite";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { ChartCard, StatCard , chartConfig} from "../../../../src/components/common/statsComponents";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 48;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         "#FAF9F7",   // warm light background
  surface:    "#FFFFFF",
  surfaceAlt: "#F4E1D2",   // soft accent background
  border:     "#E8E6E3",

  primary:    "#FF6B6B",   // main brand color
  secondary:  "#2E8B8B",   // calm supporting color
  accent:     "#F4E1D2",

  textPrimary:"#333333",
  textMuted:  "#6B6B6B",
  textDim:    "#A0A0A0",

  good:       "#2E8B8B",   // success = calm teal (on-brand)
  bad:        "#FF6B6B",   // warning = coral
  gold:       "#FFB84D",   // softer gold (warmer)
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const Divider = () => (
  <View style={{ height: 1, backgroundColor: T.border, marginVertical: 16 }} />
);

const Tag = ({ label, color = T.accent }) => (
  <View style={[styles.tag, { borderColor: color + "44", backgroundColor: color + "12" }]}>
    <Text style={[styles.tagText, { color }]}>{label}</Text>
  </View>
);

// ─── Stat row inside a card ────────────────────────────────────────────────────
const StatRow = ({ label, value, accent = false, bar = null }) => (
  <View style={styles.statRow}>
    <BodyText style={styles.statLabel}>{label}</BodyText>
    <View style={styles.statRight}>
      {bar !== null && (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.min(bar, 100)}%` }]} />
        </View>
      )}
      <BodyText style={[styles.statValue, accent && { color: T.accent }]}>{value}</BodyText>
    </View>
  </View>
);

// ─── Big hero metric ──────────────────────────────────────────────────────────
const HeroMetric = ({ label, value, sub }) => (
  <View style={styles.heroMetric}>
    <Text style={styles.heroValue}>{value}</Text>
    <Text style={styles.heroLabel}>{label}</Text>
    {sub ? <Text style={styles.heroSub}>{sub}</Text> : null}
  </View>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ number, title }) => (
  <View style={styles.sectionHeader}>
    <BodyText style={styles.sectionTitle}>{title}</BodyText>
  </View>
);

// ─── Chart config ─────────────────────────────────────────────────────────────
// const chartConfig = {
//   backgroundGradientFrom: T.surfaceAlt,
//   backgroundGradientTo:   T.surfaceAlt,
//   color: (opacity = 1) => `rgba(200, 240, 74, ${opacity})`,
//   strokeWidth: 2,
//   decimalPlaces: 0,
//   labelColor: () => T.textMuted,
//   propsForDots: { r: "4", strokeWidth: "1.5", stroke: T.accentDim },
//   propsForBackgroundLines: { stroke: T.border, strokeDasharray: "4 4" },
// };

const buildChartConfig = (primaryColor) => ({
  backgroundGradientFrom: T.surface,
  backgroundGradientTo: T.surface,

  color: (opacity = 1) => `${primaryColor}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`,

  strokeWidth: 2,
  decimalPlaces: 0,

  labelColor: () => T.textMuted,

  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: primaryColor,
  },

  propsForBackgroundLines: {
    stroke: T.border,
    strokeDasharray: "4 4",
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AllHabitsStatsScreen() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { globalStyles, colors } = useThemeStyles()

  useEffect(() => {
    (async () => {
      try {
        const result = await generateAllHabitsStatsWithBestWorst(db, "user_uuid_here");
        setStats(result);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      } catch (err) {
        console.error("Failed to load habit stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{...globalStyles.container,...styles.center}}>
        <ActivityIndicator size="large" color={T.accent} />
        <BodyText style={[styles.statLabel, { marginTop: 12 }]}>Loading your data…</BodyText>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.textMuted, fontSize: 15 }}>No stats available yet.</Text>
      </View>
    );
  }

  const trendLabels  = stats.trend.map(t => t.day);
  const trendData    = stats.trend.map(t => t.completed);
  const weekdayLabels = stats.per_weekday.map(w => `W${w.weekday}`);
  const weekdayData  = stats.per_weekday.map(w => w.count);
  const monthLabels  = stats.per_month.map(m => m.month);
  const monthData    = stats.per_month.map(m => m.count);

  const progressNum = parseFloat(stats.progress_percent) || 0;

    return (
        <ScrollView
            style={globalStyles.container}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View style={{ opacity: fadeAnim }}>
                <View style={styles.pageHeader}>
                    <BodyText style={globalStyles.title}>Habits Stats</BodyText>
                    <SecondaryText style={globalStyles.subTitle}>
                        Your complete performance snapshot
                    </SecondaryText>
                </View>

                <Card style={styles.heroStrip}>
                    <HeroMetric
                        label="Progress"
                        value={`${progressNum}%`}
                        sub="overall"
                    />
                    <View style={styles.heroDivider} />
                    <HeroMetric
                        label="Habits"
                        value={stats.total_habits}
                        sub="tracked"
                    />
                    <View style={styles.heroDivider} />
                    <HeroMetric
                        label="Streak avg"
                        value={stats.avg_current_streak}
                        sub="days"
                    />
                </Card>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressNum}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>0%</Text>
                    <Text style={[styles.progressLabel, { color: T.accent }]}>
                        {progressNum}% complete
                    </Text>
                    <Text style={styles.progressLabel}>100%</Text>
                </View>
            </Animated.View>

        <Card style={styles.card}>
            <SectionHeader title="Summary" />
            <Divider />
            <StatRow label="Total entries"    value={stats.total_entries} />
            <StatRow
            label="Completed"
            value={stats.completed_entries}
            accent
            bar={(stats.completed_entries / stats.total_entries) * 100}
            />
            <StatRow
            label="Missed"
            value={stats.missed_entries}
            bar={(stats.missed_entries / stats.total_entries) * 100}
            />
            <Divider />
            <StatRow label="Avg longest streak" value={`${stats.avg_longest_streak} days`} />
            <StatRow label="Avg current streak" value={`${stats.avg_current_streak} days`} accent />
        </Card>

        {/* ── SECTION 2: BEST & WORST ── */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <SectionHeader number="02" title="Best & Worst" />
            <Divider />

            {stats.best_habit && (
            <View style={styles.highlightRow}>
                <View style={[styles.highlightDot, { backgroundColor: T.good }]} />
                <View style={{ flex: 1 }}>
                <Text style={styles.highlightCaption}>BEST PERFORMER</Text>
                <Text style={styles.highlightName}>{stats.best_habit.habit_title}</Text>
                </View>
                <Text style={[styles.highlightPercent, { color: T.good }]}>
                {stats.best_habit.progress_percent}%
                </Text>
            </View>
            )}

            {stats.worst_habit && (
            <View style={[styles.highlightRow, { marginTop: 12 }]}>
                <View style={[styles.highlightDot, { backgroundColor: T.bad }]} />
                <View style={{ flex: 1 }}>
                <Text style={styles.highlightCaption}>NEEDS WORK</Text>
                <Text style={styles.highlightName}>{stats.worst_habit.habit_title}</Text>
                </View>
                <Text style={[styles.highlightPercent, { color: T.bad }]}>
                {stats.worst_habit.progress_percent}%
                </Text>
            </View>
            )}

            <Divider />

            {stats.longest_streak_habit && (
            <View style={styles.highlightRow}>
                <View style={[styles.highlightDot, { backgroundColor: T.gold }]} />
                <View style={{ flex: 1 }}>
                <Text style={styles.highlightCaption}>LONGEST STREAK</Text>
                <Text style={styles.highlightName}>{stats.longest_streak_habit.habit_title}</Text>
                </View>
                <Text style={[styles.highlightPercent, { color: T.gold }]}>
                {stats.longest_streak_habit.longest_streak}d
                </Text>
            </View>
            )}

            {stats.current_streak_habit && (
            <View style={[styles.highlightRow, { marginTop: 12 }]}>
                <View style={[styles.highlightDot, { backgroundColor: T.accent }]} />
                <View style={{ flex: 1 }}>
                <Text style={styles.highlightCaption}>ON FIRE NOW</Text>
                <Text style={styles.highlightName}>{stats.current_streak_habit.habit_title}</Text>
                </View>
                <Text style={[styles.highlightPercent, { color: T.accent }]}>
                {stats.current_streak_habit.current_streak}d
                </Text>
            </View>
            )}
        </Animated.View>

        {/* ── SECTION 3: TREND ── */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <SectionHeader number="03" title="Daily Trend" />
            <SecondaryText style={styles.chartCaption}>Completions per day</SecondaryText>
            {trendData.length > 0 ? (
            <LineChart
                data={{ labels: trendLabels, datasets: [{ data: trendData }] }}
                width={CHART_WIDTH}
                height={200}
                chartConfig={chartConfig(T.primary,colors)}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
            />
            ) : (
            <Text style={styles.emptyChart}>No data yet</Text>
            )}
        </Animated.View>

        {/* ── SECTION 4: WEEKDAY ── */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <SectionHeader title="By Weekday" />
            <SecondaryText style={styles.chartCaption}>Which days you crush it</SecondaryText>
            {weekdayData.length > 0 ? (
            <BarChart
                data={{ labels: weekdayLabels, datasets: [{ data: weekdayData }] }}
                width={CHART_WIDTH}
                height={200}
                chartConfig={chartConfig(T.primary,colors)}
                style={styles.chart}
                fromZero
                withInnerLines={false}
            />
            ) : (
            <Text style={styles.emptyChart}>No data yet</Text>
            )}
        </Animated.View>

        {/* ── SECTION 5: MONTHLY ── */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <SectionHeader number="05" title="By Month" />
            <SecondaryText style={styles.chartCaption}>Long-term momentum</SecondaryText>
            {monthData.length > 0 ? (
            <BarChart
                data={{ labels: monthLabels, datasets: [{ data: monthData }] }}
                width={CHART_WIDTH}
                height={200}
                chartConfig={chartConfig(T.primary,colors)}
                style={styles.chart}
                fromZero
                withInnerLines={false}
            />
            ) : (
            <Text style={styles.emptyChart}>No data yet</Text>
            )}
        </Animated.View>

        <View style={{ height: 40 }} />
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Page header
  pageHeader: {
    marginBottom: 24,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: T.textPrimary,
    letterSpacing: -0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: T.textMuted,
    letterSpacing: 0.1,
  },

  // Tag pill
  tag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // Hero strip
  heroStrip: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  heroMetric: {
    flex: 1,
    alignItems: "center",
  },
  heroValue: {
    fontSize: 28,
    fontWeight: "800",
    color: T.accent,
    letterSpacing: -0.5,
  },
  heroLabel: {
    fontSize: 11,
    color: T.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroSub: {
    fontSize: 10,
    color: T.textDim,
    marginTop: 1,
  },
  heroDivider: {
    width: 1,
    backgroundColor: T.border,
    marginVertical: 4,
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: T.surfaceAlt,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.accent,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  progressLabel: {
    fontSize: 11,
    color: T.textMuted,
  },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 20,
    marginBottom: 16,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  sectionNum: {
    fontSize: 11,
    fontWeight: "700",
    color: T.textDim,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // Stat row
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 13,
  },
  statRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  barTrack: {
    width: 60,
    height: 3,
    backgroundColor: T.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: T.accent,
    borderRadius: 2,
  },

  // Highlight row (best/worst)
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.surfaceAlt,
    borderRadius: 10,
    padding: 12,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  highlightCaption: {
    fontSize: 9,
    fontWeight: "700",
    color: T.textMuted,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  highlightName: {
    fontSize: 14,
    fontWeight: "600",
    color: T.textPrimary,
  },
  highlightPercent: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // Charts
  chartCaption: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 10,
    marginLeft: -8,
  },
  emptyChart: {
    fontSize: 13,
    color: T.textMuted,
    textAlign: "center",
    paddingVertical: 32,
  },
});