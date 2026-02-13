"use client";

import { useState, useEffect, useCallback } from "react";
import { AsciiHeader } from "@/components/ascii-header";
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
      <div className="flex items-center justify-center h-64">
        <span className="text-primary glow-sm cursor-blink">LOADING DATA</span>
      </div>
    );
  }

  const counters = definitions.filter((d) => d.inputType === "COUNTER");
  const numbers = definitions.filter((d) => d.inputType === "NUMBER");

  return (
    <div className="flex flex-col gap-3 h-full">
      <AsciiHeader title="PERSONAL TRACKING" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      <div className="neon-border rounded p-3 space-y-3 shrink-0">
        <div className="text-text-muted text-xs font-bold uppercase tracking-widest">
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

      <NewItemForm onCreated={handleSuccess} />

      <div className="neon-border rounded p-3 shrink-0">
        <div className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">
          &gt; RECENT LOG [{recent.length} ENTRIES]
        </div>
        {recent.length === 0 ? (
          <div className="text-text-muted text-sm text-center py-2">
            [NO ENTRIES]
          </div>
        ) : (
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {recent.map((entry) => {
              const def = definitions.find((d) => d.slug === entry.type);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 text-sm font-bold py-1 border-b border-dim"
                >
                  <span className="text-text-muted text-xs font-bold tabular-nums">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                  <span
                    className="uppercase tracking-widest text-xs font-bold"
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
    </div>
  );
}
