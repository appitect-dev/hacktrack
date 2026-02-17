// Shared utilities for hackathon setup — imported by both seed.ts and API routes

export const DEFAULT_METRIC_TEMPLATES = [
  {
    slug: "RED_BULL",
    name: "RED BULL",
    icon: "///",
    color: "#f87171",
    inputType: "COUNTER" as const,
    unit: "cans",
    isDefault: true,
  },
  {
    slug: "COFFEE",
    name: "COFFEE",
    icon: "///",
    color: "#facc15",
    inputType: "COUNTER" as const,
    unit: "cups",
    isDefault: true,
  },
  {
    slug: "SLEEP",
    name: "SLEEP",
    icon: "///",
    color: "#a855f7",
    inputType: "NUMBER" as const,
    unit: "hrs",
    isDefault: true,
  },
  {
    slug: "COMMITS",
    name: "COMMITS",
    icon: "///",
    color: "#00ff41",
    inputType: "COUNTER" as const,
    unit: "",
    isDefault: true,
  },
];

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomInviteCode(): string {
  return Array.from({ length: 4 }, () =>
    INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
  ).join("");
}
