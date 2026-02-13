"use client";

import { useState, useEffect } from "react";

const DEADLINE = new Date("2026-02-14T13:00:00");

export function Countdown() {
  const [remaining, setRemaining] = useState(calcRemaining());

  function calcRemaining() {
    const diff = DEADLINE.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, done: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, done: false };
  }

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

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
