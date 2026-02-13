"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MetricDef {
  slug: string;
  name: string;
  color: string;
}

interface TeamMember {
  name: string;
  [slug: string]: string | number;
}

interface TeamBarChartProps {
  data: TeamMember[];
  definitions: MetricDef[];
}

export function TeamBarChart({ data, definitions }: TeamBarChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="neon-border rounded p-6">
      <div className="text-text-muted text-sm font-bold uppercase tracking-widest mb-4">
        &gt; TEAM COMPARISON
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--muted)"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: "var(--foreground)",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "monospace",
              }}
              stroke="var(--muted)"
              strokeWidth={2}
            />
            <YAxis
              tick={{
                fill: "var(--foreground)",
                fontSize: 13,
                fontWeight: 700,
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
                fontSize: 14,
                fontWeight: 700,
                color: "var(--foreground)",
                textTransform: "uppercase",
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            />
            {definitions.map((def) => (
              <Bar
                key={def.slug}
                dataKey={def.slug}
                name={def.name}
                fill={def.color}
                fillOpacity={0.9}
                stroke={def.color}
                strokeWidth={2}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
