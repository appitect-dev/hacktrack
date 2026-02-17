"use client";

import { useState } from "react";
import { HackathonInfo } from "@/lib/types";
import { NEON_COLORS } from "@/lib/types";

interface HackathonWithCount extends HackathonInfo {
  teamCount: number;
}

interface Props {
  initial: HackathonWithCount[];
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#888",
  ACTIVE: "#00ff41",
  ENDED: "#ff8800",
};

export function HackathonList({ initial }: Props) {
  const [hackathons, setHackathons] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startAt: "",
    endAt: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/hackathon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "[ERR] Failed");
        return;
      }
      // Refresh list
      const listRes = await fetch("/api/hackathon");
      if (listRes.ok) {
        const listData = await listRes.json();
        setHackathons(listData.hackathons);
      }
      setShowForm(false);
      setForm({ name: "", description: "", startAt: "", endAt: "" });
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id: string) {
    const res = await fetch(`/api/hackathon/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "[ERR] Failed");
      return;
    }
    const listRes = await fetch("/api/hackathon");
    if (listRes.ok) {
      const listData = await listRes.json();
      setHackathons(listData.hackathons);
    }
  }

  async function handleEnd(id: string) {
    if (!confirm("Mark this hackathon as ENDED?")) return;
    const res = await fetch(`/api/hackathon/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ENDED" }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "[ERR] Failed");
      return;
    }
    const listRes = await fetch("/api/hackathon");
    if (listRes.ok) {
      const listData = await listRes.json();
      setHackathons(listData.hackathons);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-primary font-black tracking-widest text-2xl glow-sm">
          HACKATHONS
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="neon-border rounded px-4 py-2 text-primary text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 transition-all"
        >
          {showForm ? "[ CANCEL ]" : "[ + NEW ]"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="neon-border rounded p-5 space-y-4"
        >
          <div className="text-text-muted text-xs uppercase tracking-widest mb-2">
            &gt; CREATE HACKATHON
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
              NAME
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="MY HACKATHON 2026"
              required
              maxLength={60}
              className="w-full px-0 py-1 text-base uppercase"
            />
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
              DESCRIPTION (OPTIONAL)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description..."
              className="w-full px-0 py-1 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                START
              </label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
                className="w-full px-0 py-1 text-base"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                END
              </label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                required
                className="w-full px-0 py-1 text-base"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-black">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neon-border rounded px-4 py-2 text-primary text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 disabled:opacity-50 transition-all"
          >
            {saving ? "[ CREATING... ]" : "[ CREATE ]"}
          </button>
        </form>
      )}

      {hackathons.length === 0 ? (
        <div className="text-text-muted text-sm uppercase tracking-widest">
          NO HACKATHONS YET
        </div>
      ) : (
        <div className="space-y-3">
          {hackathons.map((h) => (
            <div key={h.id} className="neon-border rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/organizer/${h.id}`}
                      className="text-primary font-black tracking-widest text-lg hover:underline"
                    >
                      {h.name}
                    </a>
                    <span
                      className="text-xs font-black tracking-widest border rounded px-2 py-0.5"
                      style={{
                        color: STATUS_COLOR[h.status],
                        borderColor: STATUS_COLOR[h.status],
                      }}
                    >
                      {h.status}
                    </span>
                  </div>
                  {h.description && (
                    <div className="text-text-muted text-sm">{h.description}</div>
                  )}
                  <div className="text-text-muted text-xs uppercase tracking-widest">
                    {new Date(h.startAt).toLocaleDateString()} →{" "}
                    {new Date(h.endAt).toLocaleDateString()} &nbsp;·&nbsp;{" "}
                    {h.teamCount} TEAM{h.teamCount !== 1 ? "S" : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {h.status === "DRAFT" && (
                    <button
                      onClick={() => handleActivate(h.id)}
                      className="text-xs font-black uppercase tracking-widest border border-green-500 text-green-400 rounded px-3 py-1 cursor-pointer hover:bg-green-500/10 transition-all"
                    >
                      ACTIVATE
                    </button>
                  )}
                  {h.status === "ACTIVE" && (
                    <button
                      onClick={() => handleEnd(h.id)}
                      className="text-xs font-black uppercase tracking-widest border border-orange-500 text-orange-400 rounded px-3 py-1 cursor-pointer hover:bg-orange-500/10 transition-all"
                    >
                      END
                    </button>
                  )}
                  <a
                    href={`/organizer/${h.id}`}
                    className="text-xs font-black uppercase tracking-widest border border-muted text-text-muted rounded px-3 py-1 cursor-pointer hover:text-primary hover:border-primary transition-all"
                  >
                    MANAGE →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
