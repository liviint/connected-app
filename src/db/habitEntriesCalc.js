const startOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0,0,0,0);
    return d;
};

const startOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const sameDay = (a, b) =>
    a.toISOString().slice(0,10) === b.toISOString().slice(0,10);


export function shouldHaveEntry(habit, targetDate = new Date()) {
    if (habit.frequency === "daily") return true;

    if (habit.frequency === "weekly") {
        return targetDate.getDay() === 1; 
    }

    if (habit.frequency === "monthly") {
        return targetDate.getDate() === 1;
    }

    return false;
}

export function hasCompletedThisPeriodButNotToday(habit, entries, today) {
  const todayStr = today.toISOString().slice(0, 10);

  if (habit.frequency === "daily") {
    // Daily should always show today
    return false;
  }

  if (habit.frequency === "weekly") {
    const weekStart = startOfWeek(today);

    return entries.some(e => {
      const entryDate = new Date(e.date);
      const entryStr = e.date;

      const inThisWeek =
        entryDate >= weekStart && entryDate <= today;

      const notToday = entryStr !== todayStr;

      return inThisWeek && notToday;
    });
  }

  if (habit.frequency === "monthly") {
    const monthStart = startOfMonth(today);

    return entries.some(e => {
      const entryDate = new Date(e.date);
      const entryStr = e.date;

      const inThisMonth =
        entryDate >= monthStart && entryDate <= today;

      const notToday = entryStr !== todayStr;

      return inThisMonth && notToday;
    });
  }

  return false;
}

export function getHabitViewForDate({
    habit,
    entries,
    targetDate = new Date()
    }) {
    const entry = entries.find(e =>
        sameDay(new Date(e.date), targetDate)
    );

    const shouldExist = shouldHaveEntry(habit, targetDate);

    return {
        habit,
        entry: entry ?? null,
        completed: entry ? entry.completed === 1 : false,
        canToggle: shouldExist
    };
}

export function calcStreak(habit, entries) {
    const completed = entries
        .filter(e => e.completed === 1)
        .map(e => new Date(e.date))
        .sort((a, b) => a.getTime() - b.getTime());

    if (completed.length === 0) {
        return { current: 0, longest: 0 };
    }

    let grouped = [];

    if (habit.frequency === "daily") {
        grouped = completed;
    }

    if (habit.frequency === "weekly") {
        const weeks = new Set();
        completed.forEach(d =>
        weeks.add(startOfWeek(d).getTime())
        );
        grouped = [...weeks].map(t => new Date(t)).sort();
    }

    if (habit.frequency === "monthly") {
        const months = new Set();
        completed.forEach(d =>
        months.add(startOfMonth(d).getTime())
        );
        grouped = [...months].map(t => new Date(t)).sort();
    }

    return calcGroupedStreak(grouped, habit.frequency);
}


function calcGroupedStreak(grouped, frequency) {
    let current = 1;
    let longest = 1;

    for (let i = 1; i < grouped.length; i++) {
        const prev = grouped[i - 1];
        const curr = grouped[i];

        let continuous = false;

        if (frequency === "daily") {
        continuous =
            curr.getTime() - prev.getTime() === 86400000;
        }

        if (frequency === "weekly") {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 7);
        continuous = sameDay(next, curr);
        }

        if (frequency === "monthly") {
        const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        continuous = sameDay(next, curr);
        }

        if (continuous) {
        current++;
        longest = Math.max(longest, current);
        } else {
        current = 1;
        }
    }

    return { current, longest };
}


