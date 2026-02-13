"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-xs uppercase tracking-widest text-text-muted hover:text-primary transition-colors cursor-pointer"
    >
      {theme === "dark" ? "[ LIGHT ]" : "[ DARK ]"}
    </button>
  );
}
