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

function calcStreakForHabit(entries, frequency = "daily") {
  if (!entries.length) return { current: 0, longest: 0 };

  let longest = 1;
  let current = entries[entries.length - 1].completed ? 1 : 0;

  for (let i = entries.length - 2; i >= 0; i--) {
    const prev = entries[i].date;
    const curr = entries[i + 1].date;

    let continuous = false;
    if (!entries[i].completed) continue;

    if (frequency === "daily") {
      continuous = (curr - prev) / (1000 * 60 * 60 * 24) === 1;
    } else if (frequency === "weekly") {
      const prevWeek = getWeekStart(prev);
      const currWeek = getWeekStart(curr);
      continuous = (currWeek - prevWeek) / (1000 * 60 * 60 * 24 * 7) === 1;
    } else if (frequency === "monthly") {
      continuous =
        (prev.getFullYear() === curr.getFullYear() && prev.getMonth() + 1 === curr.getMonth()) ||
        (prev.getMonth() === 11 && curr.getMonth() === 0 && curr.getFullYear() === prev.getFullYear() + 1);
    }

    if (continuous) current++;
    else current = 1;

    if (current > longest) longest = current;
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

