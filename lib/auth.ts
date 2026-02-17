import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload, Role } from "./types";

const COOKIE_NAME = "htrack-session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "hacktrack-fallback-secret"
);

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function hasRole(session: SessionPayload | null, ...roles: Role[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}

export function isOrganizer(session: SessionPayload | null): boolean {
  return hasRole(session, "ORGANIZER", "SUPERADMIN");
}

export function isSuperadmin(session: SessionPayload | null): boolean {
  return hasRole(session, "SUPERADMIN");
}
