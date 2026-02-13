"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NEON_COLORS } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "");
        setColor(data.color || NEON_COLORS[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const body: Record<string, string> = { name, color };
      if (pin) body.pin = pin;

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "[ERR] Failed");
        return;
      }

      setMessage("[OK] PROFILE UPDATED");
      setPin("");
      // Refresh to pick up new session
      router.refresh();
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-primary text-2xl glow-sm cursor-blink font-black">
          LOADING
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-lg">
        <pre className="text-primary glow-sm text-lg font-black leading-tight mb-6">
          +------------------+{"\n"}| EDIT PROFILE     |{"\n"}+------------------+
        </pre>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-text-muted text-sm font-black uppercase tracking-widest block mb-2">
              &gt; HANDLE
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              maxLength={20}
              className="w-full px-0 py-2 text-xl uppercase font-black"
            />
          </div>

          <div>
            <label className="text-text-muted text-sm font-black uppercase tracking-widest block mb-2">
              &gt; NEW PIN [LEAVE EMPTY TO KEEP]
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="****"
              maxLength={4}
              className="w-full px-0 py-2 text-xl tracking-[0.5em] font-black"
            />
          </div>

          <div>
            <label className="text-text-muted text-sm font-black uppercase tracking-widest block mb-2">
              &gt; NEON COLOR
            </label>
            <div className="flex gap-3 flex-wrap">
              {NEON_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c ? `0 0 15px ${c}, 0 0 30px ${c}` : "none",
                    border:
                      color === c
                        ? "3px solid white"
                        : "3px solid transparent",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-base font-black">{error}</div>
          )}
          {message && (
            <div className="text-primary text-base font-black glow-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neon-border w-full rounded py-3 text-primary uppercase tracking-widest text-base font-black cursor-pointer hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {saving ? "[ SAVING... ]" : "[ SAVE CHANGES ]"}
          </button>
        </form>
      </div>
    </div>
  );
}
