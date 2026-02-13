export interface DayData {
  date: string;
  value: number;
}

export interface TimelinePoint {
  date: string;
  [slug: string]: string | number;
}

export function aggregateByDay(
  metrics: { type: string; value: number; createdAt: Date | string }[],
  type: string,
  days = 7
): DayData[] {
  const now = new Date();
  const result: DayData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, value: 0 });
  }

  for (const m of metrics) {
    if (m.type !== type) continue;
    const dateStr =
      typeof m.createdAt === "string"
        ? m.createdAt.slice(0, 10)
        : m.createdAt.toISOString().slice(0, 10);
    const entry = result.find((r) => r.date === dateStr);
    if (entry) entry.value += m.value;
  }

  return result;
}

export function buildTimeline(
  metrics: { type: string; value: number; createdAt: Date | string }[],
  types: string[],
  days = 7
): TimelinePoint[] {
  const now = new Date();
  const dates: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const map = new Map<string, TimelinePoint>();
  for (const date of dates) {
    const point: TimelinePoint = { date };
    for (const t of types) point[t] = 0;
    map.set(date, point);
  }

  for (const m of metrics) {
    const dateStr =
      typeof m.createdAt === "string"
        ? m.createdAt.slice(0, 10)
        : m.createdAt.toISOString().slice(0, 10);
    const point = map.get(dateStr);
    if (point && types.includes(m.type)) {
      point[m.type] = (point[m.type] as number) + m.value;
    }
  }

  return dates.map((d) => map.get(d)!);
}
