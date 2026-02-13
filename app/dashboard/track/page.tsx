"use client";

import { useState, useEffect, useCallback } from "react";
import { AsciiHeader } from "@/components/ascii-header";
import { StatCard } from "@/components/stat-card";
import { DynamicMetricInput } from "@/components/dynamic-metric-input";
import { NewItemForm } from "@/components/new-item-form";
import { PersonalTimelineChart } from "@/components/personal-timeline-chart";
import { MetricEntry, MetricDefinition } from "@/lib/types";
import { TimelinePoint } from "@/lib/chart-utils";

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
  }, [fetchData]);

  function handleSuccess() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-primary glow-sm cursor-blink">
          LOADING DATA
        </span>
      </div>
    );
  }

  const counters = definitions.filter((d) => d.inputType === "COUNTER");
  const numbers = definitions.filter((d) => d.inputType === "NUMBER");

  return (
    <div className="space-y-8">
      <AsciiHeader title="PERSONAL TRACKING" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

      <PersonalTimelineChart data={timeline} definitions={definitions} />

      <div className="neon-border rounded p-6 space-y-6">
        <div className="text-text-muted text-xs uppercase tracking-widest">
          &gt; LOG CONSUMPTION
        </div>
        <div className="flex flex-wrap gap-4">
          {counters.map((def) => (
            <DynamicMetricInput
              key={def.slug}
              definition={def}
              onSuccess={handleSuccess}
            />
          ))}
        </div>
        {numbers.map((def) => (
          <DynamicMetricInput
            key={def.slug}
            definition={def}
            onSuccess={handleSuccess}
          />
        ))}
      </div>

      <NewItemForm onCreated={handleSuccess} />

      <div className="neon-border rounded p-6">
        <div className="text-text-muted text-xs uppercase tracking-widest mb-4">
          &gt; RECENT LOG [{recent.length} ENTRIES]
        </div>
        {recent.length === 0 ? (
          <div className="text-text-muted text-sm text-center py-4">
            [NO ENTRIES]
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {recent.map((entry) => {
              const def = definitions.find((d) => d.slug === entry.type);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 text-sm py-1 border-b border-dim"
                >
                  <span className="text-text-muted text-xs tabular-nums">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                  <span
                    className="uppercase tracking-widest text-xs"
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
