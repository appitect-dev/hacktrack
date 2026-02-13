"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimelinePoint } from "@/lib/chart-utils";

interface MetricDef {
  slug: string;
  name: string;
  color: string;
}

interface PersonalTimelineChartProps {
  data: TimelinePoint[];
  definitions: MetricDef[];
}

export function PersonalTimelineChart({
  data,
  definitions,
}: PersonalTimelineChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="neon-border rounded p-4 h-full flex flex-col">
      <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-2 shrink-0">
        &gt; 24H TIMELINE
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--muted)"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="hour"
              tick={{
                fill: "var(--foreground)",
                fontSize: 15,
                fontWeight: 900,
                fontFamily: "monospace",
              }}
              stroke="var(--muted)"
              interval={3}
              strokeWidth={2}
            />
            <YAxis
              tick={{
                fill: "var(--foreground)",
                fontSize: 15,
                fontWeight: 900,
                fontFamily: "monospace",
              }}
              stroke="var(--muted)"
              allowDecimals={false}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "2px solid var(--primary)",
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: 900,
                color: "var(--foreground)",
                textTransform: "uppercase",
              }}
              labelFormatter={(v) => String(v)}
            />
            {definitions.map((def) => (
              <Area
                key={def.slug}
                type="monotone"
                dataKey={def.slug}
                name={def.name}
                stroke={def.color}
                fill={def.color}
                fillOpacity={0.2}
                strokeWidth={4}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
