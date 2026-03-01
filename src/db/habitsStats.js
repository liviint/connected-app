import { getHabitEntries, getHabits } from "./habitsDb";
// Parse date strings to Date objects
function parseDate(entry) {
  return {
    ...entry,
    date: new Date(entry.date),
  };
}

// Get weekday (1=Monday, 7=Sunday)
function getWeekday(date) {
  const jsDay = date.getDay(); // 0=Sunday
  return jsDay === 0 ? 7 : jsDay;
}

// Get month start
function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Sort entries by date ascending
function sortEntries(entries) {
  return entries.map(parseDate).sort((a, b) => a.date - b.date);
}

const DAY_MS = 1000 * 60 * 60 * 24;

// Normalize date to local start of day
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Period key generator
function getPeriodKey(date, frequency) {
  if (frequency === "daily") {
    return startOfDay(date).getTime();
  }

  if (frequency === "weekly") {
    const d = new Date(date);
    const day = d.getDay() || 7; // Sunday → 7
    d.setDate(d.getDate() - day + 1); // Monday
    return startOfDay(d).getTime();
  }

  if (frequency === "monthly") {
    return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  }

  return null;
}

function calcStreakForHabit(entries, frequency = "daily") {
  if (!entries.length) return { current: 0, longest: 0 };

  // 1️⃣ Collect unique completed periods
  const completedPeriods = new Set();

  for (const e of entries) {
    if (!e.completed) continue;
    completedPeriods.add(getPeriodKey(e.date, frequency));
  }

  if (!completedPeriods.size) return { current: 0, longest: 0 };

  // 2️⃣ Sort periods chronologically
  const periods = [...completedPeriods].sort((a, b) => a - b);

  let longest = 1;
  let temp = 1;

  // 3️⃣ Calculate longest streak
  for (let i = 1; i < periods.length; i++) {
    let continuous = false;

    if (frequency === "daily") {
      continuous = (periods[i] - periods[i - 1]) === DAY_MS;
    } else if (frequency === "weekly") {
      continuous = (periods[i] - periods[i - 1]) === DAY_MS * 7;
    } else if (frequency === "monthly") {
      const prev = new Date(periods[i - 1]);
      const curr = new Date(periods[i]);
      continuous =
        curr.getFullYear() === prev.getFullYear() &&
        curr.getMonth() === prev.getMonth() + 1 ||
        (prev.getMonth() === 11 &&
         curr.getMonth() === 0 &&
         curr.getFullYear() === prev.getFullYear() + 1);
    }

    if (continuous) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 1;
    }
  }

  // 4️⃣ Calculate current streak
  let current = 1;
  const todayKey = getPeriodKey(new Date(), frequency);
  const lastPeriod = periods[periods.length - 1];

  let expectedPrev;

  if (frequency === "daily") expectedPrev = todayKey - DAY_MS;
  if (frequency === "weekly") expectedPrev = todayKey - DAY_MS * 7;
  if (frequency === "monthly") {
    const d = new Date(todayKey);
    d.setMonth(d.getMonth() - 1);
    expectedPrev = d.getTime();
  }

  if (lastPeriod !== todayKey && lastPeriod !== expectedPrev) {
    current = 0;
  } else {
    for (let i = periods.length - 2; i >= 0; i--) {
      let continuous = false;

      if (frequency === "daily") {
        continuous = periods[i + 1] - periods[i] === DAY_MS;
      } else if (frequency === "weekly") {
        continuous = periods[i + 1] - periods[i] === DAY_MS * 7;
      } else if (frequency === "monthly") {
        const prev = new Date(periods[i]);
        const curr = new Date(periods[i + 1]);
        continuous =
          curr.getFullYear() === prev.getFullYear() &&
          curr.getMonth() === prev.getMonth() + 1 ||
          (prev.getMonth() === 11 &&
           curr.getMonth() === 0 &&
           curr.getFullYear() === prev.getFullYear() + 1);
      }

      if (continuous) current++;
      else break;
    }
  }

  return { current, longest };
}


function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday
  d.setDate(d.getDate() - day + 1); // Monday
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


