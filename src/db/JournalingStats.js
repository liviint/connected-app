import { getJournals } from "./journalsDb"
function toDate(entry) {
  return new Date(entry.created_at);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // Sunday → 7
  d.setDate(d.getDate() - day + 1);
  return startOfDay(d);
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function countWords(text = "") {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function calcJournalStreak(entries) {
  if (!entries.length) return { current: 0, longest: 0 };

  const dates = [
    ...new Set(
      entries.map(e =>
        startOfDay(toDate(e)).getTime()
      )
    )
  ]
    .map(d => new Date(d))
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);

    if (Math.round(diff) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  const today = startOfDay(new Date());
  const lastDate = dates[dates.length - 1];
  const diffFromToday =
    (today - lastDate) / (1000 * 60 * 60 * 24);

  if (diffFromToday > 1) current = 0;

  return { current, longest };
}


function buildTrends(entries) {
  const perDay = {};
  const perMonth = {};
  const perWeekday = {};

  entries.forEach(e => {
    const date = new Date(e.created_at);

    const dayKey = date.toISOString().slice(0, 10);
    perDay[dayKey] = (perDay[dayKey] || 0) + 1;

    const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
    perMonth[monthKey] = (perMonth[monthKey] || 0) + 1;

    const weekday = date.getUTCDay(); 
    perWeekday[weekday] = (perWeekday[weekday] || 0) + 1;
  });

  return {
    entries_per_day: Object.entries(perDay).map(([day, count]) => ({ day, count })),
    entries_per_month: Object.entries(perMonth).map(([month, count]) => ({ month, count })),
    entries_per_weekday: Object.entries(perWeekday).map(([weekday, count]) => ({
      weekday: Number(weekday),
      count,
    })),
  };
}


function buildMoodStats(entries) {
  const moodMap = {};

  entries.forEach(e => {
    if (!e.mood_uuid) return;

    if (!moodMap[e.mood_uuid]) {
      moodMap[e.mood_uuid] = {
        mood_uuid: e.mood_uuid,
        mood__name: e.mood_label || null,
        count: 0,
      };
    }

    moodMap[e.mood_uuid].count += 1;
  });

  const perMood = Object.values(moodMap);

  const mostFrequentMood =
    perMood.sort((a, b) => b.count - a.count)[0] || null;

  return {
    mood_counts: perMood,
    most_frequent_mood: mostFrequentMood,
  };
}

export const generateHomeJournalStats = async(db, period) => {
    let entries = await getJournals(db,null, period)
    if (!entries.length) {
        return {
        total_entries: 0,
        current_streak: 0,
        longest_streak: 0,
        };
    }

    const sorted = [...entries].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const totalEntries = sorted.length;

    const totalWords = sorted.reduce(
        (sum, e) =>
        sum +
        countWords(e.content || "") +
        countWords(e.transcript || ""),
        0
    );

    const avgWords = totalEntries
        ? Math.round(totalWords / totalEntries)
        : 0;

    const today = startOfDay(new Date());
    const thisWeek = getWeekStart(today);
    const thisMonth = getMonthStart(today);

    const todayCount = sorted.filter(
        e => startOfDay(toDate(e)).getTime() === today.getTime()
    ).length;

    const weekCount = sorted.filter(
        e => toDate(e) >= thisWeek
    ).length;

    const monthCount = sorted.filter(
        e => toDate(e) >= thisMonth
    ).length;

    const streaks = calcJournalStreak(sorted);
    const moods = buildMoodStats(sorted);

    return {
        total_entries: totalEntries,
        entries_today: todayCount,
        entries_this_week: weekCount,
        entries_this_month: monthCount,
        total_words: totalWords,
        avg_words_per_entry: avgWords,
        current_streak: streaks.current,
        longest_streak: streaks.longest,
        ...moods
    };
}

export const generateJournalStats = async(db, period) => {
    let entries = await getJournals(db,null, period)
    if (!entries.length) {
        return {
        total_entries: 0,
        current_streak: 0,
        longest_streak: 0,
        };
    }

    const sorted = [...entries].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const totalEntries = sorted.length;

    const totalWords = sorted.reduce(
        (sum, e) =>
        sum +
        countWords(e.content || "") +
        countWords(e.transcript || ""),
        0
    );

    const avgWords = totalEntries
        ? Math.round(totalWords / totalEntries)
        : 0;

    const today = startOfDay(new Date());
    const thisWeek = getWeekStart(today);
    const thisMonth = getMonthStart(today);

    const todayCount = sorted.filter(
        e => startOfDay(toDate(e)).getTime() === today.getTime()
    ).length;

    const weekCount = sorted.filter(
        e => toDate(e) >= thisWeek
    ).length;

    const monthCount = sorted.filter(
        e => toDate(e) >= thisMonth
    ).length;

    const streaks = calcJournalStreak(sorted);
    const trends = buildTrends(sorted);
    const moods = buildMoodStats(sorted);

    return {
        total_entries: totalEntries,
        entries_today: todayCount,
        entries_this_week: weekCount,
        entries_this_month: monthCount,
        total_words: totalWords,
        avg_words_per_entry: avgWords,
        current_streak: streaks.current,
        longest_streak: streaks.longest,
        ...trends,
        ...moods,
    };
}
