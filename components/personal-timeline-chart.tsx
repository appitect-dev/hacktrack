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
    <div className="neon-border rounded p-6">
      <div className="text-text-muted text-xs uppercase tracking-widest mb-4">
        &gt; 7-DAY TIMELINE
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--muted)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
              tickFormatter={(v: string) => v.slice(5)}
              stroke="var(--muted)"
            />
            <YAxis
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
              stroke="var(--muted)"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--primary)",
                fontFamily: "monospace",
                fontSize: 11,
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
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
