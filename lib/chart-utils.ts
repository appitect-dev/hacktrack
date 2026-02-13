export interface TimelinePoint {
  hour: string;
  [slug: string]: string | number;
}

export function buildHourlyTimeline(
  metrics: { type: string; value: number; createdAt: Date | string }[],
  types: string[],
  hours = 24
): TimelinePoint[] {
  const now = new Date();
  const slots: string[] = [];

  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i, 0, 0, 0);
    const label = d.toTimeString().slice(0, 5); // "HH:MM"
    slots.push(label);
  }

  const map = new Map<string, TimelinePoint>();
  for (const hour of slots) {
    const point: TimelinePoint = { hour };
    for (const t of types) point[t] = 0;
    map.set(hour, point);
  }

  for (const m of metrics) {
    const d =
      typeof m.createdAt === "string"
        ? new Date(m.createdAt)
        : m.createdAt;

    const hoursSince = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (hoursSince > hours || hoursSince < 0) continue;

    const label = d.toTimeString().slice(0, 5);
    const point = map.get(label);
    if (point && types.includes(m.type)) {
      point[m.type] = (point[m.type] as number) + m.value;
    }
  }

  return slots.map((s) => map.get(s)!);
}
