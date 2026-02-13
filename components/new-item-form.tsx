"use client";

import { useState } from "react";
import { MetricDefinition } from "@/lib/types";

interface NewItemFormProps {
  onCreated: () => void;
  definitions?: MetricDefinition[];
}

const ITEM_COLORS = [
  "#f87171",
  "#facc15",
  "#22d3ee",
  "#a855f7",
  "#00ff41",
  "#ff00ff",
  "#ff8800",
  "#00ff88",
];

export function NewItemForm({ onCreated, definitions = [] }: NewItemFormProps) {
  const [mode, setMode] = useState<"closed" | "new" | "edit">("closed");
  const [editId, setEditId] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(ITEM_COLORS[0]);
  const [inputType, setInputType] = useState<"COUNTER" | "NUMBER">("COUNTER");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setEditId("");
    setSlug("");
    setName("");
    setColor(ITEM_COLORS[0]);
    setInputType("COUNTER");
    setUnit("");
    setError("");
  }

  function startEdit(def: MetricDefinition) {
    setMode("edit");
    setEditId(def.id);
    setSlug(def.slug);
    setName(def.name);
    setColor(def.color);
    setInputType(def.inputType);
    setUnit(def.unit);
    setError("");
  }

  function startNew() {
    resetForm();
    setMode("new");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "new" && (!slug || !name)) {
      setError("[ERR] Slug and name required");
      return;
    }
    if (mode === "edit" && !name) {
      setError("[ERR] Name required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "new") {
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
      } else {
        const res = await fetch("/api/definitions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, name, color, inputType, unit }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "[ERR] Failed");
          return;
        }
      }

      resetForm();
      setMode("closed");
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="neon-border rounded p-3">
      {mode === "closed" && (
        <div className="flex gap-4">
          <button
            onClick={startNew}
            className="text-text-muted text-sm font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
          >
            &gt; [+] NEW ITEM
          </button>
          {definitions.length > 0 && (
            <button
              onClick={() => setMode("edit")}
              className="text-text-muted text-sm font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
            >
              [EDIT]
            </button>
          )}
        </div>
      )}

      {mode === "edit" && !editId && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-sm font-black uppercase tracking-widest">
              &gt; SELECT ITEM TO EDIT
            </span>
            <button
              onClick={() => setMode("closed")}
              className="text-text-muted text-sm font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
            >
              [CLOSE]
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {definitions.map((def) => (
              <button
                key={def.id}
                onClick={() => startEdit(def)}
                className="neon-border rounded px-4 py-2 text-sm font-black uppercase tracking-widest cursor-pointer hover:bg-primary/10 transition-all"
                style={{ color: def.color, borderColor: def.color }}
              >
                {def.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {(mode === "new" || (mode === "edit" && editId)) && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm font-black uppercase tracking-widest">
              &gt; {mode === "new" ? "NEW ITEM" : `EDIT: ${slug}`}
            </span>
            <button
              type="button"
              onClick={() => { resetForm(); setMode("closed"); }}
              className="text-text-muted text-sm font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
            >
              [CLOSE]
            </button>
          </div>

          <div className="flex gap-4 items-end flex-wrap">
            {mode === "new" && (
              <div>
                <label className="text-text-muted text-xs font-black uppercase tracking-widest block mb-1">
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
                  className="w-40 px-0 py-1 text-sm uppercase font-black"
                />
              </div>
            )}
            <div>
              <label className="text-text-muted text-xs font-black uppercase tracking-widest block mb-1">
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="ENERGY DRINK"
                maxLength={30}
                className="w-40 px-0 py-1 text-sm uppercase font-black"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs font-black uppercase tracking-widest block mb-1">
                UNIT
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cans"
                maxLength={10}
                className="w-20 px-0 py-1 text-sm font-black"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputType("COUNTER")}
                className={`text-xs font-black uppercase tracking-widest cursor-pointer transition-colors px-3 py-1.5 rounded ${
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
                className={`text-xs font-black uppercase tracking-widest cursor-pointer transition-colors px-3 py-1.5 rounded ${
                  inputType === "NUMBER"
                    ? "text-primary neon-border"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                NUMBER
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {ITEM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 10px ${c}` : "none",
                    border: color === c ? "2px solid white" : "2px solid transparent",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-border rounded px-6 py-2 text-primary uppercase tracking-widest text-sm font-black cursor-pointer hover:bg-primary/10 disabled:opacity-50 transition-all"
            >
              {loading
                ? "[ ... ]"
                : mode === "new"
                ? "[ CREATE ]"
                : "[ SAVE ]"}
            </button>
          </div>

          {error && <div className="text-red-500 text-sm font-black">{error}</div>}
        </form>
      )}
    </div>
  );
}
