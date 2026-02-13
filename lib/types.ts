export type InputType = "COUNTER" | "NUMBER";

export interface MetricDefinition {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  inputType: InputType;
  unit: string;
  isDefault: boolean;
}

export interface UserStats {
  id: string;
  name: string;
  color: string;
  metrics: Record<string, number>;
  caffeineScore: number;
}

export interface MetricEntry {
  id: string;
  type: string;
  value: number;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  name: string;
  color: string;
}

export const NEON_COLORS = [
  "#00ff41", // matrix green
  "#00ffff", // cyan
  "#ff00ff", // magenta
  "#ffff00", // yellow
  "#ff8800", // orange
  "#ff0040", // red
  "#8800ff", // purple
  "#00ff88", // mint
] as const;
