"use client";

import { useState } from "react";
import { HackathonInfo, MetricDefinition } from "@/lib/types";
import { NEON_COLORS } from "@/lib/types";

interface Team {
  id: string;
  name: string;
  color: string;
  inviteCode: string;
  memberCount: number;
}

interface Props {
  hackathon: HackathonInfo & {
    organizerName: string;
    organizerColor: string;
    teams: Team[];
    definitions: MetricDefinition[];
  };
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#888",
  ACTIVE: "#00ff41",
  ENDED: "#ff8800",
};

export function HackathonDetail({ hackathon: initial }: Props) {
  const [hackathon, setHackathon] = useState(initial);
  const [teams, setTeams] = useState(initial.teams);

  // Team creation form
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState<string>(NEON_COLORS[1]);
  const [teamError, setTeamError] = useState("");
  const [teamSaving, setTeamSaving] = useState(false);

  async function refreshHackathon() {
    const res = await fetch(`/api/hackathon/${hackathon.id}`);
    if (res.ok) {
      const data = await res.json();
      setHackathon(data.hackathon);
      setTeams(data.hackathon.teams);
    }
  }

  async function handleStatusChange(status: string) {
    const label = status === "ACTIVE" ? "ACTIVATE" : "END";
    if (!confirm(`${label} this hackathon?`)) return;

    const res = await fetch(`/api/hackathon/${hackathon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "[ERR] Failed");
      return;
    }
    await refreshHackathon();
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setTeamError("");
    setTeamSaving(true);
    try {
      const res = await fetch(`/api/hackathon/${hackathon.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, color: teamColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTeamError(data.error || "[ERR] Failed");
        return;
      }
      setTeams((prev) => [
        ...prev,
        { ...data.team, memberCount: 0 },
      ]);
      setShowTeamForm(false);
      setTeamName("");
    } catch {
      setTeamError("[ERR] Connection failed");
    } finally {
      setTeamSaving(false);
    }
  }

  const joinBase =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-primary font-black tracking-widest text-2xl glow-sm">
              {hackathon.name}
            </h1>
            <span
              className="text-xs font-black tracking-widest border rounded px-2 py-0.5"
              style={{
                color: STATUS_COLOR[hackathon.status],
                borderColor: STATUS_COLOR[hackathon.status],
              }}
            >
              {hackathon.status}
            </span>
          </div>
          {hackathon.description && (
            <div className="text-text-muted text-sm">{hackathon.description}</div>
          )}
          <div className="text-text-muted text-xs uppercase tracking-widest">
            {new Date(hackathon.startAt).toLocaleString()} →{" "}
            {new Date(hackathon.endAt).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {hackathon.status === "DRAFT" && (
            <button
              onClick={() => handleStatusChange("ACTIVE")}
              className="text-xs font-black uppercase tracking-widest border border-green-500 text-green-400 rounded px-3 py-2 cursor-pointer hover:bg-green-500/10 transition-all"
            >
              ACTIVATE
            </button>
          )}
          {hackathon.status === "ACTIVE" && (
            <button
              onClick={() => handleStatusChange("ENDED")}
              className="text-xs font-black uppercase tracking-widest border border-orange-500 text-orange-400 rounded px-3 py-2 cursor-pointer hover:bg-orange-500/10 transition-all"
            >
              END HACKATHON
            </button>
          )}
          <a
            href={`/live/${hackathon.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black uppercase tracking-widest border border-primary text-primary rounded px-3 py-2 cursor-pointer hover:bg-primary/10 transition-all"
          >
            LIVE VIEW ↗
          </a>
          <a
            href="/organizer"
            className="text-xs font-black uppercase tracking-widest border border-muted text-text-muted rounded px-3 py-2 cursor-pointer hover:text-primary hover:border-primary transition-all"
          >
            ← BACK
          </a>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-black tracking-widest uppercase">
            TEAMS ({teams.length})
          </h2>
          <button
            onClick={() => setShowTeamForm(!showTeamForm)}
            className="neon-border rounded px-3 py-1.5 text-primary text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 transition-all"
          >
            {showTeamForm ? "[ CANCEL ]" : "[ + ADD TEAM ]"}
          </button>
        </div>

        {showTeamForm && (
          <form
            onSubmit={handleCreateTeam}
            className="neon-border rounded p-4 space-y-4"
          >
            <div className="text-text-muted text-xs uppercase tracking-widest">
              &gt; NEW TEAM
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-text-muted text-xs uppercase tracking-widest block mb-1">
                  NAME
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="TEAM ALPHA"
                  required
                  maxLength={40}
                  className="w-full px-0 py-1 text-base uppercase"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
                COLOR
              </label>
              <div className="flex gap-2 flex-wrap">
                {NEON_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTeamColor(c)}
                    className="w-7 h-7 rounded cursor-pointer transition-all"
                    style={{
                      backgroundColor: c,
                      boxShadow:
                        teamColor === c
                          ? `0 0 12px ${c}, 0 0 24px ${c}`
                          : "none",
                      border:
                        teamColor === c
                          ? "2px solid white"
                          : "2px solid transparent",
                      transform: teamColor === c ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
            {teamError && (
              <div className="text-red-500 text-sm font-black">{teamError}</div>
            )}
            <button
              type="submit"
              disabled={teamSaving}
              className="neon-border rounded px-4 py-1.5 text-primary text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-primary/10 disabled:opacity-50 transition-all"
            >
              {teamSaving ? "[ CREATING... ]" : "[ CREATE TEAM ]"}
            </button>
          </form>
        )}

        {teams.length === 0 ? (
          <div className="text-text-muted text-sm uppercase tracking-widest">
            NO TEAMS YET — ADD ONE ABOVE
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => {
              const joinUrl = `${joinBase}/join/${team.inviteCode}`;
              return (
                <div
                  key={team.id}
                  className="neon-border rounded p-4 space-y-2"
                >
                  <div
                    className="font-black tracking-widest text-xl glow-sm"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </div>
                  <div className="text-text-muted text-xs uppercase tracking-widest">
                    {team.memberCount} MEMBER{team.memberCount !== 1 ? "S" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs uppercase tracking-widest">
                      CODE:
                    </span>
                    <span className="text-primary font-black tracking-widest">
                      {team.inviteCode}
                    </span>
                  </div>
                  <div className="text-text-muted text-xs break-all">
                    {joinUrl}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(joinUrl)}
                    className="text-xs font-black uppercase tracking-widest border border-muted text-text-muted rounded px-2 py-1 cursor-pointer hover:text-primary hover:border-primary transition-all"
                  >
                    COPY LINK
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metric definitions */}
      <div className="space-y-3">
        <h2 className="text-primary font-black tracking-widest uppercase">
          METRIC DEFINITIONS ({hackathon.definitions.length})
        </h2>
        {hackathon.definitions.length === 0 ? (
          <div className="text-text-muted text-sm uppercase tracking-widest">
            DEFAULT METRICS WILL BE SEEDED ON ACTIVATION
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {hackathon.definitions.map((d) => (
              <div key={d.id} className="neon-border rounded p-3">
                <div
                  className="font-black tracking-widest text-sm glow-sm"
                  style={{ color: d.color }}
                >
                  {d.name}
                </div>
                <div className="text-text-muted text-xs uppercase tracking-widest mt-1">
                  {d.inputType}
                  {d.unit ? ` · ${d.unit}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
