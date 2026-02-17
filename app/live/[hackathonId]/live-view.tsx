"use client";

import { useState, useEffect, useCallback } from "react";
import { Countdown } from "@/components/countdown";

interface MetricDef {
  id: string;
  slug: string;
  name: string;
  color: string;
  inputType: string;
  unit: string;
}

interface MemberStat {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
  metrics: Record<string, number>;
  totalScore: number;
}

interface TeamStat {
  id: string;
  name: string;
  color: string;
  metrics: Record<string, number>;
  totalScore: number;
  members: MemberStat[];
}

interface HackathonInfo {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startAt: string;
  endAt: string;
}

const REFRESH_INTERVAL = 10_000;

export function LiveView({ hackathonId }: { hackathonId: string }) {
  const [hackathon, setHackathon] = useState<HackathonInfo | null>(null);
  const [definitions, setDefinitions] = useState<MetricDef[]>([]);
  const [teams, setTeams] = useState<TeamStat[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${hackathonId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "[ERR] Failed to load");
        return;
      }
      const data = await res.json();
      setHackathon(data.hackathon);
      setDefinitions(data.definitions);
      setTeams(data.teams);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setError("[ERR] Connection failed");
    }
  }, [hackathonId]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-2xl font-black tracking-widest">
          {error}
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-primary text-2xl font-black tracking-widest cursor-blink glow-sm">
          LOADING...
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const updatedStr = lastUpdated
    ? `${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}:${pad(lastUpdated.getSeconds())}`
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Countdown bar */}
      <Countdown endAt={hackathon.endAt} />

      {/* Header */}
      <div className="px-8 py-4 border-b-2 border-muted flex items-center justify-between">
        <div>
          <div className="text-primary glow-sm font-black tracking-widest text-3xl">
            {hackathon.name}
          </div>
          {hackathon.description && (
            <div className="text-text-muted text-sm mt-0.5">
              {hackathon.description}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-text-muted text-xs uppercase tracking-widest">
            LIVE LEADERBOARD
          </div>
          {updatedStr && (
            <div className="text-text-muted text-xs">
              UPDATED {updatedStr}
            </div>
          )}
        </div>
      </div>

      {/* Team leaderboard */}
      <div className="flex-1 px-8 py-6 space-y-4">
        {teams.length === 0 ? (
          <div className="text-text-muted text-xl font-black tracking-widest text-center py-20">
            NO TEAMS YET
          </div>
        ) : (
          teams.map((team, rank) => (
            <div key={team.id} className="neon-border rounded-lg p-5">
              {/* Team row */}
              <div className="flex items-center gap-6 mb-4">
                <div
                  className="text-5xl font-black tabular-nums w-16 text-center shrink-0"
                  style={{ color: rank === 0 ? "#ffff00" : "var(--text-muted)" }}
                >
                  #{rank + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-black tracking-widest text-4xl glow-sm truncate"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </div>
                  <div className="flex gap-4 mt-1">
                    {definitions.map((def) => (
                      <span key={def.slug} className="text-sm font-black">
                        <span
                          className="uppercase tracking-widest"
                          style={{ color: def.color }}
                        >
                          {def.name}
                        </span>
                        <span className="text-primary ml-1 tabular-nums">
                          {def.inputType === "NUMBER"
                            ? (team.metrics[def.slug] || 0).toFixed(1)
                            : team.metrics[def.slug] || 0}
                          {def.unit ? (
                            <span className="text-text-muted text-xs ml-0.5">
                              {def.unit}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className="text-5xl font-black tabular-nums shrink-0 glow-sm"
                  style={{ color: team.color }}
                >
                  {team.totalScore.toFixed(team.totalScore % 1 ? 1 : 0)}
                  <span className="text-text-muted text-xl ml-1">pts</span>
                </div>
              </div>

              {/* Members sub-list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pl-22">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <span
                      className="font-black text-sm uppercase tracking-widest"
                      style={{ color: member.color }}
                    >
                      {member.name}
                      {member.isAdmin && (
                        <span className="text-text-muted ml-1 text-xs">★</span>
                      )}
                    </span>
                    <span className="text-text-muted text-xs tabular-nums">
                      {member.totalScore.toFixed(member.totalScore % 1 ? 1 : 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t-2 border-muted flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-black">
          HACKTRACK
        </span>
        <span className="text-text-muted text-xs uppercase tracking-widest">
          AUTO-REFRESHES EVERY 10s
        </span>
        <span
          className={`text-xs font-black uppercase tracking-widest ${
            hackathon.status === "ACTIVE"
              ? "text-green-400"
              : hackathon.status === "ENDED"
              ? "text-orange-400"
              : "text-text-muted"
          }`}
        >
          {hackathon.status}
        </span>
      </div>
    </div>
  );
}
