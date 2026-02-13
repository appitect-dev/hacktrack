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
      <div className="flex items-center gap-1">
        <button
          onClick={() => submit(-1)}
          disabled={loading}
          className="neon-border rounded-lg px-4 py-5 uppercase tracking-widest text-xl font-black cursor-pointer transition-all hover:bg-red-500/10 active:scale-95 disabled:opacity-50"
          style={{ color: definition.color, borderColor: definition.color }}
        >
          -
        </button>
        <button
          onClick={() => submit(1)}
          disabled={loading}
          className="neon-border rounded-lg px-10 py-5 uppercase tracking-widest text-xl font-black cursor-pointer transition-all hover:bg-primary/10 active:scale-95 disabled:opacity-50"
          style={{ color: definition.color, borderColor: definition.color }}
        >
          {loading ? "[ ... ]" : `[ + ${definition.name} ]`}
        </button>
      </div>
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
      className="flex items-center gap-4"
    >
      <span className="text-text-muted text-xl font-black">&gt;</span>
      <span
        className="text-lg font-black uppercase tracking-widest"
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
        className="w-28 text-center text-xl font-black tabular-nums"
      />
      <button
        type="submit"
        disabled={loading}
        className="neon-border rounded-lg px-6 py-3 uppercase tracking-widest text-base font-black cursor-pointer hover:bg-primary/10 disabled:opacity-50"
        style={{ color: definition.color, borderColor: definition.color }}
      >
        {loading ? "[...]" : "[ LOG ]"}
      </button>
      {error && <span className="text-red-500 text-base font-black">{error}</span>}
    </form>
  );
}
