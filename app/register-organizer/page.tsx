"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NEON_COLORS } from "@/lib/types";

export default function RegisterOrganizerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [color, setColor] = useState<string>(NEON_COLORS[4]); // orange default for organizers
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin, color, organizerSecret: secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "[ERR] Unknown error");
        return;
      }
      router.push("/organizer");
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-primary glow-sm text-2xl font-black tracking-widest mb-1">
          HACKTRACK
        </div>
        <div className="text-text-muted text-xs uppercase tracking-widest mb-8">
          &gt; ORGANIZER REGISTRATION
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
              &gt; HANDLE
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="YOUR_NAME"
              required
              maxLength={20}
              className="w-full px-0 py-2 text-lg uppercase"
            />
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
              &gt; PIN [4 DIGITS]
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="****"
              required
              maxLength={4}
              className="w-full px-0 py-2 text-lg tracking-[0.5em]"
            />
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
              &gt; NEON COLOR
            </label>
            <div className="flex gap-2 flex-wrap">
              {NEON_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c ? `0 0 15px ${c}, 0 0 30px ${c}` : "none",
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

          <div>
            <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
              &gt; ORGANIZER SECRET
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-0 py-2 text-lg"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-black">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neon-border w-full rounded py-3 text-primary uppercase tracking-widest text-sm font-bold cursor-pointer hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? "[ PROCESSING... ]" : "[ REGISTER AS ORGANIZER ]"}
          </button>
        </form>

        <p className="text-text-muted text-xs text-center mt-8">
          <a
            href="/login"
            className="hover:text-primary transition-colors uppercase tracking-widest"
          >
            ← BACK TO LOGIN
          </a>
        </p>
      </div>
    </div>
  );
}
