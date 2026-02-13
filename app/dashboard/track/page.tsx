"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/stat-card";
import { DynamicMetricInput } from "@/components/dynamic-metric-input";
import { NewItemForm } from "@/components/new-item-form";
import { PersonalTimelineChart } from "@/components/personal-timeline-chart";
import { MetricEntry, MetricDefinition } from "@/lib/types";
import type { TimelinePoint } from "@/lib/chart-utils";

const POLL_INTERVAL = 5000;

export default function TrackPage() {
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<MetricEntry[]>([]);
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics");
      if (res.ok) {
        const data = await res.json();
        setTotals(data.totals);
        setRecent(data.recent);
        setDefinitions(data.definitions);
        setTimeline(data.timeline);
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

  function handleSuccess() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-primary text-2xl glow-sm cursor-blink font-black">
          LOADING DATA
        </span>
      </div>
    );
  }

  const counters = definitions.filter((d) => d.inputType === "COUNTER");
  const numbers = definitions.filter((d) => d.inputType === "NUMBER");

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* LEFT — chart + stats */}
      <div className="w-3/4 flex flex-col gap-3 min-h-0">
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {definitions.map((def) => (
            <StatCard
              key={def.slug}
              icon={def.icon}
              label={def.name}
              value={
                def.inputType === "NUMBER"
                  ? Number((totals[def.slug] || 0).toFixed(1))
                  : totals[def.slug] || 0
              }
              unit={def.unit}
              color={def.color}
            />
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <PersonalTimelineChart data={timeline} definitions={definitions} />
        </div>

        <div className="neon-border rounded p-3 shrink-0">
          <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-2">
            &gt; LOG CONSUMPTION
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {counters.map((def) => (
              <DynamicMetricInput
                key={def.slug}
                definition={def}
                onSuccess={handleSuccess}
              />
            ))}
            {numbers.map((def) => (
              <DynamicMetricInput
                key={def.slug}
                definition={def}
                onSuccess={handleSuccess}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — recent log + new item */}
      <div className="w-1/4 flex flex-col gap-3 min-h-0">
        <div className="neon-border rounded p-3 flex-1 min-h-0 flex flex-col">
          <div className="text-text-muted text-sm font-black uppercase tracking-widest mb-2 shrink-0">
            &gt; RECENT [{recent.length}]
          </div>
          {recent.length === 0 ? (
            <div className="text-text-muted text-base font-bold text-center py-4">
              [NO ENTRIES]
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
              {recent.map((entry) => {
                const def = definitions.find((d) => d.slug === entry.type);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-sm font-black py-1 border-b border-dim"
                  >
                    <span
                      className="uppercase tracking-wide"
                      style={{ color: def?.color || "var(--primary)" }}
                    >
                      {def?.name || entry.type}
                    </span>
                    <span className="text-primary tabular-nums">
                      +{entry.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <NewItemForm onCreated={handleSuccess} definitions={definitions} />
      </div>
    </div>
  );
}
