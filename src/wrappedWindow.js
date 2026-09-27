// The wrapped covers a rolling 12-month window: the current month plus the
// 11 before it (UTC, to match LeetCode). Every slide uses this same window so
// their numbers agree, and nothing needs a code change when the year rolls over.
export function getWrappedWindow(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const startYear = start.getUTCFullYear();
  const endYear = now.getUTCFullYear();

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(startYear, start.getUTCMonth() + i, 1));
    months.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
  }

  return {
    start,
    end: now,
    months,
    // In December the window is exactly Jan-Dec, so it reads as a single year.
    label: startYear === endYear ? `${endYear}` : `${startYear}-${endYear}`,
  };
}

export function isInWindow(date, window) {
  return date >= window.start && date <= window.end;
}