export let generateHabitStats = async (db, habit_uuid) => {
    let habit = await getHabits(db,habit_uuid)
    let entriesData =  await getHabitEntries(db,habit_uuid)
    let entries = sortEntries(entriesData);

    const totalEntries = entries.length;
    const completedEntries = entries.filter(e => e.completed).length;
    const progressPercent = totalEntries ? Math.round((completedEntries / totalEntries) * 100) : 0;

    const latestEntry = entries[entries.length - 1] || null;
    const streaks = calcStreakForHabit(entries, habit.frequency);

    // Trend: array of { day, completedCount }
    const trendMap = {};
    entries.forEach(e => {
        const dayKey = e.date.toISOString().split("T")[0];
        trendMap[dayKey] = (trendMap[dayKey] || 0) + (e.completed ? 1 : 0);
    });
    const trend = Object.entries(trendMap).map(([day, count]) => ({ day, completed: count }));

    // Per weekday stats
    const weekdayMap = {};
    entries.forEach(e => {
        const weekday = getWeekday(e.date);
        weekdayMap[weekday] = (weekdayMap[weekday] || 0) + 1;
    });
    const perWeekday = Object.entries(weekdayMap).map(([weekday, count]) => ({ weekday: Number(weekday), count }));

    // Per month stats
    const monthMap = {};
    entries.forEach(e => {
        const monthKey = `${e.date.getFullYear()}-${(e.date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    });
    const perMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

    const missed = totalEntries - completedEntries;

    return {
        habit_title: habit.title,
        habit_id: habit.id,
        frequency: habit.frequency,
        total_entries: totalEntries,
        completed_entries: completedEntries,
        progress_percent: progressPercent,
        latest_entry: latestEntry
        ? { date: latestEntry.date.toISOString().split("T")[0], completed: latestEntry.completed }
        : null,
        current_streak: streaks.current,
        longest_streak: streaks.longest,
        trend,
        per_weekday: perWeekday,
        per_month: perMonth,
        missed,
    };
}

export const generateAllHabitsStatsWithBestWorst = async (db, user_uuid) => {
  const habits = await getHabits(db, null, user_uuid); // get all user habits

  let totalEntries = 0;
  let completedEntries = 0;
  let totalMissed = 0;

  let allTrendMap = {};
  let weekdayMap = {};
  let monthMap = {};

  let currentStreaks = [];
  let longestStreaks = [];

  // Track best/worst habits
  let bestHabit = null;
  let worstHabit = null;
  let longestStreakHabit = null;
  let currentStreakHabit = null;

  for (const habit of habits) {
    const entriesData = await getHabitEntries(db, habit.uuid);
    const entries = sortEntries(entriesData);

    const completedCount = entries.filter(e => e.completed).length;
    const missedCount = entries.length - completedCount;

    totalEntries += entries.length;
    completedEntries += completedCount;
    totalMissed += missedCount;

    // Calculate streaks
    const streak = calcStreakForHabit(entries, habit.frequency);
    currentStreaks.push(streak.current);
    longestStreaks.push(streak.longest);

    // Track best/worst by progress %
    const progressPercent = entries.length ? (completedCount / entries.length) * 100 : 0;

    if (!bestHabit || progressPercent > bestHabit.progress_percent) {
      bestHabit = {
        habit_id: habit.id,
        habit_title: habit.title,
        progress_percent: Math.round(progressPercent),
      };
    }

    if (!worstHabit || progressPercent < worstHabit.progress_percent) {
      worstHabit = {
        habit_id: habit.id,
        habit_title: habit.title,
        progress_percent: Math.round(progressPercent),
      };
    }

    // Track longest streak habit
    if (!longestStreakHabit || streak.longest > longestStreakHabit.longest_streak) {
      longestStreakHabit = {
        habit_id: habit.id,
        habit_title: habit.title,
        longest_streak: streak.longest,
      };
    }

    // Track current streak habit
    if (!currentStreakHabit || streak.current > currentStreakHabit.current_streak) {
      currentStreakHabit = {
        habit_id: habit.id,
        habit_title: habit.title,
        current_streak: streak.current,
      };
    }

    // Aggregate trend, weekday, month
    entries.forEach(e => {
      const dayKey = e.date.toISOString().split("T")[0];
      allTrendMap[dayKey] = (allTrendMap[dayKey] || 0) + (e.completed ? 1 : 0);

      const wd = getWeekday(e.date);
      weekdayMap[wd] = (weekdayMap[wd] || 0) + 1;

      const monthKey = `${e.date.getFullYear()}-${(e.date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    });
  }

  const trend = Object.entries(allTrendMap).map(([day, completed]) => ({ day, completed }));
  const perWeekday = Object.entries(weekdayMap).map(([weekday, count]) => ({ weekday: Number(weekday), count }));
  const perMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

  const progressPercent = totalEntries ? Math.round((completedEntries / totalEntries) * 100) : 0;

  return {
    total_habits: habits.length,
    total_entries:totalEntries,
    completed_entries: completedEntries,
    missed_entries: totalMissed,
    progress_percent: progressPercent,
    avg_current_streak: currentStreaks.length ? Math.round(currentStreaks.reduce((a,b)=>a+b,0)/currentStreaks.length) : 0,
    avg_longest_streak: longestStreaks.length ? Math.round(longestStreaks.reduce((a,b)=>a+b,0)/longestStreaks.length) : 0,
    trend,
    per_weekday: perWeekday,
    per_month: perMonth,
    best_habit: bestHabit,
    worst_habit: worstHabit,
    longest_streak_habit: longestStreakHabit,
    current_streak_habit: currentStreakHabit,
  };
};