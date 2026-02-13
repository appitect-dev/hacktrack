"use client";

import { useState, useEffect, useCallback } from "react";

export function FullscreenToggle() {
  const [active, setActive] = useState(false);

  const sync = useCallback(() => {
    setActive(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [sync]);

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  return (
    <button
      onClick={toggle}
      className="text-sm uppercase tracking-widest text-text-muted hover:text-primary transition-colors cursor-pointer font-black"
    >
      {active ? "[ EXIT FS ]" : "[ FULLSCREEN ]"}
    </button>
  );
}
