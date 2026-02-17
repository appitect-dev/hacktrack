"use client";

import { useState, useCallback, useEffect } from "react";
import { MetricProposal } from "@/lib/types";

interface Props {
  hackathonId: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-yellow-400 border-yellow-400",
  APPROVED: "text-green-400 border-green-400",
  REJECTED: "text-red-400 border-red-400",
};

export function ProposalsPanel({ hackathonId }: Props) {
  const [proposals, setProposals] = useState<MetricProposal[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProposals = useCallback(async () => {
    const qs = filter === "PENDING" ? "?status=PENDING" : "";
    try {
      const res = await fetch(`/api/proposals${qs}`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
      }
    } catch {
      // ignore
    }
  }, [filter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  async function handleApprove(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "[ERR] Failed");
        return;
      }
      fetchProposals();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "[ERR] Failed");
        return;
      }
      setRejectId(null);
      setRejectReason("");
      fetchProposals();
    } finally {
      setLoading(false);
    }
  }

  // Only show proposals for this hackathon
  const filtered = proposals.filter((p) => p.hackathonId === hackathonId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-primary font-black tracking-widest uppercase">
          METRIC PROPOSALS
        </h2>
        <div className="flex gap-2">
          {(["PENDING", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-black uppercase tracking-widest border rounded px-2 py-0.5 cursor-pointer transition-all ${
                filter === f
                  ? "text-primary border-primary"
                  : "text-text-muted border-muted hover:text-primary hover:border-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={fetchProposals}
          className="text-xs text-text-muted uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
        >
          ↻ REFRESH
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-text-muted text-sm uppercase tracking-widest">
          {filter === "PENDING" ? "NO PENDING PROPOSALS" : "NO PROPOSALS YET"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="neon-border rounded p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-black tracking-widest">
                      {p.name}
                    </span>
                    <span
                      className={`text-xs font-black border rounded px-1.5 py-0.5 uppercase tracking-widest ${STATUS_STYLE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-text-muted text-xs uppercase tracking-widest">
                    {p.inputType}
                    {p.unit ? ` · ${p.unit}` : ""} &nbsp;·&nbsp; by{" "}
                    <span
                      className="font-black"
                      style={{ color: p.proposedByColor }}
                    >
                      {p.proposedByName}
                    </span>
                  </div>
                  {p.reason && (
                    <div className="text-red-400 text-xs">↳ {p.reason}</div>
                  )}
                </div>

                {p.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(p.id)}
                      disabled={loading}
                      className="text-xs font-black uppercase tracking-widest border border-green-500 text-green-400 rounded px-3 py-1 cursor-pointer hover:bg-green-500/10 disabled:opacity-50 transition-all"
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => setRejectId(p.id)}
                      disabled={loading}
                      className="text-xs font-black uppercase tracking-widest border border-red-500 text-red-400 rounded px-3 py-1 cursor-pointer hover:bg-red-500/10 disabled:opacity-50 transition-all"
                    >
                      REJECT
                    </button>
                  </div>
                )}
              </div>

              {rejectId === p.id && (
                <div className="flex gap-2 items-center pt-1 border-t border-muted">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason (optional)"
                    maxLength={100}
                    className="flex-1 px-0 py-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleReject(p.id)}
                    disabled={loading}
                    className="text-xs font-black uppercase tracking-widest border border-red-500 text-red-400 rounded px-3 py-1 cursor-pointer hover:bg-red-500/10 disabled:opacity-50 transition-all"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => { setRejectId(null); setRejectReason(""); }}
                    className="text-xs text-text-muted uppercase tracking-widest cursor-pointer hover:text-primary"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
