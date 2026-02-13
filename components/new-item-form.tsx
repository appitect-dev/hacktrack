"use client";

import { useState } from "react";

interface NewItemFormProps {
  onCreated: () => void;
}

const ITEM_COLORS = [
  "#f87171",
  "#facc15",
  "#22d3ee",
  "#00ff41",
  "#ff00ff",
  "#ff8800",
  "#8800ff",
  "#00ff88",
];

export function NewItemForm({ onCreated }: NewItemFormProps) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(ITEM_COLORS[0]);
  const [inputType, setInputType] = useState<"COUNTER" | "NUMBER">("COUNTER");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!slug || !name) {
      setError("[ERR] Slug and name required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, color, inputType, unit }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "[ERR] Failed");
        return;
      }
      setSlug("");
      setName("");
      setUnit("");
      setOpen(false);
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="neon-border rounded p-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-text-muted text-xs uppercase tracking-widest cursor-pointer hover:text-primary transition-colors w-full text-left"
      >
        &gt; {open ? "[-] CLOSE" : "[+] NEW TRACKABLE ITEM"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                SLUG
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))
                }
                placeholder="ENERGY_DRINK"
                maxLength={30}
                className="w-full px-0 py-1 text-sm uppercase"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="ENERGY DRINK"
                maxLength={30}
                className="w-full px-0 py-1 text-sm uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                TYPE
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setInputType("COUNTER")}
                  className={`text-xs uppercase tracking-widest cursor-pointer transition-colors px-2 py-1 rounded ${
                    inputType === "COUNTER"
                      ? "text-primary neon-border"
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  COUNTER
                </button>
                <button
                  type="button"
                  onClick={() => setInputType("NUMBER")}
                  className={`text-xs uppercase tracking-widest cursor-pointer transition-colors px-2 py-1 rounded ${
                    inputType === "NUMBER"
                      ? "text-primary neon-border"
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  NUMBER
                </button>
              </div>
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                UNIT
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cans"
                maxLength={10}
                className="w-24 px-0 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
              COLOR
            </label>
            <div className="flex gap-2">
              {ITEM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c ? `0 0 10px ${c}` : "none",
                    border:
                      color === c
                        ? "2px solid white"
                        : "2px solid transparent",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <div className="text-red-500 text-xs">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="neon-border rounded px-6 py-2 text-primary uppercase tracking-widest text-xs font-bold cursor-pointer hover:bg-primary/10 disabled:opacity-50 transition-all"
          >
            {loading ? "[ CREATING... ]" : "[ CREATE ITEM ]"}
          </button>
        </form>
      )}
    </div>
  );
}
