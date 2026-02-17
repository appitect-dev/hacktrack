"use client";

import { useState, useEffect } from "react";

interface Props {
  endAt?: string; // ISO string
}

export function Countdown({ endAt }: Props) {
  const deadline = endAt ? new Date(endAt) : null;
  const [remaining, setRemaining] = useState(calcRemaining());

  function calcRemaining() {
    if (!deadline) return { h: 0, m: 0, s: 0, done: true };
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, done: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, done: false };
  }

  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  if (!deadline) return null;

  if (remaining.done) {
    return (
      <div className="shrink-0 text-center py-1 border-b-2 border-red-500">
        <span className="text-red-500 text-4xl font-black tracking-widest glow uppercase">
          TIME IS UP
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="shrink-0 text-center py-1 border-b-2 border-muted">
      <span className="text-text-muted text-xl font-black uppercase tracking-widest">
        DEADLINE{" "}
      </span>
      <span className="text-primary text-5xl font-black tabular-nums glow-sm tracking-wider">
        {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
      </span>
      <span className="text-text-muted text-xl font-black uppercase tracking-widest">
        {" "}REMAINING
      </span>
    </div>
  );
}
