"use client";

import { useState, useEffect, useCallback } from "react";

export function FullscreenToggle() {
  const [active, setActive] = useState(false);

  const sync = useCallback(() => {
    setActive(!!document.fullscreenElement);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", sync);

    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "f" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("keydown", handleKey);
    };
  }, [sync, toggle]);

  return (
    <button
      onClick={toggle}
      className="text-sm uppercase tracking-widest text-text-muted hover:text-primary transition-colors cursor-pointer font-black"
    >
      {active ? "[ EXIT FS ]" : "[ FULLSCREEN ]"}
    </button>
  );
}
