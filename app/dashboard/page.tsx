"use client";

import { useState, useEffect, useCallback } from "react";
import { Leaderboard } from "@/components/leaderboard";
import { TeamBarChartWrapper } from "@/components/team-bar-chart-wrapper";
import { UserStats, MetricDefinition } from "@/lib/types";

const POLL_INTERVAL = 5000;

export default function DashboardPage() {
  const [team, setTeam] = useState<UserStats[]>([]);
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setDefinitions(data.definitions);

        const t: Record<string, number> = {};
        for (const def of data.definitions) t[def.slug] = 0;
        for (const user of data.team) {
          for (const def of data.definitions) {
            t[def.slug] += user.metrics[def.slug] || 0;
          }
        }
        setTotals(t);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-primary text-2xl glow-sm cursor-blink font-black">
          LOADING DATA
        </span>
      </div>
    );
  }

  const teamChartData = team.map((u) => ({
    name: u.name,
    ...u.metrics,
  }));

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* LEFT — 75% : totals + chart */}
      <div className="w-3/4 flex flex-col gap-3 min-h-0">
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {definitions.map((def) => (
            <div key={def.slug} className="neon-border rounded p-3 text-center">
              <div className="text-text-muted text-sm font-black uppercase tracking-widest">
                TOTAL {def.name}
              </div>
              <div
                className="text-4xl font-black tabular-nums glow-sm"
                style={{ color: def.color }}
              >
                {def.inputType === "NUMBER"
                  ? (totals[def.slug] || 0).toFixed(1)
                  : totals[def.slug] || 0}
                {def.unit ? (
                  <span className="text-lg font-black text-text-muted ml-1">
                    {def.unit}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <TeamBarChartWrapper data={teamChartData} definitions={definitions} />
        </div>

      </div>

      {/* RIGHT — 25% : leaderboard */}
      <div className="w-1/4 min-h-0 overflow-auto neon-border rounded p-3">
        <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-3">
          LEADERBOARD
        </div>
        <Leaderboard team={team} definitions={definitions} />
      </div>
    </div>
  );
}
