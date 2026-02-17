"use client";

import { useState } from "react";

interface Props {
  inviteCode: string;
  teamName: string;
  teamColor: string;
  hackathonName: string;
  memberCount: number;
  hackathonEndAt: string;
}

export function JoinConfirm({
  inviteCode,
  teamName,
  teamColor,
  hackathonName,
  memberCount,
  hackathonEndAt,
}: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endDate = new Date(hackathonEndAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleJoin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <div className="text-primary glow-sm text-2xl font-black tracking-widest mb-1">
            HACKTRACK
          </div>
          <div className="text-text-muted text-xs uppercase tracking-widest">
            &gt; TEAM INVITE
          </div>
        </div>

        <div className="neon-border rounded p-6 space-y-5">
          <div>
            <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
              HACKATHON
            </div>
            <div className="text-primary font-black tracking-widest text-lg">
              {hackathonName}
            </div>
          </div>

          <div>
            <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
              TEAM
            </div>
            <div
              className="font-black tracking-widest text-4xl glow-sm"
              style={{ color: teamColor }}
            >
              {teamName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-muted">
            <div>
              <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
                MEMBERS
              </div>
              <div className="text-primary font-black tabular-nums">
                {memberCount}
              </div>
            </div>
            <div>
              <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
                DEADLINE
              </div>
              <div className="text-primary font-black tabular-nums text-sm">
                {endDate}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm font-black">{error}</div>
        )}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="neon-border w-full rounded py-4 text-primary uppercase tracking-widest text-sm font-bold cursor-pointer hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {loading ? "[ JOINING... ]" : `[ JOIN ${teamName} ]`}
        </button>

        <a
          href="/join"
          className="block text-center text-text-muted text-xs uppercase tracking-widest hover:text-primary transition-colors"
        >
          → ENTER CODE MANUALLY
        </a>
      </div>
    </div>
  );
}
