"use client";

import { useState } from "react";
import { MetricDefinition } from "@/lib/types";

interface DynamicMetricInputProps {
  definition: MetricDefinition;
  onSuccess: () => void;
}

export function DynamicMetricInput({
  definition,
  onSuccess,
}: DynamicMetricInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(val: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: definition.slug, value: val }),
      });
      if (res.ok) {
        setValue("");
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "[ERR]");
      }
    } finally {
      setLoading(false);
    }
  }

  if (definition.inputType === "COUNTER") {
    return (
      <button
        onClick={() => submit(1)}
        disabled={loading}
        className="neon-border rounded px-8 py-4 uppercase tracking-widest text-base font-black cursor-pointer transition-all hover:bg-primary/10 active:scale-95 disabled:opacity-50"
        style={{ color: definition.color, borderColor: definition.color }}
      >
        {loading ? "[ ... ]" : `[ + ${definition.name} ]`}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const val = parseFloat(value);
        if (isNaN(val) || val <= 0 || val > 999) {
          setError("[ERR] Enter a valid value");
          return;
        }
        submit(val);
      }}
      className="flex items-center gap-3"
    >
      <span className="text-text-muted text-lg font-bold">&gt;</span>
      <span
        className="text-base font-bold uppercase tracking-widest"
        style={{ color: definition.color }}
      >
        {definition.name}:
      </span>
      <input
        type="number"
        step="0.5"
        min="0.1"
        max="999"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0.0"
        className="w-24 text-center text-lg tabular-nums"
      />
      <button
        type="submit"
        disabled={loading}
        className="neon-border rounded px-5 py-2 uppercase tracking-widest text-sm font-bold cursor-pointer hover:bg-primary/10 disabled:opacity-50"
        style={{ color: definition.color, borderColor: definition.color }}
      >
        {loading ? "[...]" : "[ LOG ]"}
      </button>
      {error && <span className="text-red-500 text-sm font-bold">{error}</span>}
    </form>
  );
}
