"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NEON_COLORS } from "@/lib/types";

const ASCII_TITLE = `
 ██╗  ██╗ █████╗  ██████╗██╗  ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗
 ██║  ██║██╔══██╗██╔════╝██║ ██╔╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
 ███████║███████║██║     █████╔╝    ██║   ██████╔╝███████║██║     █████╔╝
 ██╔══██║██╔══██║██║     ██╔═██╗    ██║   ██╔══██╗██╔══██║██║     ██╔═██╗
 ██║  ██║██║  ██║╚██████╗██║  ██╗   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
 ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`;

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [color, setColor] = useState<string>(NEON_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { name, pin, color }
        : { name, pin };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "[ERR] Unknown error");
        return;
      }

      // Organizers go to their own dashboard; members go to /dashboard
      // (which redirects to /join if they have no team yet)
      const role = data.user?.role;
      if (role === "ORGANIZER" || role === "SUPERADMIN") {
        router.push("/organizer");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("[ERR] Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <pre className="text-primary glow text-[0.35rem] sm:text-[0.5rem] md:text-xs leading-tight text-center mb-8 select-none overflow-x-auto max-w-full">
        {ASCII_TITLE}
      </pre>

      <div className="w-full max-w-md">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { setIsRegister(false); setError(""); }}
            className={`text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              !isRegister ? "text-primary glow-sm" : "text-text-muted hover:text-primary"
            }`}
          >
            /login
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(""); }}
            className={`text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              isRegister ? "text-primary glow-sm" : "text-text-muted hover:text-primary"
            }`}
          >
            /register
          </button>
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
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="****"
              required
              maxLength={4}
              className="w-full px-0 py-2 text-lg tracking-[0.5em]"
            />
          </div>

          {isRegister && (
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
                      boxShadow: color === c ? `0 0 15px ${c}, 0 0 30px ${c}` : "none",
                      border: color === c ? "2px solid white" : "2px solid transparent",
                      transform: color === c ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neon-border w-full rounded py-3 text-primary uppercase tracking-widest text-sm font-bold cursor-pointer hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading
              ? "[ PROCESSING... ]"
              : isRegister
              ? "[ REGISTER ]"
              : "[ AUTHENTICATE ]"}
          </button>
        </form>

        <p className="text-text-muted text-xs text-center mt-8">
          SYSTEM v2.0 // HACKATHON FUEL TRACKER
        </p>
        <p className="text-text-muted text-xs text-center mt-2">
          <a href="/register-organizer" className="hover:text-primary transition-colors">
            ORGANIZER? →
          </a>
        </p>
      </div>
    </div>
  );
}
