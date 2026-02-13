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
      <div className="text-text-muted text-xs uppercase tracking-widest mb-4">
        &gt; TEAM COMPARISON
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--muted)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
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
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: 10,
                textTransform: "uppercase",
              }}
            />
            {definitions.map((def) => (
              <Bar
                key={def.slug}
                dataKey={def.slug}
                name={def.name}
                fill={def.color}
                fillOpacity={0.8}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
