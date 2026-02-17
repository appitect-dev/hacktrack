"use client";

import { useState, useCallback, useEffect } from "react";
import { MetricProposal } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-yellow-400 border-yellow-400",
  APPROVED: "text-green-400 border-green-400",
  REJECTED: "text-red-400 border-red-400",
};

export function ProposeMetric() {
  const [proposals, setProposals] = useState<MetricProposal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", inputType: "COUNTER", unit: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "[ERR] Failed");
        return;
      }
      setShowForm(false);
      setForm({ name: "", inputType: "COUNTER", unit: "" });
      fetchProposals();
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="neon-border rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-text-muted text-sm font-black uppercase tracking-widest">
          &gt; PROPOSE METRIC
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="text-xs font-black uppercase tracking-widest border border-muted text-text-muted rounded px-2 py-0.5 cursor-pointer hover:text-primary hover:border-primary transition-all"
        >
          {showForm ? "CANCEL" : "+ NEW"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
              NAME
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="WATER_BOTTLES"
              required
              maxLength={30}
              className="w-full px-0 py-1 text-sm uppercase"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                TYPE
              </label>
              <select
                value={form.inputType}
                onChange={(e) => setForm({ ...form, inputType: e.target.value })}
                className="w-full px-0 py-1 text-sm bg-transparent uppercase"
              >
                <option value="COUNTER">COUNTER</option>
                <option value="NUMBER">NUMBER</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                UNIT
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="bottles"
                maxLength={10}
                className="w-full px-0 py-1 text-sm"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-xs font-black">{error}</div>
          )}
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="neon-border rounded px-3 py-1 text-primary text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 disabled:opacity-50 transition-all"
          >
            {saving ? "[ SUBMITTING... ]" : "[ SUBMIT ]"}
          </button>
        </form>
      )}

      {proposals.length > 0 && (
        <div className="space-y-1.5">
          {proposals.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-primary text-xs font-black uppercase tracking-widest truncate">
                {p.name}
                {p.unit ? ` (${p.unit})` : ""}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-black border rounded px-1.5 py-0.5 uppercase tracking-widest ${STATUS_STYLE[p.status]}`}
                >
                  {p.status}
                </span>
                {p.status === "REJECTED" && p.reason && (
                  <span className="text-text-muted text-xs" title={p.reason}>
                    ↳ {p.reason.slice(0, 20)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {proposals.length === 0 && !showForm && (
        <div className="text-text-muted text-xs uppercase tracking-widest">
          NO PROPOSALS YET
        </div>
      )}
    </div>
  );
}
