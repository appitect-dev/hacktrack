export type InputType = "COUNTER" | "NUMBER";
export type Role = "SUPERADMIN" | "ORGANIZER" | "MEMBER";
export type HackathonStatus = "DRAFT" | "ACTIVE" | "ENDED";
export type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MetricDefinition {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  inputType: InputType;
  unit: string;
  isDefault: boolean;
  hackathonId?: string | null;
}

export interface UserStats {
  id: string;
  name: string;
  color: string;
  metrics: Record<string, number>;
  totalScore: number;
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
  role: Role;
  teamId?: string | null;
  hackathonId?: string | null;
}

export interface TeamInfo {
  id: string;
  name: string;
  color: string;
  inviteCode: string;
  hackathonId: string;
  memberCount: number;
}

export interface HackathonInfo {
  id: string;
  name: string;
  description?: string | null;
  status: HackathonStatus;
  startAt: string;
  endAt: string;
  organizerId: string;
}

export interface MetricProposal {
  id: string;
  name: string;
  slug: string;
  icon: string;
  inputType: InputType;
  unit: string;
  status: ProposalStatus;
  reason?: string | null;
  proposedById: string;
  proposedByName: string;
  proposedByColor: string;
  hackathonId: string;
  definitionId?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
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
