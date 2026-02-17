"use client";

import { useState } from "react";

export function JoinForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 4) {
      setError("[ERR] Code must be exactly 4 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "[ERR] Unknown error");
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
          &gt; INVITE CODE [4 CHARS]
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 4)
            )
          }
          placeholder="XXXX"
          required
          maxLength={4}
          className="w-full px-0 py-2 text-5xl uppercase tracking-[0.5em] font-black text-primary"
          autoFocus
        />
      </div>

      {error && <div className="text-red-500 text-sm font-black">{error}</div>}

      <button
        type="submit"
        disabled={loading || code.length !== 4}
        className="neon-border w-full rounded py-3 text-primary uppercase tracking-widest text-sm font-bold cursor-pointer hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 transition-all"
      >
        {loading ? "[ JOINING... ]" : "[ JOIN TEAM ]"}
      </button>
    </form>
  );
}
