import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json(
        { error: "[ERR] Name and PIN required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().toUpperCase();

    const user = await prisma.user.findUnique({
      where: { name: trimmedName },
    });

    if (!user) {
      return NextResponse.json(
        { error: "[ERR] Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(pin, user.pinHash);
    if (!valid) {
      return NextResponse.json(
        { error: "[ERR] Invalid credentials" },
        { status: 401 }
      );
    }

    // Resolve active team/hackathon context for session
    const membership = await prisma.teamMembership.findFirst({
      where: { userId: user.id },
      include: { team: { select: { hackathonId: true } } },
      orderBy: { joinedAt: "desc" },
    });

    const token = await createSession({
      userId: user.id,
      name: user.name,
      color: user.color,
      role: user.role,
      teamId: membership?.teamId ?? null,
      hackathonId: membership?.team.hackathonId ?? null,
    });

    const response = NextResponse.json({
      message: "[OK] Logged in",
      user: { id: user.id, name: user.name, color: user.color, role: user.role },
    });
    response.cookies.set(setSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "[ERR] Login failed" },
      { status: 500 }
    );
  }
}
